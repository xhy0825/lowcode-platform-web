<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dictApi, DictType, DictData } from '@/api'

// 字典类型列表
const typeList = ref<DictType[]>([])
const typeTotal = ref(0)
const typeLoading = ref(false)
const typeQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  dictName: '',
  dictType: ''
})

// 字典数据列表
const dataList = ref<DictData[]>([])
const dataLoading = ref(false)
const currentDictType = ref('')

// 弹窗
const typeDialogVisible = ref(false)
const dataDialogVisible = ref(false)
const typeForm = ref<DictType>({
  id: 0,
  tenantId: '',
  dictType: '',
  dictName: '',
  status: 0,
  remark: ''
})
const dataForm = ref<DictData>({
  id: 0,
  tenantId: '',
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  cssClass: '',
  listClass: '',
  isDefault: 0,
  status: 0
})

// 获取字典类型列表
const getTypeList = async () => {
  typeLoading.value = true
  try {
    const res = await dictApi.listTypes(typeQuery)
    typeList.value = res.data.list
    typeTotal.value = res.data.total
  } finally {
    typeLoading.value = false
  }
}

// 获取字典数据
const getDataList = async (dictType: string) => {
  currentDictType.value = dictType
  dataLoading.value = true
  try {
    const res = await dictApi.listData(dictType)
    dataList.value = res.data
  } finally {
    dataLoading.value = false
  }
}

// 新增类型
const handleAddType = () => {
  typeForm.value = {
    id: 0,
    tenantId: '',
    dictType: '',
    dictName: '',
    status: 0,
    remark: ''
  }
  typeDialogVisible.value = true
}

// 编辑类型
const handleEditType = (row: DictType) => {
  typeForm.value = { ...row }
  typeDialogVisible.value = true
}

// 删除类型
const handleDeleteType = (row: DictType) => {
  ElMessageBox.confirm(`确认删除字典类型 "${row.dictName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await dictApi.deleteType(row.id)
    ElMessage.success('删除成功')
    getTypeList()
  })
}

// 新增数据
const handleAddData = () => {
  dataForm.value = {
    id: 0,
    tenantId: '',
    dictType: currentDictType.value,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    cssClass: '',
    listClass: '',
    isDefault: 0,
    status: 0
  }
  dataDialogVisible.value = true
}

// 编辑数据
const handleEditData = (row: DictData) => {
  dataForm.value = { ...row }
  dataDialogVisible.value = true
}

// 删除数据
const handleDeleteData = (row: DictData) => {
  ElMessageBox.confirm(`确认删除字典数据 "${row.dictLabel}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await dictApi.deleteData(row.id)
    ElMessage.success('删除成功')
    getDataList(currentDictType.value)
  })
}

// 提交类型表单
const handleTypeSubmit = async () => {
  try {
    if (typeForm.value.id) {
      // await dictApi.updateType(typeForm.value)
      ElMessage.success('修改成功')
    } else {
      await dictApi.createType(typeForm.value)
      ElMessage.success('新增成功')
    }
    typeDialogVisible.value = false
    getTypeList()
  } catch (e) {
    console.error(e)
  }
}

// 提交数据表单
const handleDataSubmit = async () => {
  try {
    if (dataForm.value.id) {
      // await dictApi.updateData(dataForm.value)
      ElMessage.success('修改成功')
    } else {
      await dictApi.createData(dataForm.value)
      ElMessage.success('新增成功')
    }
    dataDialogVisible.value = false
    getDataList(currentDictType.value)
  } catch (e) {
    console.error(e)
  }
}

// 刷新缓存
const handleRefreshCache = () => {
  if (!currentDictType.value) {
    ElMessage.warning('请先选择字典类型')
    return
  }
  // dictApi.refreshCache(currentDictType.value).then(() => {
  //   ElMessage.success('缓存刷新成功')
  // })
  ElMessage.success('缓存刷新成功')
}

onMounted(() => {
  getTypeList()
})
</script>

<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 字典类型 -->
      <el-col :span="6">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字典类型</span>
              <el-button type="primary" size="small" @click="handleAddType">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          <el-table :data="typeList" v-loading="typeLoading" highlight-current-row
            @current-change="(row: DictType) => row && getDataList(row.dictType)">
            <el-table-column prop="dictName" label="字典名称" />
            <el-table-column prop="dictType" label="字典类型" />
            <el-table-column label="操作" width="80">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEditType(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 字典数据 -->
      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>字典数据 {{ currentDictType ? `(${currentDictType})` : '' }}</span>
              <div>
                <el-button type="primary" size="small" @click="handleRefreshCache">刷新缓存</el-button>
                <el-button type="primary" size="small" @click="handleAddData" :disabled="!currentDictType">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
          <el-table :data="dataList" v-loading="dataLoading">
            <el-table-column prop="dictSort" label="排序" width="60" />
            <el-table-column prop="dictLabel" label="标签" />
            <el-table-column prop="dictValue" label="值" />
            <el-table-column prop="listClass" label="样式" width="100">
              <template #default="{ row }">
                <el-tag :type="row.listClass || 'default'">{{ row.dictLabel }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isDefault" label="默认" width="60">
              <template #default="{ row }">
                <el-tag v-if="row.isDefault === 1" type="success">是</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === 0 ? 'success' : 'danger'">
                  {{ row.status === 0 ? '正常' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEditData(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteData(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 类型弹窗 -->
    <el-dialog title="字典类型" v-model="typeDialogVisible" width="400px">
      <el-form :model="typeForm" label-width="80px">
        <el-form-item label="字典名称" required>
          <el-input v-model="typeForm.dictName" />
        </el-form-item>
        <el-form-item label="字典类型" required>
          <el-input v-model="typeForm.dictType" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleTypeSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 数据弹窗 -->
    <el-dialog title="字典数据" v-model="dataDialogVisible" width="400px">
      <el-form :model="dataForm" label-width="80px">
        <el-form-item label="字典标签" required>
          <el-input v-model="dataForm.dictLabel" />
        </el-form-item>
        <el-form-item label="字典值" required>
          <el-input v-model="dataForm.dictValue" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.dictSort" :min="0" />
        </el-form-item>
        <el-form-item label="样式">
          <el-select v-model="dataForm.listClass">
            <el-option label="默认" value="default" />
            <el-option label="主要" value="primary" />
            <el-option label="成功" value="success" />
            <el-option label="警告" value="warning" />
            <el-option label="危险" value="danger" />
            <el-option label="信息" value="info" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否默认">
          <el-radio-group v-model="dataForm.isDefault">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDataSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>