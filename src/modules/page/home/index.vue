<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 组件配置接口
interface ComponentConfig {
  id: string
  type: string
  label: string
  x: number
  y: number
  width: number
  height: number
  config: Record<string, any>
}

// 页面模板接口
interface PageTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  previewImage: string
  pageType: string
  defaultComponents: ComponentConfig[]
  tags: string[]
  features: string[]
}

// 模板分类
const categories = [
  { id: 'all', name: '全部模板', icon: 'Grid' },
  { id: 'list', name: '列表页面', icon: 'List' },
  { id: 'form', name: '表单页面', icon: 'EditPen' },
  { id: 'dashboard', name: '仪表盘', icon: 'Odometer' },
  { id: 'detail', name: '详情页面', icon: 'Document' }
]

// 当前选中分类
const activeCategory = ref('all')

// 预览对话框状态
const previewDialog = ref(false)
const currentPreviewTemplate = ref<PageTemplate | null>(null)
const previewMode = ref<'layout' | 'data' | 'config'>('layout')

// 预设模板列表（增强版）
const templates: PageTemplate[] = [
  {
    id: 'blank',
    name: '空白页面',
    description: '从零开始设计页面，完全自由布局',
    category: 'all',
    icon: 'Document',
    previewImage: '',
    pageType: 'blank',
    defaultComponents: [],
    tags: ['自定义', '灵活'],
    features: ['自由布局', '无预设组件', '完全自定义']
  },
  {
    id: 'standard-list',
    name: '标准列表页',
    description: '包含搜索栏、数据表格、分页的完整列表页面，支持多种数据展示',
    category: 'list',
    icon: 'List',
    previewImage: 'list-standard',
    pageType: 'list',
    defaultComponents: [
      {
        id: 'search-card',
        type: 'card',
        label: '搜索栏',
        x: 0, y: 0, width: 12, height: 2,
        config: {
          title: '搜索条件',
          collapsible: true,
          fields: [
            { name: 'keyword', label: '关键词', type: 'input', placeholder: '请输入关键词' },
            { name: 'status', label: '状态', type: 'select', options: ['全部', '启用', '禁用'] },
            { name: 'dateRange', label: '日期范围', type: 'dateRange' }
          ]
        }
      },
      {
        id: 'data-table',
        type: 'table',
        label: '数据表格',
        x: 0, y: 3, width: 12, height: 6,
        config: {
          columns: [
            { prop: 'id', label: 'ID', width: 80 },
            { prop: 'name', label: '名称', width: 150 },
            { prop: 'status', label: '状态', width: 100, type: 'tag' },
            { prop: 'createTime', label: '创建时间', width: 180 },
            { prop: 'action', label: '操作', width: 200, fixed: 'right' }
          ],
          showIndex: true,
          showSelection: true,
          stripe: true,
          border: true
        }
      },
      {
        id: 'pagination',
        type: 'pagination',
        label: '分页组件',
        x: 0, y: 10, width: 12, height: 1,
        config: {
          pageSize: 10,
          pageSizes: [10, 20, 50, 100],
          layout: 'total, sizes, prev, pager, next, jumper'
        }
      }
    ],
    tags: ['常用', '数据展示'],
    features: ['高级搜索', '分页支持', '表格排序', '行选择']
  },
  {
    id: 'crud-list',
    name: 'CRUD列表页',
    description: '支持增删改查的完整数据管理页面，包含工具栏和批量操作',
    category: 'list',
    icon: 'Operation',
    previewImage: 'list-crud',
    pageType: 'list',
    defaultComponents: [
      {
        id: 'toolbar',
        type: 'toolbar',
        label: '工具栏',
        x: 0, y: 0, width: 12, height: 1,
        config: {
          buttons: [
            { label: '新增', type: 'primary', icon: 'Plus', action: 'create' },
            { label: '导出', type: 'success', icon: 'Download', action: 'export' },
            { label: '批量删除', type: 'danger', icon: 'Delete', action: 'batchDelete' },
            { label: '刷新', type: 'default', icon: 'Refresh', action: 'refresh' }
          ]
        }
      },
      {
        id: 'search-card',
        type: 'card',
        label: '搜索栏',
        x: 0, y: 2, width: 12, height: 2,
        config: {
          title: '筛选条件',
          fields: [
            { name: 'keyword', label: '关键词', type: 'input' },
            { name: 'category', label: '分类', type: 'select' },
            { name: 'status', label: '状态', type: 'select' }
          ]
        }
      },
      {
        id: 'data-table',
        type: 'table',
        label: '数据表格',
        x: 0, y: 5, width: 12, height: 7,
        config: {
          columns: [
            { prop: 'id', label: 'ID', width: 80 },
            { prop: 'name', label: '名称', width: 150, sortable: true },
            { prop: 'category', label: '分类', width: 120 },
            { prop: 'status', label: '状态', width: 100, type: 'tag' },
            { prop: 'createTime', label: '创建时间', width: 180, sortable: true },
            { prop: 'updateTime', label: '更新时间', width: 180 },
            { prop: 'action', label: '操作', width: 180, fixed: 'right' }
          ],
          rowActions: [
            { label: '编辑', type: 'primary', icon: 'Edit' },
            { label: '删除', type: 'danger', icon: 'Delete' },
            { label: '详情', type: 'default', icon: 'View' }
          ]
        }
      },
      {
        id: 'pagination',
        type: 'pagination',
        label: '分页组件',
        x: 0, y: 13, width: 12, height: 1,
        config: { pageSize: 20, layout: 'total, sizes, prev, pager, next' }
      }
    ],
    tags: ['数据管理', '增删改查'],
    features: ['批量操作', '行内编辑', '数据导出', '高级筛选']
  },
  {
    id: 'simple-form',
    name: '简单表单页',
    description: '基础的表单录入页面，适合简单数据采集场景',
    category: 'form',
    icon: 'EditPen',
    previewImage: 'form-simple',
    pageType: 'form',
    defaultComponents: [
      {
        id: 'form-header',
        type: 'card',
        label: '表单标题',
        x: 0, y: 0, width: 12, height: 1,
        config: { title: '基本信息录入', showDivider: true }
      },
      {
        id: 'form-main',
        type: 'form',
        label: '表单主体',
        x: 0, y: 2, width: 12, height: 6,
        config: {
          layout: 'horizontal',
          labelWidth: 100,
          fields: [
            { name: 'title', label: '标题', type: 'input', required: true, placeholder: '请输入标题', span: 12 },
            { name: 'category', label: '分类', type: 'select', required: true, options: ['分类A', '分类B', '分类C'], span: 12 },
            { name: 'description', label: '描述', type: 'textarea', rows: 3, placeholder: '请输入描述内容', span: 24 },
            { name: 'priority', label: '优先级', type: 'radio', options: ['高', '中', '低'], span: 12 },
            { name: 'status', label: '状态', type: 'switch', span: 12 }
          ]
        }
      },
      {
        id: 'form-buttons',
        type: 'buttonGroup',
        label: '提交按钮组',
        x: 4, y: 9, width: 4, height: 1,
        config: {
          buttons: [
            { label: '提交', type: 'primary', icon: 'Check', action: 'submit' },
            { label: '重置', type: 'default', icon: 'RefreshLeft', action: 'reset' },
            { label: '取消', type: 'default', action: 'cancel' }
          ],
          align: 'center'
        }
      }
    ],
    tags: ['数据录入', '基础'],
    features: ['表单校验', '必填提示', '数据重置', '提交确认']
  },
  {
    id: 'multi-step-form',
    name: '分步表单页',
    description: '多步骤复杂表单，适合大量数据分步录入，引导用户完成复杂操作',
    category: 'form',
    icon: 'Share',
    previewImage: 'form-steps',
    pageType: 'form',
    defaultComponents: [
      {
        id: 'steps-header',
        type: 'steps',
        label: '步骤条',
        x: 0, y: 0, width: 12, height: 1,
        config: {
          steps: [
            { title: '基本信息', description: '填写基础信息' },
            { title: '详细信息', description: '补充详细内容' },
            { title: '确认提交', description: '检查并提交' }
          ],
          activeStep: 0,
          simple: false
        }
      },
      {
        id: 'step1-form',
        type: 'form',
        label: '第一步表单',
        x: 0, y: 2, width: 12, height: 4,
        config: {
          step: 1,
          fields: [
            { name: 'name', label: '姓名', type: 'input', required: true, span: 12 },
            { name: 'phone', label: '手机号', type: 'input', required: true, span: 12 },
            { name: 'email', label: '邮箱', type: 'input', span: 12 },
            { name: 'dept', label: '部门', type: 'select', options: ['研发部', '产品部', '运营部'], span: 12 }
          ]
        }
      },
      {
        id: 'step2-form',
        type: 'form',
        label: '第二步表单',
        x: 0, y: 7, width: 12, height: 4,
        config: {
          step: 2,
          fields: [
            { name: 'address', label: '地址', type: 'input', span: 24 },
            { name: 'remark', label: '备注', type: 'textarea', rows: 4, span: 24 }
          ]
        }
      },
      {
        id: 'step-buttons',
        type: 'buttonGroup',
        label: '操作按钮',
        x: 0, y: 12, width: 12, height: 1,
        config: {
          buttons: [
            { label: '上一步', type: 'default', icon: 'ArrowLeft', action: 'prev', showOn: 'step > 1' },
            { label: '下一步', type: 'primary', icon: 'ArrowRight', action: 'next', showOn: 'step < 3' },
            { label: '提交', type: 'success', icon: 'Check', action: 'submit', showOn: 'step === 3' }
          ],
          align: 'center'
        }
      }
    ],
    tags: ['复杂', '分步'],
    features: ['分步引导', '进度保存', '数据校验', '步骤回退']
  },
  {
    id: 'dashboard-standard',
    name: '标准仪表盘',
    description: '包含统计卡片、图表、快捷操作的仪表盘，适合管理首页',
    category: 'dashboard',
    icon: 'Odometer',
    previewImage: 'dashboard-standard',
    pageType: 'dashboard',
    defaultComponents: [
      {
        id: 'stat-card1',
        type: 'statCard',
        label: '用户统计',
        x: 0, y: 0, width: 3, height: 2,
        config: {
          title: '总用户数',
          value: 12580,
          unit: '人',
          trend: '+12.5%',
          trendType: 'up',
          icon: 'User',
          color: '#409eff'
        }
      },
      {
        id: 'stat-card2',
        type: 'statCard',
        label: '订单统计',
        x: 3, y: 0, width: 3, height: 2,
        config: {
          title: '今日订单',
          value: 389,
          unit: '单',
          trend: '+8.2%',
          trendType: 'up',
          icon: 'ShoppingCart',
          color: '#67c23a'
        }
      },
      {
        id: 'stat-card3',
        type: 'statCard',
        label: '收入统计',
        x: 6, y: 0, width: 3, height: 2,
        config: {
          title: '本月收入',
          value: 52680,
          unit: '元',
          trend: '-3.1%',
          trendType: 'down',
          icon: 'Money',
          color: '#e6a23c'
        }
      },
      {
        id: 'stat-card4',
        type: 'statCard',
        label: '待处理',
        x: 9, y: 0, width: 3, height: 2,
        config: {
          title: '待处理任务',
          value: 56,
          unit: '项',
          trend: '待处理',
          trendType: 'warning',
          icon: 'Bell',
          color: '#f56c6c'
        }
      },
      {
        id: 'chart-bar',
        type: 'chart_bar',
        label: '柱状图',
        x: 0, y: 3, width: 6, height: 4,
        config: {
          title: '月度销售统计',
          dataSource: 'sales_monthly',
          showLegend: true,
          colors: ['#409eff', '#67c23a']
        }
      },
      {
        id: 'chart-line',
        type: 'chart_line',
        label: '折线图',
        x: 6, y: 3, width: 6, height: 4,
        config: {
          title: '用户增长趋势',
          dataSource: 'user_growth',
          smooth: true,
          showArea: true
        }
      },
      {
        id: 'quick-actions',
        type: 'card',
        label: '快捷操作',
        x: 0, y: 8, width: 4, height: 3,
        config: {
          title: '快捷操作',
          actions: [
            { label: '新建用户', icon: 'Plus', path: '/system/user' },
            { label: '数据导出', icon: 'Download', action: 'export' },
            { label: '系统设置', icon: 'Setting', path: '/system/config' },
            { label: '查看日志', icon: 'Document', path: '/system/log' }
          ]
        }
      },
      {
        id: 'recent-activities',
        type: 'timeline',
        label: '最近动态',
        x: 4, y: 8, width: 8, height: 3,
        config: {
          title: '最近动态',
          maxItems: 10,
          showTime: true
        }
      }
    ],
    tags: ['数据可视化', '统计'],
    features: ['统计卡片', '趋势展示', '快捷入口', '动态追踪']
  },
  {
    id: 'dashboard-analytics',
    name: '数据分析仪表盘',
    description: '多种图表组合的数据分析页面，适合深度数据分析场景',
    category: 'dashboard',
    icon: 'TrendCharts',
    previewImage: 'dashboard-analytics',
    pageType: 'dashboard',
    defaultComponents: [
      {
        id: 'page-header',
        type: 'card',
        label: '页面标题',
        x: 0, y: 0, width: 12, height: 1,
        config: { title: '数据分析报告', subTitle: '2024年度数据分析' }
      },
      {
        id: 'kpi-gauge1',
        type: 'chart_gauge',
        label: 'KPI仪表1',
        x: 0, y: 2, width: 3, height: 3,
        config: { title: '完成率', value: 78, maxValue: 100, color: '#409eff' }
      },
      {
        id: 'kpi-gauge2',
        type: 'chart_gauge',
        label: 'KPI仪表2',
        x: 3, y: 2, width: 3, height: 3,
        config: { title: '满意度', value: 92, maxValue: 100, color: '#67c23a' }
      },
      {
        id: 'kpi-gauge3',
        type: 'chart_gauge',
        label: 'KPI仪表3',
        x: 6, y: 2, width: 3, height: 3,
        config: { title: '效率', value: 65, maxValue: 100, color: '#e6a23c' }
      },
      {
        id: 'kpi-gauge4',
        type: 'chart_gauge',
        label: 'KPI仪表4',
        x: 9, y: 2, width: 3, height: 3,
        config: { title: '增长率', value: 45, maxValue: 100, color: '#f56c6c' }
      },
      {
        id: 'chart-bar',
        type: 'chart_bar',
        label: '柱状图',
        x: 0, y: 6, width: 6, height: 4,
        config: { title: '部门业绩对比', dataSource: 'dept_performance', horizontal: false }
      },
      {
        id: 'chart-pie',
        type: 'chart_pie',
        label: '饼图',
        x: 6, y: 6, width: 6, height: 4,
        config: { title: '客户来源分布', dataSource: 'customer_source', showLegend: true, radius: ['40%', '70%'] }
      },
      {
        id: 'chart-line',
        type: 'chart_line',
        label: '趋势图',
        x: 0, y: 11, width: 12, height: 4,
        config: { title: '年度趋势分析', dataSource: 'yearly_trend', smooth: true, showDataZoom: true }
      }
    ],
    tags: ['数据分析', 'KPI'],
    features: ['KPI仪表', '多维图表', '趋势分析', '数据钻取']
  },
  {
    id: 'detail-standard',
    name: '标准详情页',
    description: '展示单条数据详情的页面，包含基本信息和操作记录',
    category: 'detail',
    icon: 'Document',
    previewImage: 'detail-standard',
    pageType: 'detail',
    defaultComponents: [
      {
        id: 'basic-info',
        type: 'card',
        label: '基本信息',
        x: 0, y: 0, width: 12, height: 2,
        config: {
          title: '基本信息',
          fields: [
            { label: '编号', value: 'D20240001' },
            { label: '名称', value: '示例数据' },
            { label: '状态', value: '正常', type: 'tag' },
            { label: '创建时间', value: '2024-01-15 10:30:00' }
          ],
          layout: 'horizontal'
        }
      },
      {
        id: 'detail-card1',
        type: 'card',
        label: '详情卡片1',
        x: 0, y: 3, width: 6, height: 3,
        config: {
          title: '扩展信息',
          fields: [
            { label: '负责人', value: '张三' },
            { label: '部门', value: '研发部' },
            { label: '优先级', value: '高' },
            { label: '备注', value: '重要项目' }
          ]
        }
      },
      {
        id: 'detail-card2',
        type: 'card',
        label: '详情卡片2',
        x: 6, y: 3, width: 6, height: 3,
        config: {
          title: '关联信息',
          fields: [
            { label: '关联项目', value: '项目A' },
            { label: '关联任务', value: '3个' },
            { label: '附件数量', value: '5个' }
          ]
        }
      },
      {
        id: 'timeline',
        type: 'timeline',
        label: '操作记录',
        x: 0, y: 7, width: 12, height: 3,
        config: {
          title: '操作记录',
          showAvatar: true,
          maxItems: 20
        }
      },
      {
        id: 'action-buttons',
        type: 'buttonGroup',
        label: '操作按钮',
        x: 0, y: 11, width: 12, height: 1,
        config: {
          buttons: [
            { label: '编辑', type: 'primary', icon: 'Edit', action: 'edit' },
            { label: '删除', type: 'danger', icon: 'Delete', action: 'delete' },
            { label: '导出', type: 'success', icon: 'Download', action: 'export' },
            { label: '返回', type: 'default', icon: 'ArrowLeft', action: 'back' }
          ],
          align: 'left'
        }
      }
    ],
    tags: ['数据展示', '详情'],
    features: ['详情展示', '操作记录', '关联数据', '快捷操作']
  },
  {
    id: 'master-detail',
    name: '主从详情页',
    description: '主表数据与关联子表数据的展示页面，适合复杂业务场景',
    category: 'detail',
    icon: 'Grid',
    previewImage: 'detail-master',
    pageType: 'detail',
    defaultComponents: [
      {
        id: 'master-info',
        type: 'card',
        label: '主数据',
        x: 0, y: 0, width: 12, height: 3,
        config: {
          title: '订单基本信息',
          fields: [
            { label: '订单号', value: 'ORD20240001' },
            { label: '客户名称', value: '某某公司' },
            { label: '订单金额', value: '￥25,800' },
            { label: '下单时间', value: '2024-01-15' },
            { label: '订单状态', value: '已发货', type: 'tag' },
            { label: '支付方式', value: '银行转账' }
          ],
          layout: 'grid'
        }
      },
      {
        id: 'detail-tabs',
        type: 'tabs',
        label: '标签页',
        x: 0, y: 4, width: 12, height: 8,
        config: {
          tabs: [
            { name: 'items', label: '订单明细', type: 'table' },
            { name: 'attachments', label: '附件', type: 'upload' },
            { name: 'workflow', label: '审批流程', type: 'timeline' }
          ],
          activeTab: 'items'
        }
      }
    ],
    tags: ['主从', '关联数据'],
    features: ['主从结构', '多标签页', '附件管理', '流程追踪']
  }
]

