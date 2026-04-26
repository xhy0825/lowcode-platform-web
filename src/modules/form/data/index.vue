<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formApi, dictApi, FieldConfig, DictData } from '@/api'

const route = useRoute()
const router = useRouter()

// 表单信息
const formInfo = ref({
  id: 0,
  formName: '',
  formCode: '',
  status: 0
})

// 字段配置
const fieldConfig = ref<FieldConfig[]>([])

// 字典数据缓存
const dictDataCache = ref<Record<string, DictData[]>>({})

// 数据列表
const dataList = ref<Record<string, any>[]>([])
const dataTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 20
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formData = ref<Record<string, any>>({})
const currentDataId = ref<number | null>(null)

// 获取表单信息
const loadFormInfo = async () => {
  const id = Number(route.params.id)
  try {
    const res = await formApi.get(id)
    formInfo.value = res.data
    const fieldsRes = await formApi.getFields(id)
    fieldConfig.value = fieldsRes.data || []
    // 加载字典数据
    loadDictData()
  } catch (e) {
    console.error(e)
  }
}

// 加载字典数据
const loadDictData = async () => {
  const dictFields = fieldConfig.value.filter(f => f.dictType && ['select', 'radio', 'checkbox', 'dict'].includes(f.widgetType))
  const dictTypes = [...new Set(dictFields.map(f => f.dictType))]
  for (const dictType of dictTypes) {
    if (dictType && !dictDataCache.value[dictType]) {
      try {
        const res = await dictApi.listData(dictType)
        dictDataCache.value[dictType] = res.data.filter(d => d.status === 0)
      } catch (e) {
        console.error(`加载字典 ${dictType} 失败`, e)
      }
    }
  }
}

// 获取字典选项
const getDictOptions = (dictType: string): DictData[] => {
  return dictDataCache.value[dictType] || []
}

