<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi, User, UserQuery } from '@/api'
import { Search, Refresh, Plus, Edit, Delete, Key, Lock, Unlock } from '@element-plus/icons-vue'

// 查询条件
const queryParams = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  username: '',
  realName: '',
  status: undefined,
  deptId: undefined
})

// 用户列表
const userList = ref<User[]>([])
const total = ref(0)
const loading = ref(false)

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref<User>({
  id: 0,
  tenantId: '',
  username: '',
  password: '',
  realName: '',
  email: '',
  phone: '',
  avatar: '',
  status: 0,
  deptId: 0,
  roles: [],
  createdTime: ''
})
const roleList = ref<any[]>([])

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await userApi.list(queryParams)
    userList.value = res.data.list
    total.value = res.data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const resetQuery = () => {
  queryParams.username = ''
  queryParams.realName = ''
  queryParams.status = undefined
  queryParams.deptId = undefined
  handleQuery()
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: User) => {
  resetForm()
  dialogTitle.value = '编辑用户'
  userApi.get(row.id).then(res => {
    form.value = res.data
    dialogVisible.value = true
  })
}

// 删除
const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确认删除用户 "${row.realName}" 吗?`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    userApi.delete(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}

// 重置密码
const handleResetPwd = (row: User) => {
  ElMessageBox.prompt('请输入新密码', '重置密码', {
    inputPattern: /.{6,}/,
    inputErrorMessage: '密码至少6位',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    userApi.resetPwd(row.id, value).then(() => {
      ElMessage.success('密码重置成功')
    })
  })
}

// 状态切换
const handleStatusChange = (row: User) => {
  const status = row.status === 0 ? 1 : 0
  const statusText = status === 0 ? '启用' : '禁用'
  ElMessageBox.confirm(`确认${statusText}用户 "${row.realName}" 吗?`, '提示', {
    type: 'warning'
  }).then(() => {
    userApi.changeStatus(row.id, status).then(() => {
      ElMessage.success(`${statusText}成功`)
      getList()
    })
  })
}

// 提交表单
const handleSubmit = () => {
  if (dialogTitle.value === '新增用户') {
    userApi.create(form.value).then(() => {
      ElMessage.success('新增成功')
      dialogVisible.value = false
      getList()
    })
  } else {
    userApi.update(form.value).then(() => {
      ElMessage.success('修改成功')
      dialogVisible.value = false
      getList()
    })
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    id: 0,
    tenantId: '',
    username: '',
    password: '',
    realName: '',
    email: '',
    phone: '',
    avatar: '',
    status: 0,
    deptId: 0,
    roles: [],
    createdTime: ''
  }
}

// 分页
const handlePageChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
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
        <el-form-item label="用户名">
          <el-input
            v-model="queryParams.username"
            placeholder="请输入用户名"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="queryParams.realName"
            placeholder="请输入姓名"
            clearable
            :prefix-icon="Search"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable class="search-select">
            <el-option label="正常" value="0" />
            <el-option label="禁用" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleQuery" class="search-btn">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetQuery" class="reset-btn">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="table-card">
      <div class="table-header">
        <div class="header-left">
          <span class="table-title">用户列表</span>
          <span class="table-total">共 {{ total }} 条数据</span>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleAdd" class="add-btn">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
        </div>
      </div>

      <!-- 表格 -->
      <el-table :data="userList" v-loading="loading" class="data-table" stripe>
        <el-table-column prop="username" label="用户名" width="120">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="32" class="user-avatar">{{ row.username.charAt(0).toUpperCase() }}</el-avatar>
              <span class="user-name">{{ row.username }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱">
          <template #default="{ row }">
            <span class="email-text">{{ row.email || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="130">
          <template #default="{ row }">
            <span class="phone-text">{{ row.phone || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'" class="status-tag" effect="light">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180">
          <template #default="{ row }">
            <span class="time-text">{{ row.createdTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" @click="handleEdit(row)" class="action-btn">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button link type="warning" @click="handleResetPwd(row)" class="action-btn">
                <el-icon><Key /></el-icon>
                重置
              </el-button>
              <el-button link @click="handleStatusChange(row)" :class="row.status === 0 ? 'action-btn-disable' : 'action-btn-enable'">
                <el-icon><component :is="row.status === 0 ? Lock : Unlock" /></el-icon>
                {{ row.status === 0 ? '禁用' : '启用' }}
              </el-button>
              <el-button link type="danger" @click="handleDelete(row)" class="action-btn">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
          class="pagination"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px" class="form-dialog">
      <el-form :model="form" label-width="80px" class="dialog-form">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" :disabled="dialogTitle === '编辑用户'" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" required v-if="dialogTitle === '新增用户'">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status" class="status-radio">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button type="primary" @click="handleSubmit" class="submit-btn">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 0;

  // 搜索卡片
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

      .el-form-item {
        margin-bottom: 0;
      }

      .search-input {
        width: 200px;

        :deep(.el-input__wrapper) {
          border-radius: 8px;
        }
      }

      .search-select {
        width: 160px;

        :deep(.el-select__wrapper) {
          border-radius: 8px;
        }
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

          &:hover {
            background: #f5f7fa;
          }
        }
      }
    }
  }

  // 表格卡片
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

      .header-right {
        .add-btn {
          background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
          border: none;
          border-radius: 8px;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
          }
        }
      }
    }

    // 表格样式
    .data-table {
      border-radius: 8px;

      :deep(th.el-table__cell) {
        background: #f5f7fa;
        color: #303133;
        font-weight: 600;
        font-size: 14px;
        padding: 12px 0;
      }

      :deep(td.el-table__cell) {
        padding: 14px 0;
        font-size: 14px;
      }

      .user-cell {
        display: flex;
        align-items: center;
        gap: 10px;

        .user-avatar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }

        .user-name {
          color: #303133;
          font-weight: 500;
        }
      }

      .email-text, .phone-text {
        color: #606266;
      }

      .time-text {
        color: #909399;
        font-size: 13px;
      }

      .status-tag {
        border-radius: 12px;
        padding: 2px 12px;
      }

      // 操作按钮
      .action-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;

        .action-btn {
          padding: 4px 8px;
          font-size: 13px;

          :deep(.el-icon) {
            margin-right: 2px;
          }

          &:hover {
            opacity: 0.8;
          }
        }

        .action-btn-disable {
          color: #e6a23c;

          &:hover {
            color: #ebb563;
          }
        }

        .action-btn-enable {
          color: #67c23a;

          &:hover {
            color: #85ce61;
          }
        }
      }
    }

    // 分页
    .pagination-wrapper {
      display: flex;
      justify-content: flex-end;
      padding-top: 16px;

      :deep(.el-pagination) {
        .el-pagination__total {
          color: #606266;
        }

        .btn-prev, .btn-next, .el-pager li {
          border-radius: 8px;
          min-width: 32px;
          height: 32px;
          line-height: 32px;
          background: #fff;
          border: 1px solid #e4e7ed;

          &:hover {
            color: #409eff;
            border-color: #409eff;
          }

          &.is-active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-color: transparent;
            color: #fff;
          }
        }
      }
    }
  }

  // 弹窗样式
  .form-dialog {
    :deep(.el-dialog) {
      border-radius: 12px;

      .el-dialog__header {
        padding: 16px 20px;
        border-bottom: 1px solid #ebeef5;
        margin-right: 0;

        .el-dialog__title {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .el-dialog__body {
        padding: 24px 20px;

        .dialog-form {
          .el-form-item {
            margin-bottom: 20px;

            .el-input__wrapper {
              border-radius: 8px;
            }
          }

          .status-radio {
            :deep(.el-radio__input.is-checked .el-radio__inner) {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-color: transparent;
            }
          }
        }
      }

      .el-dialog__footer {
        padding: 12px 20px;
        border-top: 1px solid #ebeef5;

        .dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;

          .cancel-btn {
            border-radius: 8px;
          }

          .submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 8px;

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }
          }
        }
      }
    }
  }
}
</style>