// 热门模板（推荐）
const hotTemplates = ['standard-list', 'crud-list', 'simple-form', 'dashboard-standard']

// 过滤模板
const filteredTemplates = computed(() => {
  if (activeCategory.value === 'all') {
    return templates.filter(t => t.id !== 'blank')
  }
  return templates.filter(t => t.category === activeCategory.value)
})

// 打开模板预览
const handlePreview = (template: PageTemplate) => {
  currentPreviewTemplate.value = template
  previewMode.value = 'layout'
  previewDialog.value = true
}

// 选择模板创建页面
const handleSelectTemplate = (template: PageTemplate) => {
  previewDialog.value = false
  router.push({
    path: '/page/builder/new',
    query: {
      template: template.id,
      name: template.name,
      type: template.pageType
    }
  })
}

// 空白创建
const handleCreateBlank = () => {
  router.push('/page/builder/new')
}

// 快速创建（一键创建）
const quickCreateOptions = [
  { type: 'list', name: '列表页', icon: 'List', template: 'standard-list' },
  { type: 'form', name: '表单页', icon: 'EditPen', template: 'simple-form' },
  { type: 'dashboard', name: '仪表盘', icon: 'Odometer', template: 'dashboard-standard' },
  { type: 'detail', name: '详情页', icon: 'Document', template: 'detail-standard' }
]

