<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formApi, FormDefinition } from '@/api'
import { Search, Refresh, Plus, Edit, Delete, Publish, Document, DataLine } from '@element-plus/icons-vue'

const router = useRouter()

// 表单列表
const formList = ref<FormDefinition[]>([])
const formTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  formName: '',
  formCode: '',
  status: undefined as number | undefined
})

// 获取表单列表
const getList = async () => {
  loading.value = true
  try {
    const res = await formApi.list(query)
    formList.value = res.data.list
    formTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 新增表单
const handleAdd = () => {
  router.push('/form/designer/new')
}

// 编辑表单
const handleEdit = (row: FormDefinition) => {
  router.push(`/form/designer/${row.id}`)
}

// 设计表单
const handleDesign = (row: FormDefinition) => {
  router.push(`/form/designer/${row.id}`)
}

// 发布表单
const handlePublish = (row: FormDefinition) => {
  ElMessageBox.confirm('确认发布表单吗？发布后可用于数据录入', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await formApi.publish(row.id)
    ElMessage.success('发布成功')
    getList()
  })
}

// 删除表单
const handleDelete = (row: FormDefinition) => {
  if (row.status === 1) {
    ElMessage.warning('已发布的表单不能删除')
    return
  }
  ElMessageBox.confirm(`确认删除表单 "${row.formName}" 吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await formApi.delete(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

// 查看数据
const handleViewData = (row: FormDefinition) => {
  router.push(`/form/data/${row.id}`)
}

// 分页
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
    <!-- 搜索栏 -->
    <div class="search-card">
      <el-form :inline="true" class="search-form">
        <el-form-item label="表单名称">
          <el-input
            v-model="query.formName"
            placeholder="请输入表单名称"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="表单编码">
          <el-input
            v-model="query.formCode"
            placeholder="请输入表单编码"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择状态" clearable class="search-select">
            <el-option label="草稿" :value="0" />
            <el-option label="已发布" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" @click="getList" class="search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="query.formName = ''; query.formCode = ''; query.status = undefined; getList()" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格 -->
    <div class="table-card">
      <div class="table-header">
        <div class="header-left">
          <span class="table-title">表单列表</span>
          <span class="table-total">共 {{ formTotal }} 条数据</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新建表单
          </el-button>
        </div>
      </div>

      <el-table :data="formList" v-loading="loading" class="data-table" stripe>
        <el-table-column prop="formName" label="表单名称" width="200">
          <template #default="{ row }">
            <div class="name-cell">
              <div class="form-icon">
                <el-icon><Document /></el-icon>
              </div>
              <span class="form-name">{{ row.formName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="formCode" label="表单编码" width="150">
          <template #default="{ row }">
            <span class="code-text">{{ row.formCode }}</span>
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
        <el-table-column prop="version" label="版本" width="80" align="center">
          <template #default="{ row }">
            <span class="version-text">v{{ row.version }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ row.createdTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleDesign(row)" class="action-btn">
                <el-icon><Edit /></el-icon>
                设计
              </el-button>
              <el-button link type="success" @click="handlePublish(row)" v-if="row.status === 0" class="action-btn">
                <el-icon><Publish /></el-icon>
                发布
              </el-button>
              <el-button link type="info" @click="handleViewData(row)" v-if="row.status === 1" class="action-btn">
                <el-icon><DataLine /></el-icon>
                数据
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)" v-if="row.status === 0" class="action-btn">
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
          :total="formTotal"
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
      flex-wrap: wrap;
      gap: 16px;

      .el-form-item { margin-bottom: 0; }

      .search-input {
        width: 200px;
        :deep(.el-input__wrapper) { border-radius: 8px; }
      }

      .search-select {
        width: 160px;
        :deep(.el-select__wrapper) { border-radius: 8px; }
      }

      .search-buttons {
        margin-left: auto;

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
        background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
        border: none;
        border-radius: 8px;
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
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

        .form-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
        }

        .form-name {
          color: #303133;
          font-weight: 500;
        }
      }

      .code-text {
        color: #909399;
        font-size: 13px;
      }

      .model-tag, .status-tag {
        border-radius: 12px;
        padding: 2px 12px;
      }

      .version-text {
        color: #606266;
        font-weight: 500;
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
            color: #409eff;
            border-color: #409eff;
          }

          &.is-active {
            background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
            border-color: transparent;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>