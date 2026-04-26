<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  ElContainer,
  ElAside,
  ElHeader,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElAvatar,
  ElIcon,
  ElTooltip
} from 'element-plus'
import {
  Odometer,
  Setting,
  DataAnalysis,
  EditPen,
  Share,
  Grid,
  TrendCharts,
  User,
  SwitchButton,
  Expand,
  Fold
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)

const menuList = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    icon: Odometer,
    title: '仪表盘'
  },
  {
    path: '/system',
    name: 'System',
    icon: Setting,
    title: '系统管理',
    children: [
      { path: '/system/user', title: '用户管理' },
      { path: '/system/role', title: '角色管理' },
      { path: '/system/permission', title: '权限管理' },
      { path: '/system/dict', title: '数据字典' },
      { path: '/system/config', title: '系统配置' },
      { path: '/system/command', title: '命令管理' },
      { path: '/system/tenant', title: '租户管理' }
    ]
  },
  {
    path: '/data',
    name: 'Data',
    icon: DataAnalysis,
    title: '数据引擎',
    children: [
      { path: '/data/model', title: '数据模型' },
      { path: '/data/table', title: '表结构管理' }
    ]
  },
  {
    path: '/form',
    name: 'Form',
    icon: EditPen,
    title: '表单设计',
    children: [
      { path: '/form/list', title: '表单列表' }
    ]
  },
  {
    path: '/flow',
    name: 'Flow',
    icon: Share,
    title: '流程设计',
    children: [
      { path: '/flow/list', title: '流程列表' },
      { path: '/flow/tasks', title: '审批任务' },
      { path: '/flow/instances', title: '流程实例' }
    ]
  },
  {
    path: '/page',
    name: 'Page',
    icon: Grid,
    title: '页面搭建',
    children: [
      { path: '/page/home', title: '搭建中心' },
      { path: '/page/list', title: '页面列表' }
    ]
  },
  {
    path: '/report',
    name: 'Report',
    icon: TrendCharts,
    title: '报表设计',
    children: [
      { path: '/report/list', title: '报表列表' }
    ]
  }
]

const activeMenu = computed(() => route.path)

const getPageTitle = () => {
  const path = route.path
  // 根据路由路径匹配标题
  const titleMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/profile': '个人中心',
    '/system/user': '用户管理',
    '/system/role': '角色管理',
    '/system/permission': '权限管理',
    '/system/dict': '数据字典',
    '/system/config': '系统配置',
    '/system/command': '命令管理',
    '/system/tenant': '租户管理',
    '/data/model': '数据模型',
    '/data/table': '表结构管理',
    '/form/list': '表单列表',
    '/flow/list': '流程列表',
    '/flow/tasks': '审批任务',
    '/flow/instances': '流程实例',
    '/page/home': '页面搭建中心',
    '/page/list': '页面列表',
    '/report/list': '报表列表'
  }
  return titleMap[path] || '低代码平台'
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const handleGoProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <span v-if="!isCollapse">低代码平台</span>
        <span v-else>LC</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        class="layout-menu"
        router
      >
        <template v-for="menu in menuList" :key="menu.path">
          <!-- 有子菜单 -->
          <el-sub-menu v-if="menu.children" :index="menu.path">
            <template #title>
              <el-icon><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.path"
              :index="child.path"
            >
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>
          <!-- 无子菜单 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon><component :is="menu.icon" /></el-icon>
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
      <!-- 底部折叠按钮 -->
      <div class="sidebar-footer">
        <el-tooltip
          :content="isCollapse ? '展开菜单' : '收起菜单'"
          placement="right"
          :show-after="300"
        >
          <div class="collapse-btn-wrapper" @click="isCollapse = !isCollapse">
            <el-icon class="collapse-icon" :size="18">
              <Expand v-if="isCollapse" />
              <Fold v-else />
            </el-icon>
            <span v-if="!isCollapse" class="collapse-text">收起菜单</span>
          </div>
        </el-tooltip>
      </div>
    </el-aside>

    <el-container>
      <!-- 顶部 -->
      <el-header class="layout-header">
        <div class="header-left">
          <span class="page-title">{{ getPageTitle() }}</span>
        </div>
        <div class="header-right">
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" icon="User" />
              <span class="username">{{ userStore.realName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleGoProfile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background: linear-gradient(180deg, #1a1f36 0%, #252b48 100%);
  transition: width 0.3s;
  display: flex;
  flex-direction: column;

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    letter-spacing: 2px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .layout-menu {
    border-right: none;
    background: transparent;
    color: #bfcbd9;
    flex: 1;
    overflow-y: auto;

    &:not(.el-menu--collapse) {
      width: 220px;
    }

    // 主菜单项样式
    :deep(.el-menu-item) {
      color: #bfcbd9;
      background: transparent;
      border-radius: 8px;
      margin: 4px 12px;
      padding-left: 20px !important;

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.08);
      }

      &.is-active {
        color: #fff;
        background: linear-gradient(90deg, rgba(64, 158, 255, 0.3) 0%, rgba(64, 158, 255, 0.1) 100%);
        border-left: 3px solid #409eff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }
    }

    // 子菜单标题样式
    :deep(.el-sub-menu__title) {
      color: #bfcbd9;
      background: transparent;
      border-radius: 8px;
      margin: 4px 12px;
      padding-left: 20px !important;

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.08);
      }

      .el-icon {
        color: #409eff;
      }
    }

    // 已展开的子菜单标题
    :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);

      .el-icon {
        color: #67c23a;
      }
    }

    // 子菜单内部
    :deep(.el-sub-menu .el-menu) {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      margin: 0 12px;
      padding: 8px 0;

      .el-menu-item {
        color: #a3b1cc;
        padding-left: 40px !important;
        margin: 2px 8px;
        border-radius: 6px;

        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        &.is-active {
          color: #fff;
          background: linear-gradient(90deg, rgba(103, 194, 58, 0.25) 0%, rgba(103, 194, 58, 0.1) 100%);
          border-left: 2px solid #67c23a;
        }
      }
    }

    // 折叠状态样式
    &.el-menu--collapse {
      :deep(.el-menu-item),
      :deep(.el-sub-menu__title) {
        padding-left: 20px !important;
        text-align: center;

        span {
          display: none;
        }

        .el-icon {
          margin-right: 0;
        }
      }
    }
  }

  // 底部折叠按钮区域
  .sidebar-footer {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);

    .collapse-btn-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      color: #a3b1cc;

      &:hover {
        color: #fff;
        background: rgba(64, 158, 255, 0.15);
      }

      .collapse-icon {
        transition: transform 0.2s;
      }

      &:hover .collapse-icon {
        transform: scale(1.1);
      }

      .collapse-text {
        margin-left: 8px;
        font-size: 14px;
      }
    }
  }
}

.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #f8f9fa 0%, #fff 100%);
  box-shadow: 0 2px 8px rgba(0, 21, 41, 0.12);
  padding: 0 20px;
  border-bottom: 1px solid #e8e8e8;

  .header-left {
    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1f36;
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: rgba(64, 158, 255, 0.08);
    }

    .username {
      margin-left: 8px;
      color: #5a5e66;
      font-weight: 500;
    }
  }
}

.layout-main {
  background: linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%);
  padding: 20px;
  overflow-y: auto;
}
</style>