const handleQuickCreate = (option: any) => {
  const template = templates.find(t => t.id === option.template)
  if (template) {
    handleSelectTemplate(template)
  }
}

// 获取模板预览图
const getPreviewImage = (template: PageTemplate) => {
  const previewMap: Record<string, string> = {
    'list-standard': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'list-crud': 'linear-gradient(135deg, #409eff 0%, #66b1ff 100%)',
    'form-simple': 'linear-gradient(135deg, #67c23a 0%, #85ce61 100%)',
    'form-steps': 'linear-gradient(135deg, #e6a23c 0%, #ebb563 100%)',
    'dashboard-standard': 'linear-gradient(135deg, #f56c6c 0%, #f78989 100%)',
    'dashboard-analytics': 'linear-gradient(135deg, #909399 0%, #a6a9ad 100%)',
    'detail-standard': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'detail-master': 'linear-gradient(135deg, #409eff 0%, #66b1ff 100%)'
  }
  return previewMap[template.previewImage] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}

// 获取组件类型颜色
const getComponentColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'card': '#409eff',
    'table': '#667eea',
    'form': '#67c23a',
    'chart_bar': '#e6a23c',
    'chart_line': '#f56c6c',
    'chart_pie': '#909399',
    'chart_gauge': '#764ba2',
    'pagination': '#85ce61',
    'toolbar': '#66b1ff',
    'steps': '#ebb563',
    'tabs': '#a6a9ad',
    'timeline': '#f78989',
    'statCard': '#409eff',
    'buttonGroup': '#67c23a'
  }
  return colorMap[type] || '#909399'
}

// 组件类型名称映射
const componentTypeNames: Record<string, string> = {
  'card': '卡片容器',
  'table': '数据表格',
  'form': '表单组件',
  'chart_bar': '柱状图',
  'chart_line': '折线图',
  'chart_pie': '饼图',
  'chart_gauge': '仪表盘',
  'pagination': '分页组件',
  'toolbar': '工具栏',
  'steps': '步骤条',
  'tabs': '标签页',
  'timeline': '时间线',
  'statCard': '统计卡片',
  'buttonGroup': '按钮组'
}

// 模拟数据 - 用于预览展示
const mockTableData = [
  { id: 1, name: '项目A', status: '启用', createTime: '2024-01-15 10:30' },
  { id: 2, name: '项目B', status: '禁用', createTime: '2024-01-16 14:20' },
  { id: 3, name: '项目C', status: '启用', createTime: '2024-01-17 09:15' }
]

const mockTimelineData = [
  { time: '2024-01-17 15:30', user: '张三', action: '创建记录' },
  { time: '2024-01-17 16:00', user: '李四', action: '修改状态' },
  { time: '2024-01-18 10:00', user: '王五', action: '添加备注' }
]

// 阻止事件冒泡的预览按钮点击
const handlePreviewClick = (e: Event, template: PageTemplate) => {
  e.stopPropagation()
  handlePreview(template)
}

// 获取组件预览样式
const getComponentPreviewStyle = (comp: ComponentConfig) => {
  const baseStyle = {
    gridColumn: `span ${comp.width}`,
    gridRow: `span ${Math.min(comp.height, 3)}`,
    minHeight: `${comp.height * 50}px`
  }
  return baseStyle
}
</script>

