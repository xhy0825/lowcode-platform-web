# 低代码平台前端

基于 Vue 3 + TypeScript + Element Plus 构建的企业级低代码平台前端。

## 技术栈

- Vue 3.4.x - 前端框架
- TypeScript 5.x - 类型支持
- Element Plus 2.x - UI组件库
- Vite 5.x - 构建工具
- Pinia 2.x - 状态管理
- Vue Router 4.x - 路由管理
- Axios 1.x - HTTP请求
- ECharts 5.x - 图表库
- Vue Flow - 流程设计可视化
- Monaco Editor - 代码编辑器

## 项目结构

```
src/
├── modules/              # 功能模块
│   ├── system/           # 系统管理
│   │   ├── user/         # 用户管理
│   │   ├── role/         # 角色管理
│   │   ├── permission/   # 权限管理
│   │   ├── dict/         # 数据字典
│   │   ├── config/       # 系统配置
│   │   ├── command/      # 命令管理
│   │   └── tenant/       # 租户管理
│   ├── data/             # 数据引擎
│   │   ├── model/        # 数据模型设计
│   │   └── table/        # 表结构管理
│   ├── form/             # 表单设计
│   │   ├── list/         # 表单列表
│   │   └── designer/     # 表单设计器
│   ├── flow/             # 流程设计
│   │   ├── list/         # 流程列表
│   │   └── designer/     # 流程设计器
│   ├── page/             # 页面搭建
│   │   ├── list/         # 页面列表
│   │   └── builder/      # 页面搭建器
│   └── report/           # 报表设计
│       ├── list/         # 报表列表
│       └── designer/     # 报表设计器
├── components/           # 组件库
│   ├── form-widgets/     # 表单组件
│   ├── page-widgets/     # 页面组件
│   ├── flow-widgets/     # 流程节点组件
│   ├── chart-widgets/    # 图表组件
│   └── code-editor/      # Groovy编辑器
├── api/                  # API层
│   ├── request.ts        # Axios封装
│   └── index.ts          # API定义
├── stores/               # Pinia状态
│   └── user.ts           # 用户状态
├── router/               # 路由配置
│   └── index.ts
├── layouts/              # 布局组件
│   └── BasicLayout.vue
├── views/                # 基础页面
│   ├── login/            # 登录页
│   └── dashboard/        # 仪表盘
├── styles/               # 全局样式
│   └── index.scss
├── utils/                # 工具函数
├── hooks/                # 自定义Hooks
├── types/                # 类型定义
├── App.vue
└── main.ts
```

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览
npm run preview
```

## 功能模块

### 系统管理
- 用户管理：用户增删改查、角色分配、密码重置
- 角色管理：角色定义、权限分配、数据权限
- 权限管理：菜单、按钮、API权限配置
- 数据字典：字典类型和数据项管理
- 系统配置：系统参数配置
- 命令管理：Groovy脚本管理、执行日志
- 租户管理：租户创建、套餐管理

### 数据引擎
- 数据模型：可视化设计数据模型
- 动态建表：自动生成DDL并执行

### 表单设计
- 表单列表：管理所有表单
- 表单设计器：拖拽式表单设计

### 流程设计
- 流程列表：管理所有流程
- 流程设计器：可视化流程节点配置

### 页面搭建
- 页面列表：管理所有页面
- 页面搭建器：组件化页面布局

### 报表设计
- 报表列表：管理所有报表
- 报表设计器：图表配置、仪表盘

## 路由配置

| 路径 | 模块 | 说明 |
|------|------|------|
| /login | 登录 | 用户登录页 |
| /dashboard | 仪表盘 | 系统概览 |
| /system/* | 系统管理 | 用户、角色、权限等 |
| /data/* | 数据引擎 | 模型、表结构 |
| /form/* | 表单设计 | 表单列表、设计器 |
| /flow/* | 流程设计 | 流程列表、设计器 |
| /page/* | 页面搭建 | 页面列表、搭建器 |
| /report/* | 报表设计 | 报表列表、设计器 |

## API接口

所有API通过 `/api` 前缀访问，由Gateway转发：

```
/api/system/*  -> system-service
/api/data/*    -> data-service
/api/form/*    -> form-service
/api/flow/*    -> flow-service
/api/page/*    -> page-service
/api/report/*  -> report-service
/api/file/*    -> file-service
```

## 默认账号

- 用户名: `admin`
- 密码: `admin123`