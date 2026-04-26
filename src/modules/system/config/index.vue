<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { configApi, SysConfig } from '@/api'

const configList = ref<SysConfig[]>([])
const configTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  configKey: '',
  configType: ''
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const configForm = ref<SysConfig>({
  id: 0,
  tenantId: '',
  configKey: '',
  configValue: '',
  configType: '',
  remark: ''
})

// 配置类型选项
const configTypeOptions = [
  { label: '系统配置', value: 'system' },
  { label: '业务配置', value: 'business' },
  { label: '安全配置', value: 'security' },
  { label: '其他', value: 'other' }
]

const getList = async () => {
  loading.value = true
  try {
    const res = await configApi.list(query)
    configList.value = res.data.list
    configTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增配置'
  configForm.value = {
    id: 0,
    tenantId: '',
    configKey: '',
    configValue: '',
    configType: 'system',
    remark: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row: SysConfig) => {
  dialogTitle.value = '编辑配置'
  configForm.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!configForm.value.configKey) {
    ElMessage.warning('请输入配置键')
    return
  }
  try {
    if (configForm.value.id) {
      await configApi.update(configForm.value)
      ElMessage.success('修改成功')
    } else {
      await configApi.create(configForm.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = (row: SysConfig) => {
  ElMessageBox.confirm(`确认删除配置 "${row.configKey}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await configApi.delete(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="配置键">
          <el-input v-model="query.configKey" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="query.configKey = ''; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>系统配置</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <el-table :data="configList" v-loading="loading" stripe>
        <el-table-column prop="configKey" label="配置键" width="200" />
        <el-table-column prop="configValue" label="配置值" />
        <el-table-column prop="configType" label="类型" width="100" />
        <el-table-column prop="remark" label="备注" width="200" />
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
        :total="configTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="configForm" label-width="80px">
        <el-form-item label="配置键" required>
          <el-input v-model="configForm.configKey" placeholder="如: sys.config.login.captcha" />
        </el-form-item>
        <el-form-item label="配置值" required>
          <el-input v-model="configForm.configValue" placeholder="配置值" />
        </el-form-item>
        <el-form-item label="配置类型">
          <el-select v-model="configForm.configType" style="width: 100%">
            <el-option v-for="item in configTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="configForm.remark" type="textarea" :rows="2" placeholder="配置说明" />
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
  .search-card { margin-bottom: 16px; }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}
</style>