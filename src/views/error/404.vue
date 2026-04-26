<script setup lang="ts">
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'

const router = useRouter()

const handleGoHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="not-found">
    <div class="not-found-content">
      <div class="not-found-code">404</div>
      <div class="not-found-title">页面不存在</div>
      <div class="not-found-message">
        您访问的页面可能已移除、名称更改或暂时不可用
      </div>
      <el-button type="primary" :icon="HomeFilled" size="large" @click="handleGoHome">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .not-found-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #fff;
    border-radius: 16px;
    padding: 60px 80px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .not-found-code {
    font-size: 120px;
    font-weight: 700;
    color: #409eff;
    line-height: 1;
    letter-spacing: 4px;
  }

  .not-found-title {
    font-size: 32px;
    color: #303133;
    margin-top: 20px;
    font-weight: 600;
  }

  .not-found-message {
    font-size: 16px;
    color: #909399;
    margin-top: 16px;
    text-align: center;
    max-width: 400px;
  }

  .el-button {
    margin-top: 40px;
    padding: 12px 32px;
    font-size: 16px;
  }
}
</style>