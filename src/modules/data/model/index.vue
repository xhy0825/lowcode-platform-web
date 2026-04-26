<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { modelApi, DataModel, DataModelField } from '@/api'

// 模型列表
const modelList = ref<DataModel[]>([])
const modelTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  modelName: '',
  modelCode: ''
})

// 弹窗
const dialogVisible = ref(false)
const designVisible = ref(false)
const modelForm = ref<DataModel>({
  id: 0,
  tenantId: '',
  modelName: '',
  modelCode: '',
  tableName: '',
  description: '',
  status: 0,
  version: 1,
  fields: []
})

// 字段配置
const fieldList = ref<DataModelField[]>([])
const currentModelId = ref(0)
const ddlPreview = ref('')

// 字段类型选项
const fieldTypeOptions = [
  { label: '字符串', value: 'string' },
  { label: '长文本', value: 'textarea' },
  { label: '整数', value: 'integer' },
  { label: '数字', value: 'number' },
  { label: '布尔', value: 'boolean' },
  { label: '日期', value: 'date' },
  { label: '日期时间', value: 'datetime' },
  { label: '下拉选择', value: 'select' },
  { label: '文件', value: 'file' },
  { label: '图片', value: 'image' },
  { label: 'JSON', value: 'json' }
]

// 获取模型列表
const getList = async () => {
  loading.value = true
  try {
    const res = await modelApi.list(query)
    modelList.value = res.data.list
    modelTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 新增模型
const handleAdd = () => {
  modelForm.value = {
    id: 0,
    tenantId: '',
    modelName: '',
    modelCode: '',
    tableName: '',
    description: '',
    status: 0,
    version: 1,
    fields: []
  }
  dialogVisible.value = true
}

// 设计字段
const handleDesign = async (row: DataModel) => {
  currentModelId.value = row.id
  try {
    const res = await modelApi.get(row.id)
    fieldList.value = res.data.fields || []
    designVisible.value = true
  } catch (e) {
    console.error(e)
  }
}

// 生成DDL预览
const handlePreviewDdl = async () => {
  try {
    const res = await modelApi.generateDdl(currentModelId.value)
    ddlPreview.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// 执行建表
const handleExecuteDdl = async () => {
  ElMessageBox.confirm('确认创建物理表吗？建表后不可撤销', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await modelApi.executeDdl(currentModelId.value)
      ElMessage.success('建表成功')
      designVisible.value = false
      getList()
    } catch (e) {
      console.error(e)
    }
  })
}

// 删除模型
const handleDelete = (row: DataModel) => {
  if (row.status === 1) {
    ElMessage.warning('已发布的模型不能删除')
    return
  }
  ElMessageBox.confirm(`确认删除模型 "${row.modelName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await modelApi.delete(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

// 提交模型表单
const handleSubmit = async () => {
  try {
    await modelApi.create(modelForm.value)
    ElMessage.success('创建成功')
    dialogVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
  }
}

// 添加字段
const handleAddField = () => {
  fieldList.value.push({
    id: 0,
    modelId: currentModelId.value,
    tenantId: '',
    fieldName: '',
    fieldCode: '',
    columnName: '',
    fieldType: 'string',
    length: 255,
    precision: 10,
    scale: 2,
    isRequired: 0,
    isUnique: 0,
    isIndexed: 0,
    isPrimary: 0,
    defaultValue: '',
    dictType: '',
    relationType: '',
    relationModelId: 0,
    orderNum: fieldList.value.length,
    delFlag: 0
  })
}

// 删除字段
const handleDeleteField = (index: number) => {
  fieldList.value.splice(index, 1)
}

// 保存字段配置
const handleSaveFields = async () => {
  // 自动生成列名
  fieldList.value.forEach(f => {
    if (!f.columnName) {
      f.columnName = f.fieldCode.toLowerCase().replace(/[^a-z0-9]/g, '_')
    }
  })
  try {
    await modelApi.updateFields(currentModelId.value, fieldList.value)
    ElMessage.success('保存成功')
  } catch (e) {
    console.error(e)
  }
}

// 列名自动生成
const generateColumnName = (field: DataModelField) => {
  if (!field.columnName && field.fieldCode) {
    field.columnName = field.fieldCode.toLowerCase().replace(/[^a-z0-9]/g, '_')
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="模型名称">
          <el-input v-model="query.modelName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="模型编码">
          <el-input v-model="query.modelCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList()">搜索</el-button>
          <el-button @click="query.modelName = ''; query.modelCode = ''; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据模型</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <el-table :data="modelList" v-loading="loading" stripe>
        <el-table-column prop="modelName" label="模型名称" />
        <el-table-column prop="modelCode" label="模型编码" />
        <el-table-column prop="tableName" label="物理表名" />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'info' : 'success'">
              {{ row.status === 0 ? '草稿' : '已发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="60" />
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDesign(row)">设计字段</el-button>
            <el-button link type="danger" @click="handleDelete(row)" v-if="row.status === 0">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="modelTotal"
        layout="total, prev, pager, next"
        @current-change="(page: number) => { query.pageNum = page; getList() }"
      />
    </el-card>

    <!-- 新增模型弹窗 -->
    <el-dialog title="新增数据模型" v-model="dialogVisible" width="500px">
      <el-form :model="modelForm" label-width="100px">
        <el-form-item label="模型名称" required>
          <el-input v-model="modelForm.modelName" />
        </el-form-item>
        <el-form-item label="模型编码" required>
          <el-input v-model="modelForm.modelCode" placeholder="建议使用英文，如 user_info" />
        </el-form-item>
        <el-form-item label="物理表名" required>
          <el-input v-model="modelForm.tableName" placeholder="如 t_user_info" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="modelForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 字段设计弹窗 -->
    <el-dialog title="字段设计" v-model="designVisible" width="90%" top="5vh">
      <div class="design-container">
        <!-- 字段列表 -->
        <el-card class="field-card">
          <template #header>
            <div class="card-header">
              <span>字段配置</span>
              <div>
                <el-button type="primary" size="small" @click="handleAddField">
                  <el-icon><Plus /></el-icon>
                  添加字段
                </el-button>
                <el-button type="success" size="small" @click="handleSaveFields">保存配置</el-button>
                <el-button type="warning" size="small" @click="handlePreviewDdl">预览DDL</el-button>
                <el-button type="danger" size="small" @click="handleExecuteDdl">执行建表</el-button>
              </div>
            </div>
          </template>

          <el-table :data="fieldList" stripe max-height="400">
            <el-table-column prop="fieldName" label="字段名称" width="120">
              <template #default="{ row }">
                <el-input v-model="row.fieldName" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="fieldCode" label="字段编码" width="120">
              <template #default="{ row }">
                <el-input v-model="row.fieldCode" size="small" @change="generateColumnName(row)" />
              </template>
            </el-table-column>
            <el-table-column prop="columnName" label="数据库列名" width="120">
              <template #default="{ row }">
                <el-input v-model="row.columnName" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="fieldType" label="字段类型" width="120">
              <template #default="{ row }">
                <el-select v-model="row.fieldType" size="small">
                  <el-option v-for="t in fieldTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="length" label="长度" width="80">
              <template #default="{ row }">
                <el-input-number v-model="row.length" size="small" :min="1" v-if="row.fieldType === 'string'" />
              </template>
            </el-table-column>
            <el-table-column prop="isRequired" label="必填" width="60">
              <template #default="{ row }">
                <el-checkbox v-model="row.isRequired" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>
            <el-table-column prop="isUnique" label="唯一" width="60">
              <template #default="{ row }">
                <el-checkbox v-model="row.isUnique" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>
            <el-table-column prop="isIndexed" label="索引" width="60">
              <template #default="{ row }">
                <el-checkbox v-model="row.isIndexed" :true-value="1" :false-value="0" />
              </template>
            </el-table-column>
            <el-table-column prop="defaultValue" label="默认值" width="100">
              <template #default="{ row }">
                <el-input v-model="row.defaultValue" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="dictType" label="关联字典" width="120">
              <template #default="{ row }">
                <el-input v-model="row.dictType" size="small" placeholder="字典类型" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="60" fixed="right">
              <template #default="{ $index }">
                <el-button link type="danger" @click="handleDeleteField($index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- DDL预览 -->
        <el-card class="ddl-card" v-if="ddlPreview">
          <template #header>
            <span>DDL预览</span>
          </template>
          <pre class="ddl-code">{{ ddlPreview }}</pre>
        </el-card>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-card {
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .design-container {
    display: flex;
    gap: 20px;

    .field-card {
      flex: 1;
    }

    .ddl-card {
      width: 400px;

      .ddl-code {
        background: #f5f5f5;
        padding: 10px;
        border-radius: 4px;
        font-size: 12px;
        overflow: auto;
        max-height: 300px;
      }
    }
  }
}
</style>