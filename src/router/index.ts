import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layouts/BasicLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'Dashboard' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: { title: '个人中心', hidden: true }
      },
      // 系统管理
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'Setting' },
        children: [
          {
            path: 'user',
            name: 'User',
            component: () => import('@/modules/system/user/index.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'role',
            name: 'Role',
            component: () => import('@/modules/system/role/index.vue'),
            meta: { title: '角色管理' }
          },
          {
            path: 'permission',
            name: 'Permission',
            component: () => import('@/modules/system/permission/index.vue'),
            meta: { title: '权限管理' }
          },
          {
            path: 'dict',
            name: 'Dict',
            component: () => import('@/modules/system/dict/index.vue'),
            meta: { title: '数据字典' }
          },
          {
            path: 'config',
            name: 'Config',
            component: () => import('@/modules/system/config/index.vue'),
            meta: { title: '系统配置' }
          },
          {
            path: 'command',
            name: 'Command',
            component: () => import('@/modules/system/command/index.vue'),
            meta: { title: '命令管理' }
          },
          {
            path: 'tenant',
            name: 'Tenant',
            component: () => import('@/modules/system/tenant/index.vue'),
            meta: { title: '租户管理' }
          }
        ]
      },
      // 数据引擎
      {
        path: 'data',
        name: 'Data',
        redirect: '/data/model',
        meta: { title: '数据引擎', icon: 'DataAnalysis' },
        children: [
          {
            path: 'model',
            name: 'DataModel',
            component: () => import('@/modules/data/model/index.vue'),
            meta: { title: '数据模型' }
          },
          {
            path: 'table',
            name: 'DataTable',
            component: () => import('@/modules/data/table/index.vue'),
            meta: { title: '表结构管理' }
          }
        ]
      },
      // 表单设计
      {
        path: 'form',
        name: 'Form',
        meta: { title: '表单设计', icon: 'EditPen' },
        children: [
          {
            path: 'list',
            name: 'FormList',
            component: () => import('@/modules/form/list/index.vue'),
            meta: { title: '表单列表' }
          },
          {
            path: 'designer/:id?',
            name: 'FormDesigner',
            component: () => import('@/modules/form/designer/index.vue'),
            meta: { title: '表单设计器', hidden: true }
          }
        ]
      },
      // 流程设计
      {
        path: 'flow',
        name: 'Flow',
        meta: { title: '流程设计', icon: 'Share' },
        children: [
          {
            path: 'list',
            name: 'FlowList',
            component: () => import('@/modules/flow/list/index.vue'),
            meta: { title: '流程列表' }
          },
          {
            path: 'designer/:id?',
            name: 'FlowDesigner',
            component: () => import('@/modules/flow/designer/index.vue'),
            meta: { title: '流程设计器', hidden: true }
          },
          {
            path: 'start/:id',
            name: 'FlowStart',
            component: () => import('@/modules/flow/start/index.vue'),
            meta: { title: '发起流程', hidden: true }
          },
          {
            path: 'instances/:flowId?',
            name: 'FlowInstances',
            component: () => import('@/modules/flow/instances/index.vue'),
            meta: { title: '流程实例' }
          },
          {
            path: 'instance/:id',
            name: 'FlowInstanceDetail',
            component: () => import('@/modules/flow/instances/index.vue'),
            meta: { title: '实例详情', hidden: true }
          },
          {
            path: 'tasks/:instanceId?',
            name: 'FlowTasks',
            component: () => import('@/modules/flow/task/index.vue'),
            meta: { title: '审批任务' }
          },
          {
            path: 'form-data/:instanceId',
            name: 'FlowFormData',
            component: () => import('@/modules/flow/start/index.vue'),
            meta: { title: '表单数据', hidden: true }
          }
        ]
      },
      // 页面搭建
      {
        path: 'page',
        name: 'Page',
        redirect: '/page/home',
        meta: { title: '页面搭建', icon: 'Grid' },
        children: [
          {
            path: 'home',
            name: 'PageHome',
            component: () => import('@/modules/page/home/index.vue'),
            meta: { title: '搭建中心', icon: 'Grid' }
          },
          {
            path: 'list',
            name: 'PageList',
            component: () => import('@/modules/page/list/index.vue'),
            meta: { title: '页面列表' }
          },
          {
            path: 'builder/:id?',
            name: 'PageBuilder',
            component: () => import('@/modules/page/builder/index.vue'),
            meta: { title: '页面搭建器', hidden: true }
          },
          {
            path: 'view/:id',
            name: 'PageView',
            component: () => import('@/modules/page/builder/index.vue'),
            meta: { title: '页面预览', hidden: true }
          }
        ]
      },
      // 报表设计
      {
        path: 'report',
        name: 'Report',
        meta: { title: '报表设计', icon: 'TrendCharts' },
        children: [
          {
            path: 'list',
            name: 'ReportList',
            component: () => import('@/modules/report/list/index.vue'),
            meta: { title: '报表列表' }
          },
          {
            path: 'designer/:id?',
            name: 'ReportDesigner',
            component: () => import('@/modules/report/designer/index.vue'),
            meta: { title: '报表设计器', hidden: true }
          }
        ]
      }
    ]
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '页面不存在' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router