<script setup lang="ts">
import { FolderOpen, Search, File, Warning } from '@element-plus/icons-vue'

interface Props {
  type?: 'empty' | 'search' | 'file' | 'warning'
  title?: string
  description?: string
  showAction?: boolean
  actionText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'empty',
  title: '暂无数据',
  description: '',
  showAction: false,
  actionText: '添加'
})

const emit = defineEmits(['action'])

const iconMap = {
  empty: FolderOpen,
  search: Search,
  file: File,
  warning: Warning
}

const colorMap = {
  empty: '#909399',
  search: '#409eff',
  file: '#67c23a',
  warning: '#e6a23c'
}
</script>

<template>
  <div class="empty-state">
    <el-icon :size="64" :color="colorMap[type]">
      <component :is="iconMap[type]" />
    </el-icon>
    <div class="empty-title">{{ title }}</div>
    <div class="empty-description" v-if="description">{{ description }}</div>
    <el-button type="primary" v-if="showAction" @click="emit('action')">
      {{ actionText }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 12px;
  min-height: 300px;

  .empty-title {
    margin-top: 16px;
    font-size: 16px;
    color: #606266;
    font-weight: 500;
  }

  .empty-description {
    margin-top: 8px;
    font-size: 14px;
    color: #909399;
  }

  .el-button {
    margin-top: 20px;
  }
}
</style>