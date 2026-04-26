<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageApi } from '@/api'

const router = useRouter()
const route = useRoute()

// 页面基本信息
const pageInfo = ref({
  id: 0,
  pageName: '',
  pageCode: '',
  pageType: 'list',
  modelId: null as number | null,
  components: [] as PageComponent[],
  status: 0
})

// 组件定义
interface PageComponent {
  id: string
  type: string
  label: string
  x: number      // 列位置 (0-11)
  y: number      // 行位置
  width: number  // 列宽度 (1-12)
  height: number // 行高度
  config: Record<string, any>
}

// 当前选中组件
const selectedComponent = ref<PageComponent | null>(null)
const selectedComponentIndex = ref<number | null>(null)

// 拖拽状态
const dragState = reactive({
  isDragging: false,
  dragType: '', // 'move' | 'resize-right' | 'resize-bottom' | 'resize-corner'
  startX: 0,
  startY: 0,
  startCompX: 0,
  startCompY: 0,
  startCompWidth: 0,
  startCompHeight: 0,
  dragIndex: -1
})

// 网格配置
const gridConfig = {
  columns: 12,
  rowHeight: 60, // 每行高度(px)
  gap: 8         // 间隙(px)
}

// 画布尺寸（用于计算）
const canvasWidth = ref(0)
const canvasRef = ref<HTMLElement | null>(null)

// 计算列宽度
const colWidth = computed(() => {
  return canvasWidth.value / gridConfig.columns
})

// 组件库分组
const componentGroups = [
  {
    name: '基础组件',
    components: [
      { type: 'container', label: '容器', icon: 'Grid', defaultWidth: 12, defaultHeight: 2 },
      { type: 'text', label: '文本', icon: 'Document', defaultWidth: 4, defaultHeight: 1 },
      { type: 'image', label: '图片', icon: 'Picture', defaultWidth: 4, defaultHeight: 2 },
      { type: 'button', label: '按钮', icon: 'Position', defaultWidth: 2, defaultHeight: 1 },
      { type: 'divider', label: '分割线', icon: 'Minus', defaultWidth: 12, defaultHeight: 1 }
    ]
  },
  {
    name: '数据组件',
    components: [
      { type: 'table', label: '数据表格', icon: 'Grid', defaultWidth: 12, defaultHeight: 5 },
      { type: 'form', label: '表单', icon: 'EditPen', defaultWidth: 12, defaultHeight: 4 },
      { type: 'list', label: '列表', icon: 'List', defaultWidth: 6, defaultHeight: 3 },
      { type: 'tree', label: '树形', icon: 'Share', defaultWidth: 4, defaultHeight: 4 }
    ]
  },
  {
    name: '图表组件',
    components: [
      { type: 'chart_bar', label: '柱状图', icon: 'Histogram', defaultWidth: 6, defaultHeight: 4 },
      { type: 'chart_line', label: '折线图', icon: 'TrendCharts', defaultWidth: 6, defaultHeight: 4 },
      { type: 'chart_pie', label: '饼图', icon: 'PieChart', defaultWidth: 4, defaultHeight: 3 },
      { type: 'chart_gauge', label: '仪表盘', icon: 'Odometer', defaultWidth: 3, defaultHeight: 3 }
    ]
  },
  {
    name: '布局组件',
    components: [
      { type: 'card', label: '卡片', icon: 'Postcard', defaultWidth: 6, defaultHeight: 3 },
      { type: 'tabs', label: '标签页', icon: 'Folder', defaultWidth: 12, defaultHeight: 3 },
      { type: 'collapse', label: '折叠面板', icon: 'Operation', defaultWidth: 12, defaultHeight: 2 },
      { type: 'row', label: '行容器', icon: 'Grid', defaultWidth: 12, defaultHeight: 2 },
      { type: 'col', label: '列容器', icon: 'Grid', defaultWidth: 6, defaultHeight: 2 }
    ]
  }
]

// 获取组件定义
const getComponentDef = (type: string) => {
  for (const group of componentGroups) {
    const comp = group.components.find(c => c.type === type)
    if (comp) return comp
  }
  return null
}

