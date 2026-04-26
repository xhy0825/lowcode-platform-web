<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { permissionApi, Permission } from '@/api'

const permissionTree = ref<Permission[]>([])
const loading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const res = await permissionApi.tree()
    permissionTree.value = res.data
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
          <span>权限管理</span>
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <el-tree
        :data="permissionTree"
        :props="{ label: 'permissionName', children: 'children' }"
        default-expand-all
        node-key="id"
        v-loading="loading"
      >
        <template #default="{ node, data }">
          <div class="tree-node">
            <span class="node-label">
              <el-icon v-if="data.permissionType === 'menu'"><Folder /></el-icon>
              <el-icon v-else-if="data.permissionType === 'button'"><Position /></el-icon>
              <el-icon v-else><Key /></el-icon>
              {{ data.permissionName }}
            </span>
            <span class="node-info">
              <el-tag size="small" type="info">{{ data.permissionCode }}</el-tag>
              <el-tag size="small" :type="data.permissionType === 'menu' ? 'success' : 'warning'">
                {{ data.permissionType }}
              </el-tag>
            </span>
          </div>
        </template>
      </el-tree>
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
  .tree-node {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .node-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .node-info {
      display: flex;
      gap: 8px;
    }
  }
}
</style>