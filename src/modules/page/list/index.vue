<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageApi, PageDefinition } from '@/api'
import { Search, Refresh, Plus, Edit, Delete, View, Grid } from '@element-plus/icons-vue'

const router = useRouter()

const pageList = ref<PageDefinition[]>([])
const pageTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  pageName: '',
  pageCode: '',
  pageType: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res = await pageApi.list(query)
    pageList.value = res.data.list
    pageTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  router.push('/page/builder/new')
}

const handleEdit = (row: PageDefinition) => {
  router.push(`/page/builder/${row.id}`)
}

const handleDelete = (row: PageDefinition) => {
  ElMessageBox.confirm(`确认删除页面 "${row.pageName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await pageApi.delete(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

const handlePreview = (row: PageDefinition) => {
  router.push(`/page/view/${row.id}`)
}

const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

const pageTypeOptions = [
  { label: '列表页', value: 'list' },
  { label: '详情页', value: 'detail' },
  { label: '表单页', value: 'form' },
  { label: '仪表盘', value: 'dashboard' }
]

const getTypeLabel = (type: string) => {
  return pageTypeOptions.find(t => t.value === type)?.label || type
}

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    list: '#409eff',
    detail: '#67c23a',
    form: '#e6a23c',
    dashboard: '#f56c6c'
  }
  return colorMap[type] || '#909399'
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div class="search-card">
      <div class="search-form">
        <div class="search-left">
          <el-form-item label="页面名称">
            <el-input
              v-model="query.pageName"
              placeholder="请输入页面名称"
              clearable
              :prefix-icon="Search"
              class="search-input"
            />
          </el-form-item>
          <el-form-item label="页面编码">
            <el-input
              v-model="query.pageCode"
              placeholder="请输入页面编码"
              clearable
              :prefix-icon="Search"
              class="search-input"
            />
          </el-form-item>
          <el-form-item label="页面类型">
            <el-select v-model="query.pageType" placeholder="请选择类型" clearable class="search-select">
              <el-option v-for="item in pageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="search-right">
          <el-button type="primary" @click="getList" class="search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="query.pageName = ''; query.pageCode = ''; query.pageType = ''; getList()" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="table-header">
        <div class="header-left">
          <span class="table-title">页面列表</span>
          <span class="table-total">共 {{ pageTotal }} 条数据</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新建页面
          </el-button>
        </div>
      </div>

      <el-table :data="pageList" v-loading="loading" class="data-table" stripe>
        <el-table-column prop="pageName" label="页面名称" width="180">
          <template #default="{ row }">
            <div class="name-cell">
              <div class="page-icon">
                <el-icon><Grid /></el-icon>
              </div>
              <span class="page-name">{{ row.pageName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="pageCode" label="页面编码" width="150">
          <template #default="{ row }">
            <span class="code-text">{{ row.pageCode }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pageType" label="页面类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :style="{ background: getTypeColor(row.pageType), borderColor: getTypeColor(row.pageType), color: '#fff' }" class="type-tag">
              {{ getTypeLabel(row.pageType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="modelId" label="关联模型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.modelId" type="success" class="model-tag" effect="light">
              已关联
            </el-tag>
            <el-tag v-else type="info" class="model-tag" effect="light">
              未关联
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'info' : 'success'" class="status-tag" effect="light">
              {{ row.status === 0 ? '草稿' : '已发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ row.createdTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleEdit(row)" class="action-btn">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="success" @click="handlePreview(row)" class="action-btn">
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)" class="action-btn">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          :current-page="query.pageNum"
          :page-size="query.pageSize"
          :total="pageTotal"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
          class="pagination"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 0;

  .search-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .search-form {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-left {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;

        .el-form-item { margin-bottom: 0; }

        .search-input {
          width: 200px;
          :deep(.el-input__wrapper) { border-radius: 8px; }
        }

        .search-select {
          width: 160px;
          :deep(.el-select__wrapper) { border-radius: 8px; }
        }
      }

      .search-right {
        display: flex;
        gap: 12px;

        .search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
        }

        .reset-btn {
          border-radius: 8px;
          &:hover { background: #f5f7fa; }
        }
      }
    }
  }

  .table-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #ebeef5;

      .header-left {
        display: flex;
        align-items: center;
        gap: 12px;

        .table-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
        }

        .table-total {
          font-size: 14px;
          color: #909399;
          padding: 4px 12px;
          background: #f5f7fa;
          border-radius: 4px;
        }
      }

      .add-btn {
        background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
        border: none;
        border-radius: 8px;
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
        }
      }
    }

    .data-table {
      border-radius: 8px;

      :deep(th.el-table__cell) {
        background: #f5f7fa;
        color: #303133;
        font-weight: 600;
      }

      :deep(td.el-table__cell) {
        padding: 14px 0;
      }

      .name-cell {
        display: flex;
        align-items: center;
        gap: 10px;

        .page-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .page-name {
          color: #303133;
          font-weight: 500;
        }
      }

      .code-text {
        color: #909399;
        font-size: 13px;
      }

      .type-tag, .model-tag, .status-tag {
        border-radius: 12px;
        padding: 2px 12px;
      }

      .time-text {
        color: #909399;
        font-size: 13px;
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;

        .action-btn {
          padding: 4px 8px;
          font-size: 13px;
          :deep(.el-icon) { margin-right: 2px; }
          &:hover { opacity: 0.8; }
        }
      }
    }

    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;

      :deep(.el-pagination) {
        .btn-prev, .btn-next, .el-pager li {
          border-radius: 8px;
          min-width: 32px;
          height: 32px;
          background: #fff;
          border: 1px solid #e4e7ed;

          &:hover {
            color: #f56c6c;
            border-color: #f56c6c;
          }

          &.is-active {
            background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
            border-color: transparent;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>