// 计算组件样式（绝对定位）
const getComponentStyle = (comp: PageComponent) => {
  return {
    left: `${comp.x * colWidth.value}px`,
    top: `${comp.y * gridConfig.rowHeight + comp.y * gridConfig.gap}px`,
    width: `${comp.width * colWidth.value - gridConfig.gap}px`,
    height: `${comp.height * gridConfig.rowHeight}px`
  }
}

// 添加组件到画布
const handleAddComponent = (type: string) => {
  const compDef = getComponentDef(type)
  if (!compDef) return

  // 计算可用位置
  let bestX = 0
  let bestY = 0

  if (pageInfo.value.components.length > 0) {
    // 找到最后一个组件的位置，尝试在其下方放置
    const maxY = Math.max(...pageInfo.value.components.map(c => c.y + c.height))
    bestY = maxY + 1 // 留一行间隙
  }

  const newComponent: PageComponent = {
    id: `comp_${Date.now()}`,
    type,
    label: compDef.label,
    x: bestX,
    y: bestY,
    width: compDef.defaultWidth,
    height: compDef.defaultHeight,
    config: {}
  }

  pageInfo.value.components.push(newComponent)
  handleSelectComponent(pageInfo.value.components.length - 1)
}

// 选择组件
const handleSelectComponent = (index: number) => {
  selectedComponentIndex.value = index
  selectedComponent.value = pageInfo.value.components[index]
}

// 删除组件
const handleDeleteComponent = (index: number) => {
  const comp = pageInfo.value.components[index]
  ElMessageBox.confirm(`确认删除组件 "${comp.label}" 吗?`, '提示', {
    type: 'warning'
  }).then(() => {
    pageInfo.value.components.splice(index, 1)
    if (selectedComponentIndex.value === index) {
      selectedComponent.value = null
      selectedComponentIndex.value = null
    } else if (selectedComponentIndex.value !== null && selectedComponentIndex.value > index) {
      selectedComponentIndex.value -= 1
      selectedComponent.value = pageInfo.value.components[selectedComponentIndex.value]
    }
    ElMessage.success('删除成功')
  })
}

// 复制组件
const handleCopyComponent = (index: number) => {
  const comp = JSON.parse(JSON.stringify(pageInfo.value.components[index]))
  comp.id = `comp_${Date.now()}`
  comp.x = 0
  comp.y = Math.max(...pageInfo.value.components.map(c => c.y + c.height)) + 1
  pageInfo.value.components.push(comp)
  handleSelectComponent(pageInfo.value.components.length - 1)
  ElMessage.success('复制成功')
}

// 开始拖拽移动
const handleDragStart = (index: number, event: MouseEvent) => {
  event.preventDefault()
  const comp = pageInfo.value.components[index]

  dragState.isDragging = true
  dragState.dragType = 'move'
  dragState.dragIndex = index
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.startCompX = comp.x
  dragState.startCompY = comp.y

  handleSelectComponent(index)
}

// 开始调整大小（右侧）
const handleResizeStartRight = (index: number, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const comp = pageInfo.value.components[index]

  dragState.isDragging = true
  dragState.dragType = 'resize-right'
  dragState.dragIndex = index
  dragState.startX = event.clientX
  dragState.startCompWidth = comp.width

  handleSelectComponent(index)
}

// 开始调整大小（底部）
const handleResizeStartBottom = (index: number, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const comp = pageInfo.value.components[index]

  dragState.isDragging = true
  dragState.dragType = 'resize-bottom'
  dragState.dragIndex = index
  dragState.startY = event.clientY
  dragState.startCompHeight = comp.height

  handleSelectComponent(index)
}

// 开始调整大小（右下角）
const handleResizeStartCorner = (index: number, event: MouseEvent) => {
  event.preventDefault()
  event.stopPropagation()
  const comp = pageInfo.value.components[index]

  dragState.isDragging = true
  dragState.dragType = 'resize-corner'
  dragState.dragIndex = index
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.startCompWidth = comp.width
  dragState.startCompHeight = comp.height

  handleSelectComponent(index)
}

