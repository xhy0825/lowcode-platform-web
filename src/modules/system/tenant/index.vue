<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import { tenantApi } from '@/api'
import { request } from '@/api/request'
import type { Tenant, Package } from '@/api'

// 数据列表
const tableData = ref<Tenant[]>([])
const loading = ref(false)
const total = ref(0)

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  tenantName: '',
  tenantCode: '',
  status: undefined as number | undefined
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)

// 表单数据
const formData = reactive<Tenant>({
  id: 0,
  tenantName: '',
  tenantCode: '',
  packageId: 0,
  expireTime: '',
  dbSchema: '',
  status: 0,
  contactName: '',
  contactPhone: '',
  contactEmail: ''
})

// 套餐列表
const packageList = ref<Package[]>([])

// 状态选项
const statusOptions = [
  { label: '正常', value: 0 },
  { label: '禁用', value: 1 }
]

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await tenantApi.list(queryParams)
    if (res.code === 200) {
      tableData.value = res.data.records
      total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 获取套餐列表
const getPackageList = async () => {
  try {
    const res = await tenantApi.getPackages()
    if (res.code === 200) {
      packageList.value = res.data
    }
  } catch (error) {
    console.error(error)
  }
}

// 搜索
const handleSearch = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置
const handleReset = () => {
  queryParams.tenantName = ''
  queryParams.tenantCode = ''
  queryParams.status = undefined
  queryParams.pageNum = 1
  getList()
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增租户'
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: Tenant) => {
  dialogTitle.value = '编辑租户'
  resetForm()
  try {
    const res = await tenantApi.get(row.id)
    if (res.code === 200) {
      Object.assign(formData, res.data)
    }
  } catch (error) {
    console.error(error)
  }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row: Tenant) => {
  try {
    await ElMessageBox.confirm('确定要删除该租户吗？', '提示', {
      type: 'warning'
    })
    const res = await tenantApi.delete(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    }
  } catch (error) {
    console.error(error)
  }
}

// 启用
const handleEnable = async (row: Tenant) => {
  try {
    const res = await tenantApi.enable(row.id)
    if (res.code === 200) {
      ElMessage.success('启用成功')
      getList()
    }
  } catch (error) {
    console.error(error)
  }
}

// 禁用
const handleDisable = async (row: Tenant) => {
  try {
    const res = await tenantApi.disable(row.id)
    if (res.code === 200) {
      ElMessage.success('禁用成功')
      getList()
    }
  } catch (error) {
    console.error(error)
  }
}

// 初始化
const handleInit = async (row: Tenant) => {
  try {
    await ElMessageBox.confirm('确定要初始化该租户数据吗？这将创建初始管理员账号和角色。', '提示', {
      type: 'warning'
    })
    const res = await tenantApi.init(row.id, 'admin', 'admin123')
    if (res.code === 200) {
      ElMessage.success('初始化成功，默认账号：admin，密码：admin123')
      getList()
    }
  } catch (error) {
    console.error(error)
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formData.tenantName) {
    ElMessage.warning('请输入租户名称')
    return
  }
  if (!formData.tenantCode) {
    ElMessage.warning('请输入租户编码')
    return
  }
  formLoading.value = true
  try {
    if (formData.id) {
      const res = await tenantApi.update(formData)
      if (res.code === 200) {
        ElMessage.success('修改成功')
        dialogVisible.value = false
        getList()
      }
    } else {
      const res = await tenantApi.create(formData)
      if (res.code === 200) {
        ElMessage.success('新增成功')
        dialogVisible.value = false
        getList()
      }
    }
  } catch (error) {
    console.error(error)
  } finally {
    formLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.id = 0
  formData.tenantName = ''
  formData.tenantCode = ''
  formData.packageId = 0
  formData.expireTime = ''
  formData.dbSchema = ''
  formData.status = 0
  formData.contactName = ''
  formData.contactPhone = ''
  formData.contactEmail = ''
}

// 分页
const handlePageChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  getList()
}

// 获取套餐名称
const getPackageName = (packageId: number) => {
  return packageList.value.find(p => p.id === packageId)?.packageName || '-'
}

onMounted(() => {
  getList()
  getPackageList()
})
</script>

<template>
  <div class="tenant-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="租户名称">
          <el-input v-model="queryParams.tenantName" placeholder="请输入" clearable :icon="Search" />
        </el-form-item>
        <el-form-item label="租户编码">
          <el-input v-model="queryParams.tenantCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>租户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增租户</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="tenantName" label="租户名称" min-width="150" />
        <el-table-column prop="tenantCode" label="租户编码" min-width="120" />
        <el-table-column prop="packageId" label="套餐" min-width="100">
          <template #default="{ row }">
            {{ getPackageName(row.packageId) }}
          </template>
        </el-table-column>
        <el-table-column prop="expireTime" label="到期时间" min-width="120">
          <template #default="{ row }">
            {{ row.expireTime || '永久' }}
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" min-width="100" />
        <el-table-column prop="contactPhone" label="联系电话" min-width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" min-width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" v-if="row.status === 1" @click="handleEnable(row)">启用</el-button>
            <el-button link type="warning" v-if="row.status === 0" @click="handleDisable(row)">禁用</el-button>
            <el-button link type="success" @click="handleInit(row)">初始化</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-area">
        <el-pagination
          :current-page="queryParams.pageNum"
          :page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="租户名称" required>
          <el-input v-model="formData.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="租户编码" required>
          <el-input v-model="formData.tenantCode" placeholder="请输入租户编码" />
        </el-form-item>
        <el-form-item label="套餐">
          <el-select v-model="formData.packageId" placeholder="请选择套餐" style="width: 100%">
            <el-option
              v-for="item in packageList"
              :key="item.id"
              :label="item.packageName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间">
          <el-date-picker
            v-model="formData.expireTime"
            type="datetime"
            placeholder="选择到期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="formData.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="formData.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="formLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.tenant-container {
  padding: 20px;

  .search-card {
    margin-bottom: 16px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-area {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>