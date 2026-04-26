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

const handleEdit = (row: SysConfig) => {
  // TODO: 编辑弹窗
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
          <el-button type="primary">
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