// 拖拽移动中
const handleDragMove = (event: MouseEvent) => {
  if (!dragState.isDragging) return

  const comp = pageInfo.value.components[dragState.dragIndex]
  if (!comp) return

  if (dragState.dragType === 'move') {
    // 计算移动距离
    const deltaX = event.clientX - dragState.startX
    const deltaY = event.clientY - dragState.startY

    // 转换为网格位置
    const newColX = Math.round(deltaX / colWidth.value + dragState.startCompX)
    const newRowY = Math.round(deltaY / (gridConfig.rowHeight + gridConfig.gap) + dragState.startCompY)

    // 边界限制
    comp.x = Math.max(0, Math.min(gridConfig.columns - comp.width, newColX))
    comp.y = Math.max(0, newRowY)

    // 自动重排其他组件（可选）
    repositionComponents()

  } else if (dragState.dragType === 'resize-right' || dragState.dragType === 'resize-corner') {
    // 计算宽度变化
    const deltaX = event.clientX - dragState.startX
    const newWidth = Math.round(deltaX / colWidth.value + dragState.startCompWidth)

    // 边界限制（最小1列，最大12列，不超过边界）
    const maxWidth = gridConfig.columns - comp.x
    comp.width = Math.max(1, Math.min(maxWidth, newWidth))

    if (dragState.dragType === 'resize-corner') {
      // 同时调整高度
      const deltaY = event.clientY - dragState.startY
      const newHeight = Math.round(deltaY / gridConfig.rowHeight + dragState.startCompHeight)
      comp.height = Math.max(1, Math.min(10, newHeight))
    }

  } else if (dragState.dragType === 'resize-bottom') {
    // 计算高度变化
    const deltaY = event.clientY - dragState.startY
    const newHeight = Math.round(deltaY / gridConfig.rowHeight + dragState.startCompHeight)

    comp.height = Math.max(1, Math.min(10, newHeight))
  }

  // 更新选中组件
  selectedComponent.value = comp
}

// 结束拖拽
const handleDragEnd = () => {
  if (dragState.isDragging) {
    dragState.isDragging = false
    dragState.dragType = ''
    dragState.dragIndex = -1
  }
}

// 重新排列组件（防止重叠）
const repositionComponents = () => {
  // 按Y坐标排序
  const sorted = [...pageInfo.value.components].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y
    return a.x - b.x
  })

  // 检查重叠并调整位置
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]
      const b = sorted[j]

      // 检查是否重叠
      if (isOverlap(a, b)) {
        // 将b移动到a下方
        b.y = a.y + a.height + 1
      }
    }
  }

  // 更新原数组
  pageInfo.value.components = sorted
}

// 检查两个组件是否重叠
const isOverlap = (a: PageComponent, b: PageComponent) => {
  return !(a.x + a.width <= b.x ||
           b.x + b.width <= a.x ||
           a.y + a.height <= b.y ||
           b.y + b.height <= a.y)
}

