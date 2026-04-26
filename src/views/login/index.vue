<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElButton,
  ElCheckbox,
  ElIcon
} from 'element-plus'
import { User, Lock, Platform, EditPen, DataAnalysis } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
})

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login(loginForm.value.username, loginForm.value.password)
    router.push('/dashboard')
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="circle circle-4"></div>
    </div>

    <!-- 左侧品牌区域 -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo">
          <el-icon :size="60"><Platform /></el-icon>
        </div>
        <h1 class="brand-title">低代码平台</h1>
        <p class="brand-desc">快速构建企业级应用，让开发更简单</p>
        <div class="feature-list">
          <div class="feature-item">
            <el-icon :size="24"><EditPen /></el-icon>
            <span>可视化表单设计</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><DataAnalysis /></el-icon>
            <span>智能流程编排</span>
          </div>
          <div class="feature-item">
            <el-icon :size="24"><Platform /></el-icon>
            <span>一站式页面搭建</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录区域 -->
    <div class="login-section">
      <div class="login-box">
        <div class="login-header">
          <h2 class="login-title">欢迎登录</h2>
          <p class="login-subtitle">请输入您的账号信息</p>
        </div>

        <el-form :model="loginForm" class="login-form">
          <el-form-item>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
              class="login-input"
            />
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              class="login-input"
            />
          </el-form-item>
          <el-form-item class="remember-item">
            <el-checkbox v-model="loginForm.rememberMe">
              记住登录状态
            </el-checkbox>
            <a class="forgot-link" href="#">忘记密码？</a>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              class="login-btn"
              @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-footer">
          <p class="demo-tip">
            <el-icon><Lock /></el-icon>
            演示账号：admin / admin123
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  // 背景装饰圆圈
  .bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;

      &.circle-1 {
        width: 300px;
        height: 300px;
        top: -100px;
        left: -100px;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 200px;
        height: 200px;
        top: 20%;
        right: 10%;
        animation-delay: 2s;
      }

      &.circle-3 {
        width: 150px;
        height: 150px;
        bottom: 20%;
        left: 20%;
        animation-delay: 4s;
      }

      &.circle-4 {
        width: 100px;
        height: 100px;
        bottom: -50px;
        right: 30%;
        animation-delay: 6s;
      }
    }
  }

  // 左侧品牌区域
  .brand-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;

    .brand-content {
      max-width: 400px;
      color: #fff;
      text-align: center;

      .brand-logo {
        margin-bottom: 24px;
        animation: pulse 2s infinite;

        .el-icon {
          color: #fff;
        }
      }

      .brand-title {
        font-size: 42px;
        font-weight: 700;
        margin-bottom: 16px;
        letter-spacing: 2px;
        text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
      }

      .brand-desc {
        font-size: 18px;
        color: rgba(255, 255, 255, 0.9);
        margin-bottom: 40px;
        line-height: 1.6;
      }

      .feature-list {
        display: flex;
        flex-direction: column;
        gap: 16px;

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(10px);
          }

          .el-icon {
            color: rgba(255, 255, 255, 0.9);
          }

          span {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
          }
        }
      }
    }
  }

  // 右侧登录区域
  .login-section {
    width: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10%;
      bottom: 10%;
      width: 1px;
      background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    }

    .login-box {
      width: 100%;
      max-width: 360px;
      padding: 40px 32px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);

      .login-header {
        text-align: center;
        margin-bottom: 32px;

        .login-title {
          font-size: 24px;
          font-weight: 600;
          color: #1a1f36;
          margin-bottom: 8px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #909399;
        }
      }

      .login-form {
        .login-input {
          :deep(.el-input__wrapper) {
            border-radius: 12px;
            box-shadow: 0 0 0 1px #e4e7ed inset;
            padding: 4px 12px;
            height: 44px;
            transition: all 0.2s ease;

            &:hover {
              box-shadow: 0 0 0 1px #409eff inset;
            }

            &.is-focus {
              box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2) inset;
            }
          }

          :deep(.el-input__prefix-inner) {
            color: #409eff;
          }
        }

        .remember-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;

          :deep(.el-checkbox__label) {
            color: #606266;
            font-size: 14px;
          }

          .forgot-link {
            color: #409eff;
            font-size: 14px;
            text-decoration: none;
            transition: color 0.2s;

            &:hover {
              color: #66b1ff;
            }
          }
        }

        .login-btn {
          width: 100%;
          height: 44px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 500;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          letter-spacing: 4px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }

      .login-footer {
        text-align: center;
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #ebeef5;

        .demo-tip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #909399;
          font-size: 13px;

          .el-icon {
            color: #e6a23c;
          }
        }
      }
    }
  }
}

// 动画
@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .login-container {
    flex-direction: column;

    .brand-section {
      padding: 20px;

      .brand-content {
        .brand-title {
          font-size: 28px;
        }

        .feature-list {
          display: none;
        }
      }
    }

    .login-section {
      width: 100%;
      padding: 20px;

      &::before {
        display: none;
      }

      .login-box {
        padding: 24px 20px;
      }
    }
  }
}
</style>