<template>
  <div class="template-home">
    <!-- 顶部区域 -->
    <div class="home-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="title">页面搭建中心</h1>
          <p class="subtitle">选择模板快速开始，或从空白页面自由设计</p>
        </div>
        <div class="header-right">
          <el-button @click="router.push('/page/list')" class="list-btn">
            <el-icon><List /></el-icon>
            我的页面
          </el-button>
        </div>
      </div>
    </div>

    <!-- 一键创建区域 -->
    <div class="quick-create-section">
      <div class="section-header">
        <h2>一键创建</h2>
        <span class="tip">快速生成常用页面</span>
      </div>
      <div class="quick-create-grid">
        <div class="quick-item" v-for="opt in quickCreateOptions" :key="opt.type" @click="handleQuickCreate(opt)">
          <div class="quick-icon">
            <el-icon :size="36"><component :is="opt.icon" /></el-icon>
          </div>
          <span class="quick-name">{{ opt.name }}</span>
          <span class="quick-action">立即创建 →</span>
        </div>
      </div>
    </div>

    <!-- 模板库区域 -->
    <div class="template-section">
      <div class="section-header">
        <h2>模板库</h2>
        <span class="tip">{{ templates.length }} 个模板可供选择</span>
      </div>

      <!-- 分类筛选 -->
      <div class="category-tabs">
        <div
          class="category-tab"
          v-for="cat in categories"
          :key="cat.id"
          :class="{ active: activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <el-icon><component :is="cat.icon" /></el-icon>
          <span>{{ cat.name }}</span>
          <el-badge :value="templates.filter(t => cat.id === 'all' ? t.id !== 'blank' : t.category === cat.id).length" type="primary" />
        </div>
      </div>

      <!-- 模板卡片 -->
      <div class="template-grid">
        <!-- 空白页面 -->
        <div class="template-card blank-card" @click="handleCreateBlank">
          <div class="card-preview blank-preview">
            <el-icon :size="60"><Plus /></el-icon>
          </div>
          <div class="card-info">
            <h3>空白页面</h3>
            <p>从零开始自由设计</p>
            <div class="card-tags">
              <el-tag size="small">自定义</el-tag>
              <el-tag size="small" type="success">灵活</el-tag>
            </div>
          </div>
          <div class="card-action">
            <el-button type="primary" class="create-btn">
              开始设计
            </el-button>
          </div>
        </div>

        <!-- 模板卡片 -->
        <div
          class="template-card"
          v-for="template in filteredTemplates"
          :key="template.id"
          :class="{ hot: hotTemplates.includes(template.id) }"
          @click="handleSelectTemplate(template)"
        >
          <!-- 预览图 -->
          <div class="card-preview" :style="{ background: getPreviewImage(template) }">
            <div class="preview-content">
              <el-icon :size="40"><component :is="template.icon" /></el-icon>
              <span class="preview-label">{{ template.name }}</span>
            </div>
            <!-- 热门标识 -->
            <div class="hot-badge" v-if="hotTemplates.includes(template.id)">
              <el-icon><Star /></el-icon>
              推荐
            </div>
          </div>

          <!-- 模板信息 -->
          <div class="card-info">
            <h3>{{ template.name }}</h3>
            <p>{{ template.description }}</p>
            <div class="card-tags">
              <el-tag size="small" v-for="tag in template.tags" :key="tag">{{ tag }}</el-tag>
            </div>
            <div class="card-meta">
              <span class="meta-item">
                <el-icon><Grid /></el-icon>
                {{ template.defaultComponents.length }} 个组件
              </span>
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                {{ template.pageType }} 类型
              </span>
            </div>
            <div class="card-features" v-if="template.features">
              <span class="feature-label">功能特性：</span>
              <div class="feature-list">
                <span class="feature-item" v-for="f in template.features" :key="f">{{ f }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-action">
            <el-button type="primary" class="create-btn" @click.stop="handleSelectTemplate(template)">
              <el-icon><Plus /></el-icon>
              使用模板
            </el-button>
            <el-button class="preview-btn" @click="(e: Event) => handlePreviewClick(e, template)">
              <el-icon><View /></el-icon>
              预览详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="guide-section">
      <div class="section-header">
        <h2>使用流程</h2>
      </div>
      <div class="guide-steps">
        <div class="guide-step">
          <div class="step-number">1</div>
          <div class="step-icon"><el-icon :size="32"><Grid /></el-icon></div>
          <h4>选择模板</h4>
          <p>从模板库选择合适的页面模板</p>
        </div>
        <div class="guide-step">
          <div class="step-number">2</div>
          <div class="step-icon"><el-icon :size="32"><EditPen /></el-icon></div>
          <h4>调整布局</h4>
          <p>拖拽组件调整位置和大小</p>
        </div>
        <div class="guide-step">
          <div class="step-number">3</div>
          <div class="step-icon"><el-icon :size="32"><Setting /></el-icon></div>
          <h4>配置属性</h4>
          <p>设置组件的数据源和样式</p>
        </div>
        <div class="guide-step">
          <div class="step-number">4</div>
          <div class="step-icon"><el-icon :size="32"><Promotion /></el-icon></div>
          <h4>发布使用</h4>
          <p>保存发布后即可访问使用</p>
        </div>
      </div>
    </div>

    <!-- 模板预览对话框 -->
    <el-dialog
      v-model="previewDialog"
      :title="currentPreviewTemplate?.name + ' - 模板预览'"
      width="95%"
      top="2vh"
      class="preview-dialog"
      destroy-on-close
    >
      <div class="preview-container" v-if="currentPreviewTemplate">
        <!-- 顶部信息区 -->
        <div class="preview-header">
          <div class="preview-info">
            <div class="preview-title-row">
              <h3>{{ currentPreviewTemplate.name }}</h3>
              <el-tag type="success" size="large">{{ currentPreviewTemplate.pageType }}</el-tag>
            </div>
            <p>{{ currentPreviewTemplate.description }}</p>
            <div class="preview-meta">
              <span><el-icon><Grid /></el-icon> {{ currentPreviewTemplate.defaultComponents.length }} 个组件</span>
              <div class="preview-tags">
                <el-tag size="small" v-for="tag in currentPreviewTemplate.tags" :key="tag">{{ tag }}</el-tag>
              </div>
            </div>
          </div>
          <div class="preview-actions">
            <el-button type="primary" size="large" @click="handleSelectTemplate(currentPreviewTemplate)">
              <el-icon><Plus /></el-icon>
              使用此模板创建
            </el-button>
          </div>
        </div>

        <!-- 功能特性卡片 -->
        <div class="preview-features" v-if="currentPreviewTemplate.features">
          <h4><el-icon><Star /></el-icon> 功能特性</h4>
          <div class="features-grid">
            <div class="feature-box" v-for="f in currentPreviewTemplate.features" :key="f">
              <el-icon class="feature-icon"><Check /></el-icon>
              <span>{{ f }}</span>
            </div>
          </div>
        </div>

        <!-- 预览模式切换 -->
        <div class="preview-tabs">
          <el-radio-group v-model="previewMode" size="large">
            <el-radio-button value="layout">
              <el-icon><Grid /></el-icon> 布局预览
            </el-radio-button>
            <el-radio-button value="data">
              <el-icon><DataAnalysis /></el-icon> 数据预览
            </el-radio-button>
            <el-radio-button value="config">
              <el-icon><Setting /></el-icon> 配置详情
            </el-radio-button>
          </el-radio-group>
        </div>

        <!-- 布局预览 - 真实组件模拟 -->
        <div class="preview-layout" v-if="previewMode === 'layout'">
          <h4><el-icon><Grid /></el-icon> 页面布局预览 <span class="sub-text">（12列网格布局）</span></h4>
          <div class="layout-canvas">
            <div
              class="component-block"
              v-for="comp in currentPreviewTemplate.defaultComponents"
              :key="comp.id"
              :style="getComponentPreviewStyle(comp)"
              :class="[comp.type]"
            >
              <!-- 卡片/容器组件 -->
              <div class="block-content card-block" v-if="comp.type === 'card' || comp.type === 'toolbar'">
                <div class="block-header">
                  <span class="block-title">{{ comp.config.title || comp.label }}</span>
                  <el-icon class="block-icon"><component :is="comp.config.icon || 'Document'" /></el-icon>
                </div>
                <div class="block-body">
                  <div class="mock-search-fields" v-if="comp.config.fields">
                    <div class="mock-field" v-for="field in comp.config.fields.slice(0, 3)" :key="field.name">
                      <span class="field-label">{{ field.label }}</span>
                      <div class="field-input">{{ field.placeholder || '请选择' }}</div>
                    </div>
                  </div>
                  <div class="mock-actions" v-if="comp.config.actions">
                    <div class="mock-action-btn" v-for="action in comp.config.actions.slice(0, 4)" :key="action.label">
                      <el-icon><component :is="action.icon" /></el-icon>
                      {{ action.label }}
                    </div>
                  </div>
                  <div class="mock-buttons" v-if="comp.config.buttons">
                    <div class="mock-btn" v-for="btn in comp.config.buttons.slice(0, 4)" :key="btn.label" :class="btn.type">
                      <el-icon><component :is="btn.icon" /></el-icon>
                      {{ btn.label }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 表格组件 -->
              <div class="block-content table-block" v-if="comp.type === 'table'">
                <div class="block-header">
                  <span class="block-title">{{ comp.label }}</span>
                  <div class="table-tools">
                    <el-icon><Refresh /></el-icon>
                    <el-icon><Setting /></el-icon>
                  </div>
                </div>
                <div class="block-body">
                  <div class="mock-table">
                    <div class="mock-table-header">
                      <span class="mock-checkbox"></span>
                      <span v-for="col in comp.config.columns?.slice(0, 5)" :key="col.prop" class="mock-th">{{ col.label }}</span>
                    </div>
                    <div class="mock-table-row" v-for="row in mockTableData" :key="row.id">
                      <span class="mock-checkbox"></span>
                      <span v-for="col in comp.config.columns?.slice(0, 5)" :key="col.prop" class="mock-td">
                        <el-tag v-if="col.type === 'tag'" size="small" :type="row.status === '启用' ? 'success' : 'info'">{{ row[col.prop as keyof typeof row] }}</el-tag>
                        <span v-else>{{ row[col.prop as keyof typeof row] }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 表单组件 -->
              <div class="block-content form-block" v-if="comp.type === 'form'">
                <div class="block-header">
                  <span class="block-title">{{ comp.label }}</span>
                </div>
                <div class="block-body">
                  <div class="mock-form-fields">
                    <div class="mock-form-item" v-for="field in comp.config.fields?.slice(0, 4)" :key="field.name" :style="{ width: field.span === 24 ? '100%' : '50%' }">
                      <span class="mock-label">{{ field.label }}<span class="required" v-if="field.required">*</span></span>
                      <div class="mock-input" :class="field.type">{{ field.placeholder || '请输入' }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 统计卡片 -->
              <div class="block-content stat-block" v-if="comp.type === 'statCard'">
                <div class="stat-icon" :style="{ background: comp.config.color }">
                  <el-icon><component :is="comp.config.icon" /></el-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-title">{{ comp.config.title }}</span>
                  <span class="stat-value">{{ comp.config.value }}<small>{{ comp.config.unit }}</small></span>
                  <span class="stat-trend" :class="comp.config.trendType">{{ comp.config.trend }}</span>
                </div>
              </div>

              <!-- 图表组件 -->
              <div class="block-content chart-block" v-if="comp.type.startsWith('chart_')">
                <div class="block-header">
                  <span class="block-title">{{ comp.config.title || comp.label }}</span>
                </div>
                <div class="block-body chart-body">
                  <div class="mock-chart" :class="comp.type">
                    <!-- 柱状图模拟 -->
                    <div class="mock-bars" v-if="comp.type === 'chart_bar'">
                      <div class="bar" v-for="i in 6" :key="i" :style="{ height: (30 + Math.random() * 60) + '%' }"></div>
                    </div>
                    <!-- 折线图模拟 -->
                    <div class="mock-line" v-if="comp.type === 'chart_line'">
                      <svg viewBox="0 0 100 50" class="line-svg">
                        <polyline fill="none" stroke="#409eff" stroke-width="2" points="0,40 20,30 40,35 60,20 80,25 100,15"/>
                        <polyline fill="rgba(64,158,255,0.2)" stroke="none" points="0,50 0,40 20,30 40,35 60,20 80,25 100,15 100,50"/>
                      </svg>
                    </div>
                    <!-- 饼图模拟 -->
                    <div class="mock-pie" v-if="comp.type === 'chart_pie'">
                      <div class="pie-chart"></div>
                    </div>
                    <!-- 仪表盘模拟 -->
                    <div class="mock-gauge" v-if="comp.type === 'chart_gauge'">
                      <div class="gauge-circle" :style="{ '--percent': comp.config.value + '%' }">
                        <span class="gauge-value">{{ comp.config.value }}</span>
                      </div>
                      <span class="gauge-title">{{ comp.config.title }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 步骤条 -->
              <div class="block-content steps-block" v-if="comp.type === 'steps'">
                <div class="mock-steps">
                  <div class="mock-step" v-for="(step, idx) in comp.config.steps?.slice(0, 3)" :key="idx" :class="{ active: idx === 0 }">
                    <div class="step-circle">{{ idx + 1 }}</div>
                    <span class="step-title">{{ step.title }}</span>
                  </div>
                </div>
              </div>

              <!-- 分页组件 -->
              <div class="block-content pagination-block" v-if="comp.type === 'pagination'">
                <div class="mock-pagination">
                  <span class="page-total">共 100 条</span>
                  <span class="page-btn prev">上一页</span>
                  <span class="page-num active">1</span>
                  <span class="page-num">2</span>
                  <span class="page-num">3</span>
                  <span class="page-btn next">下一页</span>
                </div>
              </div>

              <!-- 标签页 -->
              <div class="block-content tabs-block" v-if="comp.type === 'tabs'">
                <div class="mock-tabs-header">
                  <span class="mock-tab active" v-for="tab in comp.config.tabs?.slice(0, 3)" :key="tab.name">{{ tab.label }}</span>
                </div>
                <div class="mock-tabs-body">
                  <div class="tabs-placeholder">标签页内容区域</div>
                </div>
              </div>

              <!-- 时间线 -->
              <div class="block-content timeline-block" v-if="comp.type === 'timeline'">
                <div class="mock-timeline">
                  <div class="mock-timeline-item" v-for="item in mockTimelineData" :key="item.time">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                      <span class="timeline-time">{{ item.time }}</span>
                      <span class="timeline-user">{{ item.user }}</span>
                      <span class="timeline-action">{{ item.action }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 按钮组 -->
              <div class="block-content buttons-block" v-if="comp.type === 'buttonGroup'">
                <div class="mock-buttons-row" :style="{ justifyContent: comp.config.align || 'center' }">
                  <div class="mock-btn" v-for="btn in comp.config.buttons?.slice(0, 4)" :key="btn.label" :class="btn.type">
                    <el-icon v-if="btn.icon"><component :is="btn.icon" /></el-icon>
                    {{ btn.label }}
                  </div>
                </div>
              </div>

              <!-- 组件信息标签 -->
              <div class="component-tag">
                <span class="comp-name">{{ comp.label }}</span>
                <span class="comp-size">{{ comp.width }}×{{ comp.height }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据预览 - 展示模拟数据 -->
        <div class="preview-data" v-if="previewMode === 'data'">
          <h4><el-icon><DataAnalysis /></el-icon> 数据预览示例</h4>
          <div class="data-preview-grid">
            <!-- 模拟搜索表单 -->
            <div class="data-section" v-if="currentPreviewTemplate.pageType === 'list'">
              <h5>搜索条件示例</h5>
              <el-form label-width="80px" class="mock-search-form">
                <el-row :gutter="16">
                  <el-col :span="8">
                    <el-form-item label="关键词">
                      <el-input placeholder="请输入关键词" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="状态">
                      <el-select placeholder="请选择">
                        <el-option label="全部" value="" />
                        <el-option label="启用" value="1" />
                        <el-option label="禁用" value="0" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="8">
                    <el-form-item label="日期">
                      <el-date-picker type="daterange" placeholder="选择日期范围" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
            </div>

            <!-- 模拟表格数据 -->
            <div class="data-section" v-if="currentPreviewTemplate.pageType === 'list' || currentPreviewTemplate.pageType === 'detail'">
              <h5>数据列表示例</h5>
              <el-table :data="mockTableData" stripe border size="small">
                <el-table-column type="selection" width="50" />
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '启用' ? 'success' : 'info'" size="small">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column label="操作" width="150">
                  <template #default>
                    <el-button type="primary" link size="small">编辑</el-button>
                    <el-button type="danger" link size="small">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 模拟表单数据 -->
            <div class="data-section" v-if="currentPreviewTemplate.pageType === 'form'">
              <h5>表单录入示例</h5>
              <el-form label-width="100px" class="mock-data-form">
                <el-form-item label="标题" required>
                  <el-input placeholder="请输入标题" />
                </el-form-item>
                <el-form-item label="分类" required>
                  <el-select placeholder="请选择分类">
                    <el-option label="分类A" value="a" />
                    <el-option label="分类B" value="b" />
                    <el-option label="分类C" value="c" />
                  </el-select>
                </el-form-item>
                <el-form-item label="描述">
                  <el-input type="textarea" :rows="3" placeholder="请输入描述内容" />
                </el-form-item>
                <el-form-item label="优先级">
                  <el-radio-group>
                    <el-radio value="high">高</el-radio>
                    <el-radio value="medium">中</el-radio>
                    <el-radio value="low">低</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="状态">
                  <el-switch />
                </el-form-item>
              </el-form>
            </div>

            <!-- 模拟仪表盘数据 -->
            <div class="data-section" v-if="currentPreviewTemplate.pageType === 'dashboard'">
              <h5>统计卡片示例</h5>
              <div class="mock-stats-row">
                <div class="mock-stat-card">
                  <el-icon :size="32"><User /></el-icon>
                  <div class="stat-content">
                    <span class="stat-num">12,580</span>
                    <span class="stat-label">总用户数</span>
                  </div>
                  <el-tag type="success" size="small">+12.5%</el-tag>
                </div>
                <div class="mock-stat-card">
                  <el-icon :size="32"><ShoppingCart /></el-icon>
                  <div class="stat-content">
                    <span class="stat-num">389</span>
                    <span class="stat-label">今日订单</span>
                  </div>
                  <el-tag type="success" size="small">+8.2%</el-tag>
                </div>
                <div class="mock-stat-card">
                  <el-icon :size="32"><Money /></el-icon>
                  <div class="stat-content">
                    <span class="stat-num">￥52,680</span>
                    <span class="stat-label">本月收入</span>
                  </div>
                  <el-tag type="danger" size="small">-3.1%</el-tag>
                </div>
                <div class="mock-stat-card">
                  <el-icon :size="32"><Bell /></el-icon>
                  <div class="stat-content">
                    <span class="stat-num">56</span>
                    <span class="stat-label">待处理</span>
                  </div>
                  <el-tag type="warning" size="small">待处理</el-tag>
                </div>
              </div>
            </div>

            <!-- 模拟详情数据 -->
            <div class="data-section" v-if="currentPreviewTemplate.pageType === 'detail'">
              <h5>详情信息示例</h5>
              <el-descriptions :column="3" border>
                <el-descriptions-item label="编号">D20240001</el-descriptions-item>
                <el-descriptions-item label="名称">示例项目</el-descriptions-item>
                <el-descriptions-item label="状态">
                  <el-tag type="success" size="small">正常</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="负责人">张三</el-descriptions-item>
                <el-descriptions-item label="部门">研发部</el-descriptions-item>
                <el-descriptions-item label="优先级">高</el-descriptions-item>
                <el-descriptions-item label="创建时间">2024-01-15 10:30:00</el-descriptions-item>
                <el-descriptions-item label="更新时间">2024-01-18 14:20:00</el-descriptions-item>
                <el-descriptions-item label="备注">重要项目，需重点关注</el-descriptions-item>
              </el-descriptions>
            </div>

            <!-- 时间线示例 -->
            <div class="data-section" v-if="currentPreviewTemplate.pageType === 'detail'">
              <h5>操作记录示例</h5>
              <el-timeline>
                <el-timeline-item v-for="item in mockTimelineData" :key="item.time" :timestamp="item.time" placement="top">
                  <el-card shadow="hover">
                    <h4>{{ item.action }}</h4>
                    <p>操作人：{{ item.user }}</p>
                  </el-card>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>

        <!-- 配置详情 - 组件配置表格 -->
        <div class="preview-config" v-if="previewMode === 'config'">
          <h4><el-icon><Setting /></el-icon> 组件配置详情</h4>
          <div class="config-components">
            <div class="config-card" v-for="comp in currentPreviewTemplate.defaultComponents" :key="comp.id">
              <div class="config-header" :style="{ background: getComponentColor(comp.type) }">
                <span class="config-title">{{ comp.label }}</span>
                <el-tag size="small" effect="dark">{{ componentTypeNames[comp.type] || comp.type }}</el-tag>
              </div>
              <div class="config-body">
                <div class="config-row">
                  <span class="config-label">位置坐标</span>
                  <span class="config-value">X: {{ comp.x }}, Y: {{ comp.y }}</span>
                </div>
                <div class="config-row">
                  <span class="config-label">占用尺寸</span>
                  <span class="config-value">{{ comp.width }} 列 × {{ comp.height }} 行</span>
                </div>
                <div class="config-row" v-if="comp.config.title">
                  <span class="config-label">组件标题</span>
                  <span class="config-value">{{ comp.config.title }}</span>
                </div>
                <div class="config-row" v-if="comp.config.columns">
                  <span class="config-label">表格列数</span>
                  <span class="config-value">{{ comp.config.columns.length }} 列</span>
                </div>
                <div class="config-row" v-if="comp.config.fields">
                  <span class="config-label">表单字段</span>
                  <span class="config-value">{{ comp.config.fields.length }} 个字段</span>
                </div>
                <div class="config-row" v-if="comp.config.buttons">
                  <span class="config-label">按钮数量</span>
                  <span class="config-value">{{ comp.config.buttons.length }} 个按钮</span>
                </div>
                <div class="config-row" v-if="comp.config.steps">
                  <span class="config-label">步骤数</span>
                  <span class="config-value">{{ comp.config.steps.length }} 步</span>
                </div>
                <div class="config-row" v-if="comp.config.tabs">
                  <span class="config-label">标签页数</span>
                  <span class="config-value">{{ comp.config.tabs.length }} 个标签</span>
                </div>
                <div class="config-row" v-if="comp.config.dataSource">
                  <span class="config-label">数据源</span>
                  <span class="config-value">{{ comp.config.dataSource }}</span>
                </div>
                <div class="config-row" v-if="comp.config.value">
                  <span class="config-label">当前值</span>
                  <span class="config-value">{{ comp.config.value }} {{ comp.config.unit }}</span>
                </div>
                <div class="config-expand" v-if="comp.config.fields || comp.config.columns || comp.config.buttons">
                  <el-collapse>
                    <el-collapse-item title="查看详细配置">
                      <div class="config-detail">
                        <pre>{{ JSON.stringify(comp.config, null, 2) }}</pre>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.template-home {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%);
  padding-bottom: 40px;

  // 顶部区域
  .home-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60px 40px;
    color: #fff;

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        .title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .subtitle {
          font-size: 18px;
          opacity: 0.9;
        }
      }

      .header-right {
        .list-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #fff;
          border-radius: 12px;
          font-size: 16px;

          &:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }
    }
  }

  // 一键创建区域
  .quick-create-section {
    max-width: 1200px;
    margin: -30px auto 40px;
    padding: 30px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      h2 { font-size: 20px; font-weight: 600; color: #303133; }
      .tip { font-size: 14px; color: #909399; }
    }

    .quick-create-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .quick-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        border: 2px solid #e4e7ed;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          border-color: transparent;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);

          .quick-icon { background: rgba(255, 255, 255, 0.2); color: #fff; }
          .quick-name { color: #fff; }
          .quick-action { color: rgba(255, 255, 255, 0.9); }
        }

        .quick-icon {
          width: 64px; height: 64px;
          border-radius: 16px;
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #409eff;
          margin-bottom: 12px;
          transition: all 0.3s;
        }

        .quick-name {
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 8px;
        }

        .quick-action {
          font-size: 13px;
          color: #909399;
          transition: color 0.3s;
        }
      }
    }
  }

  // 模板库区域
  .template-section {
    max-width: 1200px;
    margin: 0 auto 40px;
    padding: 30px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;

      h2 { font-size: 20px; font-weight: 600; color: #303133; }
      .tip { font-size: 14px; color: #909399; }
    }

    .category-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;

      .category-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        border: 1px solid #e4e7ed;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
        background: #fff;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: transparent;
          color: #fff;

          :deep(.el-badge__content) { background: rgba(255, 255, 255, 0.3); }
        }

        span { font-size: 14px; font-weight: 500; }
      }
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;

      .template-card {
        border: 1px solid #e4e7ed;
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.3s ease;
        background: #fff;
        cursor: pointer;

        &:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          border-color: transparent;

          .create-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        }

        &.hot {
          border-color: #e6a23c;
          .hot-badge { display: flex; }
        }

        &.blank-card .blank-preview {
          background: linear-gradient(135deg, #f5f7fa 0%, #e8eaed 100%);
          color: #909399;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-preview {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          position: relative;

          .preview-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;

            .preview-label {
              font-size: 14px;
              font-weight: 500;
              opacity: 0.9;
            }
          }

          .hot-badge {
            position: absolute;
            top: 12px; right: 12px;
            background: rgba(255, 255, 255, 0.9);
            color: #e6a23c;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
        }

        .card-info {
          padding: 20px;

          h3 { font-size: 16px; font-weight: 600; color: #303133; margin-bottom: 8px; }
          p { font-size: 13px; color: #909399; line-height: 1.6; margin-bottom: 12px; }

          .card-tags {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
            :deep(.el-tag) { border-radius: 12px; }
          }

          .card-meta {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
              font-size: 12px;
              color: #909399;
            }
          }

          .card-features {
            .feature-label { font-size: 12px; color: #606266; margin-bottom: 8px; display: block; }

            .feature-list {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .feature-item {
                font-size: 12px;
                padding: 2px 8px;
                background: #f5f7fa;
                border-radius: 4px;
                color: #409eff;
              }
            }
          }
        }

        .card-action {
          padding: 16px 20px;
          border-top: 1px solid #ebeef5;
          display: flex;
          gap: 12px;

          .create-btn, .preview-btn { border-radius: 10px; font-size: 14px; }

          .create-btn {
            background: #409eff;
            border: none;
            &:hover { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          }

          .preview-btn {
            background: #f5f7fa;
            border: none;
            color: #606266;
            &:hover { background: #e4e7ed; }
          }
        }
      }
    }
  }

  // 使用说明
  .guide-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

    .section-header { margin-bottom: 24px; h2 { font-size: 20px; font-weight: 600; color: #303133; } }

    .guide-steps {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;

      .guide-step {
        text-align: center;
        padding: 24px;
        border-radius: 12px;
        background: #f5f7fa;
        transition: all 0.3s;

        &:hover {
          background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
          .step-number { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        }

        .step-number {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #409eff;
          color: #fff;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          transition: background 0.3s;
        }

        .step-icon { color: #606266; margin-bottom: 12px; }
        h4 { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 8px; }
        p { font-size: 12px; color: #909399; }
      }
    }
  }
}

// 预览对话框样式
.preview-dialog {
  :deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 16px 20px;
    margin: 0;

    .el-dialog__title { color: #fff; font-weight: 600; font-size: 18px; }
    .el-dialog__headerbtn .el-dialog__close { color: #fff; font-size: 20px; }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
    max-height: 85vh;
    overflow-y: auto;
  }

  .preview-container {
    // 顶部信息区
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 2px solid #ebeef5;

      .preview-info {
        .preview-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          h3 { font-size: 22px; color: #303133; font-weight: 700; }
        }

        p { color: #606266; margin-bottom: 12px; font-size: 14px; }

        .preview-meta {
          display: flex;
          align-items: center;
          gap: 16px;

          span { display: flex; align-items: center; gap: 4px; color: #909399; font-size: 14px; }

          .preview-tags { display: flex; gap: 8px; }
        }
      }
    }

    // 功能特性
    .preview-features {
      margin-bottom: 24px;

      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: #303133;
        margin-bottom: 16px;
      }

      .features-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;

        .feature-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
          border: 1px solid #e4e7ed;
          border-radius: 10px;
          font-size: 14px;
          color: #606266;
          transition: all 0.2s;

          &:hover {
            border-color: #409eff;
            background: #ecf5ff;
            .feature-icon { color: #409eff; }
          }

          .feature-icon { color: #67c23a; font-size: 18px; }
        }
      }
    }

    // 预览模式切换
    .preview-tabs {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;

      :deep(.el-radio-button__inner) {
        padding: 12px 24px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    // 布局预览
    .preview-layout {
      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: #303133;
        margin-bottom: 16px;

        .sub-text { color: #909399; font-size: 13px; }
      }

      .layout-canvas {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-auto-rows: minmax(80px, auto);
        gap: 8px;
        background: #f8f9fa;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid #e4e7ed;
        min-height: 400px;

        .component-block {
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          border: 1px solid rgba(0,0,0,0.08);

          &:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10;
          }

          // 卡片样式
          &.card, &.toolbar {
            background: #fff;

            .card-block {
              padding: 12px;

              .block-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #ebeef5;

                .block-title { font-size: 14px; font-weight: 600; color: #303133; }
                .block-icon { color: #409eff; }
              }

              .block-body {
                .mock-search-fields {
                  display: flex;
                  gap: 12px;
                  flex-wrap: wrap;

                  .mock-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;

                    .field-label { font-size: 12px; color: #606266; }
                    .field-input {
                      padding: 6px 12px;
                      background: #f5f7fa;
                      border: 1px solid #dcdfe6;
                      border-radius: 4px;
                      font-size: 12px;
                      color: #c0c4cc;
                      min-width: 100px;
                    }
                  }
                }

                .mock-actions {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;

                  .mock-action-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 12px;
                    background: #f5f7fa;
                    border-radius: 6px;
                    font-size: 12px;
                    color: #606266;
                    cursor: pointer;
                    transition: all 0.2s;

                    &:hover { background: #409eff; color: #fff; }
                  }
                }

                .mock-buttons {
                  display: flex;
                  gap: 8px;
                  flex-wrap: wrap;

                  .mock-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;

                    &.primary { background: #409eff; color: #fff; }
                    &.success { background: #67c23a; color: #fff; }
                    &.danger { background: #f56c6c; color: #fff; }
                    &.default { background: #f5f7fa; color: #606266; border: 1px solid #dcdfe6; }
                  }
                }
              }
            }
          }

          // 表格样式
          &.table {
            background: #fff;

            .table-block {
              padding: 12px;

              .block-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;

                .block-title { font-size: 14px; font-weight: 600; }
                .table-tools { display: flex; gap: 8px; color: #909399; }
              }

              .block-body {
                .mock-table {
                  border: 1px solid #ebeef5;
                  border-radius: 4px;

                  .mock-table-header {
                    display: flex;
                    background: #f5f7fa;
                    padding: 10px 8px;
                    border-bottom: 1px solid #ebeef5;

                    .mock-checkbox { width: 20px; height: 20px; border: 1px solid #dcdfe6; border-radius: 2px; margin-right: 8px; }
                    .mock-th { flex: 1; font-size: 12px; font-weight: 600; color: #303133; padding: 0 4px; }
                  }

                  .mock-table-row {
                    display: flex;
                    padding: 10px 8px;
                    border-bottom: 1px solid #ebeef5;

                    &:last-child { border-bottom: none; }

                    .mock-checkbox { width: 20px; height: 20px; border: 1px solid #dcdfe6; border-radius: 2px; margin-right: 8px; }
                    .mock-td { flex: 1; font-size: 12px; color: #606266; padding: 0 4px; }
                  }
                }
              }
            }
          }

          // 表单样式
          &.form {
            background: #fff;

            .form-block {
              padding: 12px;

              .block-header { margin-bottom: 12px; .block-title { font-size: 14px; font-weight: 600; } }

              .block-body {
                .mock-form-fields {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 12px;

                  .mock-form-item {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;

                    .mock-label { font-size: 12px; color: #606266; .required { color: #f56c6c; } }
                    .mock-input {
                      padding: 8px 12px;
                      background: #fff;
                      border: 1px solid #dcdfe6;
                      border-radius: 4px;
                      font-size: 12px;
                      color: #c0c4cc;
                      min-width: 120px;

                      &.textarea { min-height: 60px; }
                      &.select { position: relative; &::after { content: '▼'; font-size: 10px; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); } }
                    }
                  }
                }
              }
            }
          }

          // 统计卡片
          &.statCard {
            background: #fff;

            .stat-block {
              padding: 16px;
              display: flex;
              align-items: center;
              gap: 16px;

              .stat-icon {
                width: 48px; height: 48px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                font-size: 24px;
              }

              .stat-info {
                flex: 1;

                .stat-title { font-size: 12px; color: #909399; display: block; }
                .stat-value { font-size: 24px; font-weight: 700; color: #303133; small { font-size: 14px; color: #909399; } }
                .stat-trend { font-size: 12px; &.up { color: #67c23a; } &.down { color: #f56c6c; } &.warning { color: #e6a23c; } }
              }
            }
          }

          // 图表样式
          &.chart_bar, &.chart_line, &.chart_pie, &.chart_gauge {
            background: #fff;

            .chart-block {
              padding: 12px;

              .block-header { margin-bottom: 12px; .block-title { font-size: 14px; font-weight: 600; } }

              .chart-body {
                .mock-chart {
                  height: 100px;
                  display: flex;
                  align-items: center;
                  justify-content: center;

                  &.chart_bar {
                    .mock-bars {
                      display: flex;
                      align-items: flex-end;
                      gap: 8px;
                      height: 80px;

                      .bar {
                        width: 20px;
                        background: linear-gradient(180deg, #409eff 0%, #66b1ff 100%);
                        border-radius: 4px 4px 0 0;
                        transition: height 0.3s;
                      }
                    }
                  }

                  &.chart_line {
                    .line-svg { width: 100%; height: 60px; }
                  }

                  &.chart_pie {
                    .pie-chart {
                      width: 60px; height: 60px;
                      border-radius: 50%;
                      background: conic-gradient(#409eff 0% 35%, #67c23a 35% 55%, #e6a23c 55% 75%, #f56c6c 75% 100%);
                    }
                  }

                  &.chart_gauge {
                    flex-direction: column;
                    gap: 8px;

                    .gauge-circle {
                      width: 80px; height: 80px;
                      border-radius: 50%;
                      background: conic-gradient(var(--percent) #409eff, var(--percent) #f5f7fa);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      position: relative;

                      &::before {
                        content: '';
                        position: absolute;
                        width: 60px; height: 60px;
                        background: #fff;
                        border-radius: 50%;
                      }

                      .gauge-value {
                        font-size: 18px;
                        font-weight: 700;
                        color: #409eff;
                        z-index: 1;
                      }
                    }

                    .gauge-title { font-size: 12px; color: #909399; }
                  }
                }
              }
            }
          }

          // 步骤条
          &.steps {
            background: #fff;

            .steps-block {
              padding: 16px;

              .mock-steps {
                display: flex;
                justify-content: center;
                gap: 40px;

                .mock-step {
                  display: flex;
                  align-items: center;
                  gap: 8px;

                  &.active .step-circle { background: #409eff; color: #fff; }

                  .step-circle {
                    width: 28px; height: 28px;
                    border-radius: 50%;
                    background: #f5f7fa;
                    border: 2px solid #e4e7ed;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #909399;
                  }

                  .step-title { font-size: 12px; color: #606266; }
                }
              }
            }
          }

          // 分页
          &.pagination {
            background: #fff;

            .pagination-block {
              padding: 12px;

              .mock-pagination {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                gap: 8px;

                .page-total { font-size: 12px; color: #909399; }
                .page-btn {
                  padding: 4px 8px;
                  border: 1px solid #dcdfe6;
                  border-radius: 4px;
                  font-size: 12px;
                  color: #606266;
                  background: #fff;
                }
                .page-num {
                  padding: 4px 8px;
                  border: 1px solid #dcdfe6;
                  border-radius: 4px;
                  font-size: 12px;
                  color: #606266;
                  background: #fff;
                  min-width: 28px;
                  text-align: center;

                  &.active { background: #409eff; color: #fff; border-color: #409eff; }
                }
              }
            }
          }

          // 标签页
          &.tabs {
            background: #fff;

            .tabs-block {
              .mock-tabs-header {
                display: flex;
                gap: 0;
                border-bottom: 1px solid #e4e7ed;

                .mock-tab {
                  padding: 10px 20px;
                  font-size: 13px;
                  color: #909399;
                  border-bottom: 2px solid transparent;
                  cursor: pointer;

                  &.active {
                    color: #409eff;
                    border-bottom-color: #409eff;
                  }
                }
              }

              .mock-tabs-body {
                padding: 12px;

                .tabs-placeholder {
                  color: #c0c4cc;
                  font-size: 12px;
                  text-align: center;
                  padding: 20px;
                }
              }
            }
          }

          // 时间线
          &.timeline {
            background: #fff;

            .timeline-block {
              padding: 12px;

              .mock-timeline {
                .mock-timeline-item {
                  display: flex;
                  gap: 12px;
                  padding-bottom: 12px;

                  &:last-child { padding-bottom: 0; }

                  .timeline-dot {
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    background: #409eff;
                    position: relative;

                    &::before {
                      content: '';
                      position: absolute;
                      left: 4px; top: 10px;
                      width: 2px; height: calc(100% + 12px);
                      background: #e4e7ed;
                    }
                  }

                  .timeline-content {
                    .timeline-time { font-size: 11px; color: #909399; display: block; margin-bottom: 2px; }
                    .timeline-user { font-size: 12px; color: #303133; font-weight: 500; }
                    .timeline-action { font-size: 12px; color: #606266; }
                  }
                }
              }
            }
          }

          // 按钮组
          &.buttonGroup {
            background: #fff;

            .buttons-block {
              padding: 12px;

              .mock-buttons-row {
                display: flex;
                gap: 12px;

                .mock-btn {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-size: 12px;

                  &.primary { background: #409eff; color: #fff; }
                  &.success { background: #67c23a; color: #fff; }
                  &.danger { background: #f56c6c; color: #fff; }
                  &.default { background: #f5f7fa; color: #606266; border: 1px solid #dcdfe6; }
                }
              }
            }
          }

          // 组件标签
          .component-tag {
            position: absolute;
            bottom: 4px; right: 4px;
            display: flex;
            gap: 4px;
            padding: 2px 6px;
            background: rgba(0,0,0,0.6);
            border-radius: 4px;
            font-size: 10px;
            color: #fff;

            .comp-name { font-weight: 500; }
            .comp-size { opacity: 0.8; }
          }
        }
      }
    }

    // 数据预览
    .preview-data {
      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: #303133;
        margin-bottom: 16px;
      }

      .data-preview-grid {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .data-section {
          h5 {
            font-size: 14px;
            color: #606266;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ebeef5;
          }

          .mock-stats-row {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;

            .mock-stat-card {
              display: flex;
              align-items: center;
              gap: 16px;
              padding: 20px;
              background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
              border: 1px solid #e4e7ed;
              border-radius: 12px;

              .el-icon { color: #409eff; }

              .stat-content {
                flex: 1;

                .stat-num { font-size: 20px; font-weight: 700; color: #303133; display: block; }
                .stat-label { font-size: 13px; color: #909399; }
              }
            }
          }
        }
      }
    }

    // 配置详情
    .preview-config {
      h4 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        color: #303133;
        margin-bottom: 16px;
      }

      .config-components {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;

        .config-card {
          border: 1px solid #e4e7ed;
          border-radius: 12px;
          overflow: hidden;

          .config-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            color: #fff;

            .config-title { font-size: 14px; font-weight: 600; }
          }

          .config-body {
            padding: 16px;
            background: #fff;

            .config-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;

              &:last-child { margin-bottom: 0; }

              .config-label { font-size: 12px; color: #909399; }
              .config-value { font-size: 12px; color: #303133; font-weight: 500; }
            }

            .config-expand {
              margin-top: 12px;

              :deep(.el-collapse-item__header) {
                font-size: 12px;
                color: #409eff;
                height: 32px;
                line-height: 32px;
              }

              .config-detail {
                pre {
                  font-size: 11px;
                  background: #f5f7fa;
                  padding: 12px;
                  border-radius: 6px;
                  overflow-x: auto;
                  white-space: pre-wrap;
                  word-break: break-all;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 响应式
@media screen and (max-width: 1000px) {
  .template-home {
    .home-header { padding: 40px 20px; }
    .quick-create-section .quick-create-grid { grid-template-columns: repeat(2, 1fr); }
    .template-section .template-grid { grid-template-columns: repeat(2, 1fr); }
    .guide-section .guide-steps { grid-template-columns: repeat(2, 1fr); }
  }
  .preview-dialog .preview-container {
    .preview-features .features-grid { grid-template-columns: repeat(2, 1fr); }
    .preview-config .config-components { grid-template-columns: repeat(2, 1fr); }
    .preview-data .mock-stats-row { grid-template-columns: repeat(2, 1fr); }
  }
}

@media screen and (max-width: 600px) {
  .template-home {
    .quick-create-section .quick-create-grid { grid-template-columns: 1fr; }
    .template-section .template-grid { grid-template-columns: 1fr; }
    .guide-section .guide-steps { grid-template-columns: 1fr; }
  }
  .preview-dialog .preview-container {
    .preview-features .features-grid { grid-template-columns: 1fr; }
    .preview-config .config-components { grid-template-columns: 1fr; }
    .preview-data .mock-stats-row { grid-template-columns: 1fr; }
  }
}
</style>