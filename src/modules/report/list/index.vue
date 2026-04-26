<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { reportApi, ReportDefinition } from '@/api'

const router = useRouter()

const reportList = ref<ReportDefinition[]>([])
const reportTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  reportName: '',
  reportType: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await reportApi.list(query)
    reportList.value = res.data.list
    reportTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/report/designer/new')
}

const handleEdit = (row: ReportDefinition) => {
  router.push(`/report/designer/${row.id}`)
}

const handleView = (row: ReportDefinition) => {
  router.push(`/report/view/${row.id}`)
}

const handleDelete = (row: ReportDefinition) => {
  ElMessageBox.confirm(`确认删除报表 "${row.reportName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await reportApi.delete(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

const reportTypeOptions = [
  { label: '柱状图', value: 'bar' },
  { label: '折线图', value: 'line' },
  { label: '饼图', value: 'pie' },
  { label: '表格', value: 'table' },
  { label: '仪表盘', value: 'dashboard' }
]

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="报表名称">
          <el-input v-model="query.reportName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="报表类型">
          <el-select v-model="query.reportType" placeholder="请选择" clearable>
            <el-option v-for="item in reportTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="query.reportName = ''; query.reportType = ''; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-header">
          <span>报表列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新建报表
          </el-button>
        </div>
      </template>

      <el-table :data="reportList" v-loading="loading" stripe>
        <el-table-column prop="reportName" label="报表名称" width="150" />
        <el-table-column prop="reportType" label="报表类型" width="100">
          <template #default="{ row }">
            <el-tag>{{ reportTypeOptions.find(t => t.value === row.reportType)?.label || row.reportType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="数据源" width="100" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'info' : 'success'">
              {{ row.status === 0 ? '草稿' : '已发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="reportTotal"
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