// 模板定义（与主页模板一致）
const templates: Record<string, any[]> = {
  'blank': [],
  'standard-list': [
    { id: 'search', type: 'card', label: '搜索栏', x: 0, y: 0, width: 12, height: 2, config: { title: '搜索条件' } },
    { id: 'table', type: 'table', label: '数据表格', x: 0, y: 3, width: 12, height: 5, config: { dataSource: '' } },
    { id: 'pagination', type: 'card', label: '分页', x: 0, y: 9, width: 12, height: 1, config: {} }
  ],
  'crud-list': [
    { id: 'toolbar', type: 'card', label: '工具栏', x: 0, y: 0, width: 12, height: 1, config: { buttons: ['新增', '导出', '批量删除'] } },
    { id: 'search', type: 'card', label: '搜索栏', x: 0, y: 2, width: 12, height: 2, config: {} },
    { id: 'table', type: 'table', label: '数据表格', x: 0, y: 5, width: 12, height: 6, config: {} },
    { id: 'pagination', type: 'card', label: '分页', x: 0, y: 12, width: 12, height: 1, config: {} }
  ],
  'simple-form': [
    { id: 'header', type: 'card', label: '表单标题', x: 0, y: 0, width: 12, height: 1, config: { title: '基本信息' } },
    { id: 'form', type: 'form', label: '表单组件', x: 0, y: 2, width: 12, height: 4, config: {} },
    { id: 'buttons', type: 'button', label: '提交按钮', x: 4, y: 7, width: 4, height: 1, config: { text: '提交', btnType: 'primary' } }
  ],
  'multi-step-form': [
    { id: 'steps', type: 'card', label: '步骤条', x: 0, y: 0, width: 12, height: 1, config: {} },
    { id: 'form1', type: 'form', label: '第一步表单', x: 0, y: 2, width: 12, height: 4, config: { step: 1 } },
    { id: 'form2', type: 'form', label: '第二步表单', x: 0, y: 7, width: 12, height: 4, config: { step: 2 } },
    { id: 'buttons', type: 'card', label: '操作按钮', x: 0, y: 12, width: 12, height: 1, config: {} }
  ],
  'dashboard-standard': [
    { id: 'stats1', type: 'card', label: '统计卡片1', x: 0, y: 0, width: 3, height: 2, config: { type: 'stat' } },
    { id: 'stats2', type: 'card', label: '统计卡片2', x: 3, y: 0, width: 3, height: 2, config: { type: 'stat' } },
    { id: 'stats3', type: 'card', label: '统计卡片3', x: 6, y: 0, width: 3, height: 2, config: { type: 'stat' } },
    { id: 'stats4', type: 'card', label: '统计卡片4', x: 9, y: 0, width: 3, height: 2, config: { type: 'stat' } },
    { id: 'chart1', type: 'chart_bar', label: '柱状图', x: 0, y: 3, width: 6, height: 4, config: {} },
    { id: 'chart2', type: 'chart_line', label: '折线图', x: 6, y: 3, width: 6, height: 4, config: {} },
    { id: 'quick', type: 'card', label: '快捷操作', x: 0, y: 8, width: 4, height: 2, config: {} },
    { id: 'timeline', type: 'card', label: '最近动态', x: 4, y: 8, width: 8, height: 2, config: {} }
  ],
  'dashboard-analytics': [
    { id: 'header', type: 'card', label: '页面标题', x: 0, y: 0, width: 12, height: 1, config: { title: '数据分析' } },
    { id: 'kpi1', type: 'chart_gauge', label: 'KPI仪表1', x: 0, y: 2, width: 3, height: 3, config: {} },
    { id: 'kpi2', type: 'chart_gauge', label: 'KPI仪表2', x: 3, y: 2, width: 3, height: 3, config: {} },
    { id: 'kpi3', type: 'chart_gauge', label: 'KPI仪表3', x: 6, y: 2, width: 3, height: 3, config: {} },
    { id: 'kpi4', type: 'chart_gauge', label: 'KPI仪表4', x: 9, y: 2, width: 3, height: 3, config: {} },
    { id: 'bar', type: 'chart_bar', label: '柱状图', x: 0, y: 6, width: 6, height: 4, config: {} },
    { id: 'pie', type: 'chart_pie', label: '饼图', x: 6, y: 6, width: 6, height: 4, config: {} },
    { id: 'line', type: 'chart_line', label: '趋势图', x: 0, y: 11, width: 12, height: 4, config: {} }
  ],
  'detail-standard': [
    { id: 'header', type: 'card', label: '基本信息', x: 0, y: 0, width: 12, height: 2, config: {} },
    { id: 'info1', type: 'card', label: '详情卡片1', x: 0, y: 3, width: 6, height: 3, config: {} },
    { id: 'info2', type: 'card', label: '详情卡片2', x: 6, y: 3, width: 6, height: 3, config: {} },
    { id: 'timeline', type: 'card', label: '操作记录', x: 0, y: 7, width: 12, height: 3, config: {} },
    { id: 'buttons', type: 'card', label: '操作按钮', x: 0, y: 11, width: 12, height: 1, config: {} }
  ],
  'master-detail': [
    { id: 'master', type: 'card', label: '主数据', x: 0, y: 0, width: 12, height: 3, config: {} },
    { id: 'tabs', type: 'tabs', label: '标签页', x: 0, y: 4, width: 12, height: 8, config: { tabs: ['明细', '附件', '流程'] } }
  ]
}