// 获取数据列表
const getList = async () => {
  loading.value = true
  try {
    const res = await formApi.queryData(formInfo.value.id, query)
    dataList.value = res.data.list
    dataTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 新增数据
const handleAdd = () => {
  dialogTitle.value = '新增数据'
  formData.value = {}
  // 设置默认值
  fieldConfig.value.forEach(field => {
    if (field.defaultValue) {
      formData.value[field.fieldCode] = field.defaultValue
    }
  })
  currentDataId.value = null
  dialogVisible.value = true
}

// 编辑数据
const handleEdit = (row: Record<string, any>) => {
  dialogTitle.value = '编辑数据'
  formData.value = { ...row }
  currentDataId.value = row.id
  dialogVisible.value = true
}

// 删除数据
const handleDelete = (row: Record<string, any>) => {
  ElMessageBox.confirm('确认删除该数据吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    // await formApi.deleteData(formInfo.value.id, row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

// 提交数据
const handleSubmit = async () => {
  try {
    if (currentDataId.value) {
      // await formApi.updateData(formInfo.value.id, currentDataId.value, formData.value)
      ElMessage.success('修改成功')
    } else {
      await formApi.submitData(formInfo.value.id, formData.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
  }
}

// 返回
const handleBack = () => {
  router.push('/form/list')
}

// 分页
const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

// 表格列配置
const tableColumns = computed(() => {
  return fieldConfig.value
    .filter(f => f.isHidden !== 1)
    .sort((a, b) => a.rowOrder - b.rowOrder)
})

// 字段格式化显示
const formatFieldValue = (field: FieldConfig, value: any) => {
  if (value === null || value === undefined) return ''
  if (field.widgetType === 'date' && value) {
    return new Date(value).toLocaleDateString()
  }
  if (field.widgetType === 'datetime' && value) {
    return new Date(value).toLocaleString()
  }
  if (field.widgetType === 'switch') {
    return value ? '是' : '否'
  }
  return value
}

onMounted(() => {
  loadFormInfo().then(() => {
    getList()
  })
})
</script>

<template>
  <div class="app-container">
    <!-- 顶部信息 -->
    <el-card class="info-card">
      <div class="info-header">
        <div class="info-left">
          <el-button @click="handleBack">
            <el-icon><Back /></el-icon>
            返回
          </el-button>
          <span class="form-name">{{ formInfo.formName }}</span>
          <el-tag :type="formInfo.status === 1 ? 'success' : 'info'">
            {{ formInfo.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </div>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="dataList" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column
          v-for="field in tableColumns"
          :key="field.fieldCode"
          :prop="field.fieldCode"
          :label="field.fieldName"
          :width="field.colSpan === 12 ? 200 : 150"
        >
          <template #default="{ row }">
            {{ formatFieldValue(field, row[field.fieldCode]) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="dataTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form label-width="100px">
        <el-form-item
          v-for="field in fieldConfig"
          :key="field.fieldCode"
          :label="field.fieldName"
          :required="field.isRequired === 1"
          v-show="field.isHidden !== 1"
        >
          <!-- 文本框 -->
          <el-input
            v-if="['input', 'password'].includes(field.widgetType)"
            v-model="formData[field.fieldCode]"
            :type="field.widgetType === 'password' ? 'password' : 'text'"
            :placeholder="field.placeholder"
            :disabled="field.isReadonly === 1"
          />
          <!-- 多行文本 -->
          <el-input
            v-else-if="field.widgetType === 'textarea'"
            v-model="formData[field.fieldCode]"
            type="textarea"
            :rows="3"
            :placeholder="field.placeholder"
            :disabled="field.isReadonly === 1"
          />
          <!-- 数字框 -->
          <el-input-number
            v-else-if="field.widgetType === 'number'"
            v-model="formData[field.fieldCode]"
            :placeholder="field.placeholder"
            :disabled="field.isReadonly === 1"
            style="width: 100%"
          />
          <!-- 下拉框 -->
          <el-select
            v-else-if="['select', 'dict'].includes(field.widgetType)"
            v-model="formData[field.fieldCode]"
            :placeholder="field.placeholder"
            :disabled="field.isReadonly === 1"
            style="width: 100%"
          >
            <el-option
              v-for="item in getDictOptions(field.dictType)"
              :key="item.dictValue"
              :label="item.dictLabel"
              :value="item.dictValue"
            />
          </el-select>
          <!-- 单选 -->
          <el-radio-group
            v-else-if="field.widgetType === 'radio'"
            v-model="formData[field.fieldCode]"
            :disabled="field.isReadonly === 1"
          >
            <el-radio
              v-for="item in getDictOptions(field.dictType)"
              :key="item.dictValue"
              :value="item.dictValue"
            >
              {{ item.dictLabel }}
            </el-radio>
          </el-radio-group>
          <!-- 多选 -->
          <el-checkbox-group
            v-else-if="field.widgetType === 'checkbox'"
            v-model="formData[field.fieldCode]"
            :disabled="field.isReadonly === 1"
          >
            <el-checkbox
              v-for="item in getDictOptions(field.dictType)"
              :key="item.dictValue"
              :value="item.dictValue"
            >
              {{ item.dictLabel }}
            </el-checkbox>
          </el-checkbox-group>
          <!-- 开关 -->
          <el-switch
            v-else-if="field.widgetType === 'switch'"
            v-model="formData[field.fieldCode]"
            :disabled="field.isReadonly === 1"
          />
          <!-- 日期 -->
          <el-date-picker
            v-else-if="['date', 'datetime'].includes(field.widgetType)"
            v-model="formData[field.fieldCode]"
            :type="(field.widgetType as 'date' | 'datetime')"
            :placeholder="field.placeholder"
            :disabled="field.isReadonly === 1"
            style="width: 100%"
          />
          <!-- 默认 -->
          <el-input
            v-else
            v-model="formData[field.fieldCode]"
            :placeholder="field.placeholder"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .info-card {
    margin-bottom: 16px;

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .info-left {
        display: flex;
        align-items: center;
        gap: 16px;

        .form-name {
          font-size: 18px;
          font-weight: 500;
        }
      }
    }
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>