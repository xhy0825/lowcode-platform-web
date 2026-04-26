<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { modelApi } from '@/api'

const tableList = ref<any[]>([])
const loading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const res = await modelApi.getTableList()
    tableList.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>表结构管理</span>
        </div>
      </template>

      <el-table :data="tableList" v-loading="loading" stripe>
        <el-table-column prop="tableName" label="表名" width="200" />
        <el-table-column prop="tableComment" label="表注释" width="200" />
        <el-table-column prop="engine" label="引擎" width="80" />
        <el-table-column prop="tableRows" label="行数" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary">查看结构</el-button>
            <el-button link type="primary">导出DDL</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>