// 加载模板组件
const loadTemplateComponents = (templateId: string) => {
  const templateComponents = templates[templateId]
  if (templateComponents && templateComponents.length > 0) {
    // 复制模板组件，生成新ID
    pageInfo.value.components = templateComponents.map(comp => ({
      ...comp,
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))
    ElMessage.success(`已加载模板组件: ${templateComponents.length} 个`)
  }
}

// 保存页面
const handleSave = async () => {
  if (!pageInfo.value.pageName) {
    ElMessage.warning('请输入页面名称')
    return
  }
  try {
    if (pageInfo.value.id) {
      await pageApi.update(pageInfo.value)
      ElMessage.success('保存成功')
    } else {
      const res = await pageApi.create(pageInfo.value)
      pageInfo.value.id = res.data
      ElMessage.success('创建成功')
    }
  } catch (e) {
    console.error(e)
  }
}

// 发布页面
const handlePublish = async () => {
  if (!pageInfo.value.id) {
    ElMessage.warning('请先保存页面')
    return
  }
  ElMessageBox.confirm('确认发布页面吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    pageInfo.value.status = 1
    ElMessage.success('发布成功')
  })
}

// 返回列表
const handleBack = () => {
  router.push('/page/list')
}

// 预览页面
const previewVisible = ref(false)
const handlePreview = () => {
  previewVisible.value = true
}

// 清空画布
const handleClearCanvas = () => {
  ElMessageBox.confirm('确认清空所有组件吗？', '提示', {
    type: 'warning'
  }).then(() => {
    pageInfo.value.components = []
    selectedComponent.value = null
    selectedComponentIndex.value = null
    ElMessage.success('已清空')
  })
}

// 加载页面数据
const loadPageData = async () => {
  const id = route.params.id as string

  // 检查是否有模板参数
  const templateId = route.query.template as string
  const templateName = route.query.name as string
  const templateType = route.query.type as string

  if (templateId) {
    // 从模板创建
    pageInfo.value.pageName = templateName || '未命名页面'
    pageInfo.value.pageType = templateType || 'list'
    pageInfo.value.pageCode = templateId.replace(/-/g, '_')

    // 加载模板组件
    loadTemplateComponents(templateId)
  } else if (id && id !== 'new') {
    // 编辑已有页面
    try {
      const res = await pageApi.get(Number(id))
      pageInfo.value = res.data
    } catch (e) {
      console.error(e)
    }
  }
}

// 更新画布宽度
const updateCanvasWidth = () => {
  if (canvasRef.value) {
    canvasWidth.value = canvasRef.value.clientWidth
  }
}

// 页面类型选项
const pageTypeOptions = [
  { label: '列表页', value: 'list' },
  { label: '详情页', value: 'detail' },
  { label: '表单页', value: 'form' },
  { label: '仪表盘', value: 'dashboard' }
]

// 监听选中组件变化，同步更新属性面板
watch(selectedComponent, (newVal) => {
  if (newVal && selectedComponentIndex.value !== null) {
    pageInfo.value.components[selectedComponentIndex.value] = newVal
  }
}, { deep: true })

// 全局鼠标事件
onMounted(() => {
  loadPageData()

  // 添加全局事件监听
  document.addEventListener('mousemove', handleDragMove)
  document.addEventListener('mouseup', handleDragEnd)

  // 初始化画布宽度
  nextTick(() => {
    updateCanvasWidth()
    window.addEventListener('resize', updateCanvasWidth)
  })
})

// 清理事件监听
const cleanup = () => {
  document.removeEventListener('mousemove', handleDragMove)
  document.removeEventListener('mouseup', handleDragEnd)
  window.removeEventListener('resize', updateCanvasWidth)
}

// 在路由离开时清理
watch(() => route.path, () => {
  cleanup()
})
</script>

