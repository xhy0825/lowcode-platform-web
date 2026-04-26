<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Back, RefreshRight, HomeFilled } from '@element-plus/icons-vue'

interface Props {
  code?: number
  title?: string
  message?: string
}

const props = withDefaults(defineProps<Props>(), {
  code: 500,
  title: '出错了',
  message: '服务器错误，请稍后重试'
})

const router = useRouter()

const handleGoBack = () => {
  router.back()
}

const handleRefresh = () => {
  router.go(0)
}

const handleGoHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="error-state">
    <div class="error-code">{{ code }}</div>
    <div class="error-title">{{ title }}</div>
    <div class="error-message">{{ message }}</div>
    <div class="error-actions">
      <el-button :icon="Back" @click="handleGoBack">返回上一页</el-button>
      <el-button :icon="RefreshRight" @click="handleRefresh">刷新页面</el-button>
      <el-button type="primary" :icon="HomeFilled" @click="handleGoHome">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;

  .error-code {
    font-size: 72px;
    font-weight: 700;
    color: #f56c6c;
    line-height: 1;
  }

  .error-title {
    font-size: 24px;
    color: #303133;
    margin-top: 20px;
    font-weight: 500;
  }

  .error-message {
    font-size: 14px;
    color: #909399;
    margin-top: 12px;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
  }
}
</style>