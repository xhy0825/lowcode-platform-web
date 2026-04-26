<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

interface Props {
  text?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '加载中...',
  fullscreen: false
})
</script>

<template>
  <div class="loading-state" :class="{ fullscreen }">
    <div class="loading-content">
      <el-icon class="loading-icon" :size="32">
        <Loading />
      </el-icon>
      <span class="loading-text">{{ text }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    padding: 0;
    background: rgba(255, 255, 255, 0.95);
  }

  .loading-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .loading-icon {
    animation: rotate 1s linear infinite;
    color: #409eff;
  }

  .loading-text {
    font-size: 14px;
    color: #606266;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>