<template>
  <div class="page-builder">
    <!-- 顶部工具栏 -->
    <div class="builder-header">
      <div class="header-left">
        <el-button @click="handleBack" class="back-btn">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <el-input v-model="pageInfo.pageName" placeholder="页面名称" class="name-input" />
        <el-input v-model="pageInfo.pageCode" placeholder="页面编码" class="code-input" />
        <el-select v-model="pageInfo.pageType" placeholder="页面类型" class="type-select">
          <el-option v-for="item in pageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="header-right">
        <el-button @click="handlePreview" class="preview-btn">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" @click="handleSave" class="save-btn">
          <el-icon><FolderChecked /></el-icon>
          保存
        </el-button>
        <el-button type="success" @click="handlePublish" v-if="pageInfo.id && pageInfo.status === 0" class="publish-btn">
          <el-icon><Promotion /></el-icon>
          发布
        </el-button>
      </div>
    </div>

    <!-- 设计器主体 -->
    <div class="builder-body">
      <!-- 左侧组件库 -->
      <div class="component-panel">
        <div class="panel-header">
          <span>组件库</span>
          <span class="tip">点击添加</span>
        </div>
        <div class="panel-body">
          <el-collapse>
            <el-collapse-item v-for="group in componentGroups" :key="group.name" :title="group.name">
              <div class="component-list">
                <div
                  class="component-item"
                  v-for="comp in group.components"
                  :key="comp.type"
                  @click="handleAddComponent(comp.type)"
                >
                  <div class="comp-icon">
                    <el-icon :size="24"><component :is="comp.icon" /></el-icon>
                  </div>
                  <div class="comp-info">
                    <span class="comp-label">{{ comp.label }}</span>
                    <span class="comp-size">{{ comp.defaultWidth }}×{{ comp.defaultHeight }}</span>
                  </div>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-area">
        <div class="canvas-header">
          <span class="canvas-title">页面画布</span>
          <span class="canvas-info">
            <el-tag size="small">组件: {{ pageInfo.components.length }}</el-tag>
            <el-tag size="small" type="success">网格: 12列</el-tag>
          </span>
          <div class="canvas-tools">
            <el-button size="small" @click="handleClearCanvas" :disabled="pageInfo.components.length === 0">
              <el-icon><Delete /></el-icon>
              清空
            </el-button>
          </div>
        </div>
        <div class="canvas-body" ref="canvasRef">
          <!-- 网格背景 -->
          <div class="grid-background">
            <div class="grid-column" v-for="i in 12" :key="i"></div>
          </div>

          <!-- 组件层 -->
          <div class="components-layer" v-if="pageInfo.components.length > 0">
            <div
              class="canvas-component"
              v-for="(comp, index) in pageInfo.components"
              :key="comp.id"
              :class="{
                selected: selectedComponentIndex === index,
                dragging: dragState.isDragging && dragState.dragIndex === index
              }"
              :style="getComponentStyle(comp)"
              @click="handleSelectComponent(index)"
              @mousedown="handleDragStart(index, $event)"
            >
              <!-- 组件内容 -->
              <div class="component-content">
                <div class="component-label">
                  <el-icon><component :is="getComponentDef(comp.type)?.icon" /></el-icon>
                  <span>{{ comp.label }}</span>
                </div>
                <div class="component-preview" :class="comp.type">
                  <span>{{ comp.width }}列 × {{ comp.height }}行</span>
                </div>
              </div>

              <!-- 工具栏 -->
              <div class="component-toolbar" v-show="selectedComponentIndex === index">
                <el-button link size="small" @click.stop="handleCopyComponent(index)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button link size="small" type="danger" @click.stop="handleDeleteComponent(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>

              <!-- 调整大小手柄 -->
              <div class="resize-handles" v-show="selectedComponentIndex === index">
                <!-- 右侧手柄 -->
                <div class="resize-handle resize-right" @mousedown="handleResizeStartRight(index, $event)">
                  <el-icon><DCaret /></el-icon>
                </div>
                <!-- 底部手柄 -->
                <div class="resize-handle resize-bottom" @mousedown="handleResizeStartBottom(index, $event)">
                  <el-icon><DCaret /></el-icon>
                </div>
                <!-- 右下角手柄 -->
                <div class="resize-handle resize-corner" @mousedown="handleResizeStartCorner(index, $event)">
                  <el-icon><Rank /></el-icon>
                </div>
              </div>

              <!-- 位置尺寸标签 -->
              <div class="size-label">
                {{ comp.width }}×{{ comp.height }} @({{ comp.x }},{{ comp.y }})
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div class="empty-state" v-else>
            <el-empty description="从左侧点击组件添加到画布">
              <template #image>
                <el-icon :size="60" color="#c0c4cc"><Grid /></el-icon>
              </template>
            </el-empty>
          </div>
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="props-panel">
        <div class="panel-header">
          <span>属性配置</span>
        </div>
        <div class="props-body" v-if="selectedComponent">
          <el-form :model="selectedComponent" label-width="70px" size="small">
            <el-form-item label="组件ID">
              <el-input v-model="selectedComponent.id" disabled />
            </el-form-item>
            <el-form-item label="组件类型">
              <el-tag>{{ selectedComponent.label }}</el-tag>
            </el-form-item>

            <el-divider content-position="left">位置与尺寸</el-divider>

            <el-form-item label="列位置X">
              <el-slider v-model="selectedComponent.x" :min="0" :max="12 - selectedComponent.width" :step="1" show-stops />
            </el-form-item>
            <el-form-item label="行位置Y">
              <el-input-number v-model="selectedComponent.y" :min="0" :max="20" />
            </el-form-item>
            <el-form-item label="列宽度">
              <el-slider v-model="selectedComponent.width" :min="1" :max="12 - selectedComponent.x" :step="1" show-stops :marks="{ 3: '¼', 4: '⅓', 6: '½', 8: '⅔', 12: '全' }" />
            </el-form-item>
            <el-form-item label="行高度">
              <el-input-number v-model="selectedComponent.height" :min="1" :max="10" />
            </el-form-item>

            <el-divider content-position="left">组件配置</el-divider>

            <el-form-item label="标题" v-if="['card', 'tabs', 'collapse'].includes(selectedComponent.type)">
              <el-input v-model="selectedComponent.config.title" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="数据源" v-if="['table', 'list', 'form'].includes(selectedComponent.type)">
              <el-input v-model="selectedComponent.config.dataSource" placeholder="API地址" />
            </el-form-item>
            <el-form-item label="按钮文字" v-if="selectedComponent.type === 'button'">
              <el-input v-model="selectedComponent.config.text" placeholder="按钮文字" />
            </el-form-item>
            <el-form-item label="按钮类型" v-if="selectedComponent.type === 'button'">
              <el-select v-model="selectedComponent.config.btnType">
                <el-option label="主要" value="primary" />
                <el-option label="成功" value="success" />
                <el-option label="警告" value="warning" />
                <el-option label="危险" value="danger" />
              </el-select>
            </el-form-item>
          </el-form>

          <!-- 操作按钮 -->
          <div class="props-actions">
            <el-button size="small" @click="handleCopyComponent(selectedComponentIndex!)">
              <el-icon><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button size="small" type="danger" @click="handleDeleteComponent(selectedComponentIndex!)">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
        <el-empty v-else description="请选择组件配置属性" />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog title="页面预览" v-model="previewVisible" width="90%" top="5vh">
      <div class="preview-container">
        <div class="preview-grid">
          <div
            class="preview-component"
            v-for="comp in pageInfo.components"
            :key="comp.id"
            :style="{
              gridColumn: `${comp.x + 1} / span ${comp.width}`,
              gridRow: `${comp.y + 1} / span ${comp.height}`
            }"
          >
            <div class="preview-content">
              <el-icon><component :is="getComponentDef(comp.type)?.icon" /></el-icon>
              <span>{{ comp.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.page-builder {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%);

  // 顶部工具栏
  .builder-header {
    height: 64px;
    background: #fff;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .header-left, .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .back-btn, .preview-btn { border-radius: 8px; }

    .name-input, .code-input {
      width: 180px;
      :deep(.el-input__wrapper) { border-radius: 8px; }
    }

    .type-select {
      width: 120px;
      :deep(.el-select__wrapper) { border-radius: 8px; }
    }

    .save-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      &:hover { transform: translateY(-1px); }
    }

    .publish-btn {
      background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
      border: none;
      border-radius: 8px;
      &:hover { transform: translateY(-1px); }
    }
  }

  // 主体区域
  .builder-body {
    flex: 1;
    display: flex;
    overflow: hidden;

    // 左侧组件库
    .component-panel {
      width: 260px;
      background: #fff;
      border-right: 1px solid #e8e8e8;
      display: flex;
      flex-direction: column;

      .panel-header {
        height: 48px;
        padding: 12px 16px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
        font-weight: 600;
        .tip { font-size: 12px; color: #909399; }
      }

      .panel-body {
        flex: 1;
        overflow: auto;
        :deep(.el-collapse-item__header) {
          background: transparent;
          font-weight: 500;
          padding-left: 16px;
        }

        .component-list {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;

          .component-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border: 1px solid #e4e7ed;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              border-color: #409eff;
              background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
              transform: translateY(-2px);
              .comp-icon { background: #409eff; color: #fff; }
            }

            .comp-icon {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f5f7fa;
              transition: all 0.2s;
            }

            .comp-info {
              .comp-label { font-weight: 500; color: #303133; }
              .comp-size { font-size: 12px; color: #909399; }
            }
          }
        }
      }
    }

    // 中间画布
    .canvas-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fff;

      .canvas-header {
        height: 48px;
        padding: 12px 20px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        align-items: center;
        gap: 16px;
        background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);

        .canvas-title { font-weight: 600; color: #303133; }
        .canvas-info { display: flex; gap: 8px; }
        .canvas-tools { margin-left: auto; }
      }

      .canvas-body {
        flex: 1;
        position: relative;
        overflow: auto;
        background: #fafbfc;

        // 网格背景
        .grid-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          padding: 8px;

          .grid-column {
            flex: 1;
            border-right: 1px dashed #e4e7ed;
            margin-right: 8px;

            &:last-child { border-right: none; }
          }
        }

        // 组件层
        .components-layer {
          position: relative;
          min-height: 100%;
          padding: 8px;

          .canvas-component {
            position: absolute;
            background: #fff;
            border: 2px solid #e4e7ed;
            border-radius: 12px;
            cursor: move;
            transition: box-shadow 0.2s, border-color 0.2s;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

            &:hover {
              border-color: #409eff;
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
            }

            &.selected {
              border-color: #409eff;
              box-shadow: 0 6px 20px rgba(64, 158, 255, 0.3);

              .resize-handles { opacity: 1; }
              .component-toolbar { opacity: 1; }
              .size-label { opacity: 1; }
            }

            &.dragging {
              opacity: 0.8;
              cursor: grabbing;
              box-shadow: 0 10px 30px rgba(64, 158, 255, 0.4);
              z-index: 100;
            }

            // 组件内容
            .component-content {
              padding: 16px;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              pointer-events: none;

              .component-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                color: #303133;
              }

              .component-preview {
                margin-top: 8px;
                font-size: 12px;
                color: #909399;
              }
            }

            // 工具栏
            .component-toolbar {
              position: absolute;
              top: 8px;
              right: 8px;
              display: flex;
              gap: 4px;
              opacity: 0;
              transition: opacity 0.2s;
              z-index: 10;
            }

            // 调整大小手柄
            .resize-handles {
              position: absolute;
              opacity: 0;
              transition: opacity 0.2s;
              z-index: 10;

              .resize-handle {
                position: absolute;
                background: #409eff;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #fff;
                cursor: pointer;
                transition: transform 0.2s;

                &:hover {
                  transform: scale(1.2);
                }

                // 右侧手柄
                &.resize-right {
                  right: -6px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 12px;
                  height: 24px;
                  cursor: ew-resize;
                }

                // 底部手柄
                &.resize-bottom {
                  bottom: -6px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 24px;
                  height: 12px;
                  cursor: ns-resize;
                }

                // 右下角手柄
                &.resize-corner {
                  right: -8px;
                  bottom: -8px;
                  width: 16px;
                  height: 16px;
                  cursor: nwse-resize;
                  border-radius: 50%;
                }
              }
            }

            // 尺寸位置标签
            .size-label {
              position: absolute;
              bottom: 8px;
              left: 8px;
              font-size: 11px;
              color: #909399;
              background: rgba(255, 255, 255, 0.9);
              padding: 2px 6px;
              border-radius: 4px;
              opacity: 0;
              transition: opacity 0.2s;
            }
          }
        }

        // 空状态
        .empty-state {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
    }

    // 右侧属性面板
    .props-panel {
      width: 300px;
      background: #fff;
      border-left: 1px solid #e8e8e8;
      display: flex;
      flex-direction: column;

      .panel-header {
        height: 48px;
        padding: 12px 16px;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        color: #303133;
        background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
      }

      .props-body {
        flex: 1;
        padding: 16px;
        overflow: auto;

        :deep(.el-form-item) {
          margin-bottom: 16px;
          .el-form-item__label { font-weight: 500; }
          .el-input__wrapper, .el-select__wrapper { border-radius: 8px; }
        }

        :deep(.el-divider__text) { font-weight: 500; }

        :deep(.el-slider__marks-text) {
          font-size: 10px;
          &:first-child { left: 0; }
        }

        .props-actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
        }
      }
    }
  }
}

// 预览弹窗
.preview-container {
  height: 70vh;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-auto-rows: 60px;
    gap: 8px;

    .preview-component {
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #909399;
      }
    }
  }
}
</style>