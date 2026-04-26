<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleApi, Role, permissionApi } from '@/api'

// 角色列表
const roleList = ref<Role[]>([])
const roleTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleCode: '',
  status: undefined as number | undefined
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const roleForm = ref<Role>({
  id: 0,
  tenantId: '',
  roleName: '',
  roleCode: '',
  dataScope: 'all',
  status: 0,
  remark: '',
  permissionIds: [],
  deptIds: []
})

// 权限分配弹窗
const permissionDialogVisible = ref(false)
const permissionTree = ref<any[]>([])
const checkedPermissions = ref<number[]>([])
const currentRoleId = ref(0)

// 数据权限弹窗
const dataScopeDialogVisible = ref(false)
const deptTree = ref<any[]>([])
const checkedDepts = ref<number[]>([])
const dataScopeForm = ref({
  roleId: 0,
  dataScope: 'all',
  deptIds: [] as number[]
})

// 数据权限范围选项
const dataScopeOptions = [
  { label: '全部数据', value: 'all' },
  { label: '自定义数据', value: 'custom' },
  { label: '本部门数据', value: 'dept' },
  { label: '本部门及以下', value: 'dept_and_child' },
  { label: '仅本人数据', value: 'self' }
]

// 获取角色列表
const getList = async () => {
  loading.value = true
  try {
    const res = await roleApi.list(query)
    roleList.value = res.data.list
    roleTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增角色'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Role) => {
  resetForm()
  dialogTitle.value = '编辑角色'
  roleApi.get(row.id).then(res => {
    roleForm.value = res.data
    dialogVisible.value = true
  })
}

// 删除
const handleDelete = (row: Role) => {
  ElMessageBox.confirm(`确认删除角色 "${row.roleName}" 吗?`, '提示', {
    type: 'warning'
  }).then(() => {
    roleApi.delete(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}

// 分配权限
const handleAssignPermission = (row: Role) => {
  currentRoleId.value = row.id
  roleApi.getPermissions(row.id).then(res => {
    checkedPermissions.value = res.data || []
    permissionDialogVisible.value = true
  })
}

// 分配数据权限
const handleAssignDataScope = (row: Role) => {
  dataScopeForm.value = {
    roleId: row.id,
    dataScope: row.dataScope || 'all',
    deptIds: []
  }
  dataScopeDialogVisible.value = true
}

// 提交角色表单
const handleSubmit = async () => {
  try {
    if (roleForm.value.id) {
      await roleApi.update(roleForm.value)
      ElMessage.success('修改成功')
    } else {
      await roleApi.create(roleForm.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
  }
}

// 保存权限
const handleSavePermissions = async () => {
  try {
    await roleApi.updatePermissions(currentRoleId.value, checkedPermissions.value)
    ElMessage.success('权限分配成功')
    permissionDialogVisible.value = false
  } catch (e) {
    console.error(e)
  }
}

// 保存数据权限
const handleSaveDataScope = async () => {
  try {
    await roleApi.updateDataScope(dataScopeForm.value.roleId, dataScopeForm.value)
    ElMessage.success('数据权限配置成功')
    dataScopeDialogVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
  }
}

// 重置表单
const resetForm = () => {
  roleForm.value = {
    id: 0,
    tenantId: '',
    roleName: '',
    roleCode: '',
    dataScope: 'all',
    status: 0,
    remark: '',
    permissionIds: [],
    deptIds: []
  }
}

// 分页
const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

const handleSizeChange = (size: number) => {
  query.pageSize = size
  getList()
}

// 加载权限树（模拟数据）
const loadPermissionTree = async () => {
  // 实际应从API获取
  permissionTree.value = [
    {
      id: 1,
      label: '系统管理',
      children: [
        { id: 2, label: '用户管理' },
        { id: 3, label: '角色管理' },
        { id: 4, label: '权限管理' },
        { id: 5, label: '数据字典' },
        { id: 6, label: '系统配置' }
      ]
    },
    {
      id: 10,
      label: '数据引擎',
      children: [
        { id: 11, label: '数据模型' },
        { id: 12, label: '表结构管理' }
      ]
    },
    {
      id: 15,
      label: '表单设计',
      children: [
        { id: 16, label: '表单列表' }
      ]
    }
  ]
}

// 加载部门树
const loadDeptTree = async () => {
  deptTree.value = [
    {
      id: 1,
      label: '总公司',
      children: [
        { id: 2, label: '研发部' },
        { id: 3, label: '市场部' },
        { id: 4, label: '财务部' },
        { id: 5, label: '人事部' }
      ]
    }
  ]
}

onMounted(() => {
  getList()
  loadPermissionTree()
  loadDeptTree()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="角色名称">
          <el-input v-model="query.roleName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="query.roleCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择" clearable>
            <el-option label="正常" :value="0" />
            <el-option label="禁用" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="query.roleName = ''; query.roleCode = ''; query.status = undefined; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <el-table :data="roleList" v-loading="loading" stripe>
        <el-table-column prop="roleName" label="角色名称" width="150" />
        <el-table-column prop="roleCode" label="角色编码" width="150" />
        <el-table-column prop="dataScope" label="数据权限" width="120">
          <template #default="{ row }">
            <el-tag :type="row.dataScope === 'all' ? 'success' : 'warning'">
              {{ dataScopeOptions.find(d => d.value === row.dataScope)?.label || row.dataScope }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleAssignPermission(row)">分配权限</el-button>
            <el-button link type="warning" @click="handleAssignDataScope(row)">数据权限</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="roleTotal"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称" required>
          <el-input v-model="roleForm.roleName" />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="roleForm.roleCode" placeholder="如：admin、user、dept_admin" />
        </el-form-item>
        <el-form-item label="数据权限">
          <el-select v-model="roleForm.dataScope">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="roleForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限分配弹窗 -->
    <el-dialog title="分配权限" v-model="permissionDialogVisible" width="400px">
      <el-tree
        :data="permissionTree"
        :props="{ label: 'label', children: 'children' }"
        show-checkbox
        node-key="id"
        :default-checked-keys="checkedPermissions"
        @check="(checked: any, checkedNodes: any) => checkedPermissions = checkedNodes.checkedKeys"
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存</el-button>
      </template>
    </el-dialog>

    <!-- 数据权限弹窗 -->
    <el-dialog title="配置数据权限" v-model="dataScopeDialogVisible" width="500px">
      <el-form :model="dataScopeForm" label-width="100px">
        <el-form-item label="数据权限范围">
          <el-select v-model="dataScopeForm.dataScope">
            <el-option v-for="item in dataScopeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="自定义部门" v-if="dataScopeForm.dataScope === 'custom'">
          <el-tree
            :data="deptTree"
            :props="{ label: 'label', children: 'children' }"
            show-checkbox
            node-key="id"
            :default-checked-keys="dataScopeForm.deptIds"
            @check="(checked: any, checkedNodes: any) => dataScopeForm.deptIds = checkedNodes.checkedKeys"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataScopeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDataScope">保存</el-button>
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