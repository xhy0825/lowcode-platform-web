<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { tenantApi, Tenant } from '@/api'

const tenantList = ref<Tenant[]>([])
const tenantTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  tenantName: '',
  tenantCode: '',
  status: undefined as number | undefined
})

const getList = async () => {
  loading.value = true
  try {
    const res = await tenantApi.list(query)
    tenantList.value = res.data.list
    tenantTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: Tenant) => {
  // TODO: 编辑弹窗
}

const handleDelete = (row: Tenant) => {
  ElMessageBox.confirm(`确认删除租户 "${row.tenantName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await tenantApi.delete(row.id)
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
        <el-form-item label="租户名称">
          <el-input v-model="query.tenantName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="租户编码">
          <el-input v-model="query.tenantCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择" clearable>
            <el-option label="正常" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="query.tenantName = ''; query.tenantCode = ''; query.status = undefined; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户管理</span>
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <el-table :data="tenantList" v-loading="loading" stripe>
        <el-table-column prop="tenantName" label="租户名称" width="150" />
        <el-table-column prop="tenantCode" label="租户编码" width="120" />
        <el-table-column prop="packageId" label="套餐" width="100" />
        <el-table-column prop="expireTime" label="过期时间" width="180" />
        <el-table-column prop="dbSchema" label="数据库Schema" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
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
        :total="tenantTotal"
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