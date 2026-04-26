<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { VueFlow, useVueFlow, MarkerType, Connection, Edge, Node, PanelPosition } from '@vue-flow/core'
import { Controls, MiniMap, Panel } from '@vue-flow/additional-components'
import { flowApi, FlowDefinition, FlowNode, FlowEdge } from '@/api'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

const router = useRouter()
const route = useRoute()

// 流程基本信息
interface FlowInfo {
  id: number
  flowName: string
  flowCode: string
  formId: number | null
  formName: string
  status: number
  version: number
  tenantId?: string
  createdTime?: string
}

const flowInfo = ref<FlowInfo>({
  id: 0,
  flowName: '',
  flowCode: '',
  formId: null,
  formName: '',
  status: 0,
  version: 1
})

// Vue Flow 实例
const { addNodes, addEdges, removeNodes, fitView, getNodes, getEdges, onConnect, onNodesChange, onEdgesChange } = useVueFlow()

// 流程节点
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// 当前选中节点
const selectedNode = ref<Node | null>(null)

// 节点类型定义
const nodeTypes = [
  { type: 'start', label: '开始节点', icon: 'CircleCheck', color: '#67C23A' },
  { type: 'user_task', label: '用户审批', icon: 'User', color: '#409EFF' },
  { type: 'condition', label: '条件分支', icon: 'Share', color: '#E6A23C' },
  { type: 'parallel', label: '并行审批', icon: 'Grid', color: '#909399' },
  { type: 'join', label: '会签汇聚', icon: 'Connection', color: '#F56C6C' },
  { type: 'end', label: '结束节点', icon: 'CircleClose', color: '#C0C4CC' }
]

// 表单列表（用于关联）
const formList = ref<any[]>([])

// 审批人选项
const assignOptions = ref<any[]>([])
const assignTypeOptions = [
  { label: '指定用户', value: 'user' },
  { label: '指定角色', value: 'role' },
  { label: '指定部门', value: 'dept' },
  { label: '发起人上级', value: 'leader' },
  { label: '表单字段', value: 'field' }
]

// 节点配置弹窗
const nodeConfigVisible = ref(false)
const nodeConfig = ref({
  nodeId: '',
  nodeName: '',
  nodeType: '',
  assignType: 'user',
  assignValue: [] as string[],
  conditionExpr: '',
  timeout: 0,
  autoApprove: false,
  rejectAction: 'back'
})

// 预览弹窗
const previewVisible = ref(false)

// 获取节点默认位置
const getDefaultPosition = () => {
  const existingNodes = getNodes.value
  if (existingNodes.length === 0) {
    return { x: 100, y: 100 }
  }
  const lastNode = existingNodes[existingNodes.length - 1]
  return { x: lastNode.position.x + 200, y: lastNode.position.y }
}

// 添加节点
const handleAddNode = (type: string) => {
  const nodeTypeDef = nodeTypes.find(n => n.type === type)
  const id = `node_${Date.now()}`
  const position = getDefaultPosition()

  const newNode: Node = {
    id,
    type: type === 'start' || type === 'end' ? 'input' : 'default',
    position,
    data: {
      label: nodeTypeDef?.label || type,
      nodeType: type,
      nodeName: nodeTypeDef?.label,
      config: {}
    },
    class: `flow-node-${type}`,
    style: { backgroundColor: nodeTypeDef?.color }
  }

  addNodes([newNode])
  nodes.value = getNodes.value

  // 如果是开始节点，自动添加到第一个
  if (type === 'start' && nodes.value.length > 1) {
    const startNode = nodes.value.find(n => n.data.nodeType === 'start')
    if (startNode) {
      // 将开始节点移到最前面
      nodes.value = [startNode, ...nodes.value.filter(n => n.id !== startNode.id)]
    }
  }

  handleSelectNode(newNode)
}

// 选择节点
const handleSelectNode = (node: Node) => {
  selectedNode.value = node
  nodeConfig.value = {
    nodeId: node.id,
    nodeName: node.data.nodeName || '',
    nodeType: node.data.nodeType,
    assignType: node.data.config?.assignType || 'user',
    assignValue: node.data.config?.assignValue || [],
    conditionExpr: node.data.config?.conditionExpr || '',
    timeout: node.data.config?.timeout || 0,
    autoApprove: node.data.config?.autoApprove || false,
    rejectAction: node.data.config?.rejectAction || 'back'
  }
}

// 删除节点
const handleDeleteNode = (node: Node) => {
  ElMessageBox.confirm(`确认删除节点 "${node.data.nodeName}" 吗?`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    removeNodes([node])
    nodes.value = getNodes.value
    if (selectedNode.value?.id === node.id) {
      selectedNode.value = null
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 连接节点
onConnect((connection: Connection) => {
  const newEdge: Edge = {
    id: `edge_${connection.source}_${connection.target}`,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle || null,
    targetHandle: connection.targetHandle || null,
    animated: true,
    markerEnd: MarkerType.ArrowClosed
  }
  addEdges([newEdge])
  edges.value = getEdges.value
})

// 节点变化监听
onNodesChange((_changes) => {
  nodes.value = getNodes.value
})

// 边变化监听
onEdgesChange((_changes) => {
  edges.value = getEdges.value
})

// 配置节点（保留备用）
const _handleConfigNode = (node: Node) => {
  handleSelectNode(node)
  nodeConfigVisible.value = true
}

// 保存节点配置
const handleSaveNodeConfig = () => {
  if (selectedNode.value) {
    selectedNode.value.data.nodeName = nodeConfig.value.nodeName
    selectedNode.value.data.config = {
      assignType: nodeConfig.value.assignType,
      assignValue: nodeConfig.value.assignValue,
      conditionExpr: nodeConfig.value.conditionExpr,
      timeout: nodeConfig.value.timeout,
      autoApprove: nodeConfig.value.autoApprove,
      rejectAction: nodeConfig.value.rejectAction
    }
    selectedNode.value.data.label = nodeConfig.value.nodeName
    nodes.value = getNodes.value
  }
  nodeConfigVisible.value = false
}

// 保存流程
const handleSave = async () => {
  if (!flowInfo.value.flowName) {
    ElMessage.warning('请输入流程名称')
    return
  }

  // 验证节点
  const hasStart = nodes.value.some(n => n.data.nodeType === 'start')
  const hasEnd = nodes.value.some(n => n.data.nodeType === 'end')
  if (!hasStart) {
    ElMessage.warning('流程必须包含开始节点')
    return
  }
  if (!hasEnd) {
    ElMessage.warning('流程必须包含结束节点')
    return
  }

  // 构建流程定义
  const flowData = {
    ...flowInfo.value,
    nodes: nodes.value.map(n => ({
      nodeId: n.id,
      nodeType: n.data.nodeType,
      nodeName: n.data.nodeName,
      position: n.position,
      config: n.data.config
    })),
    edges: edges.value.map(e => ({
      edgeId: e.id,
      source: e.source,
      target: e.target,
      condition: e.data?.condition || null
    }))
  }

  try {
    if (flowInfo.value.id) {
      await flowApi.update(flowData)
      ElMessage.success('保存成功')
    } else {
      const res = await flowApi.create(flowData)
      flowInfo.value.id = res.data
      ElMessage.success('创建成功')
    }
  } catch (e) {
    console.error(e)
  }
}

// 发布流程
const handlePublish = async () => {
  if (!flowInfo.value.id) {
    ElMessage.warning('请先保存流程')
    return
  }
  ElMessageBox.confirm('确认发布流程吗？发布后可用于发起审批', '提示', {
    type: 'warning'
  }).then(async () => {
    await flowApi.publish(flowInfo.value.id)
    flowInfo.value.status = 1
    ElMessage.success('发布成功')
  })
}

// 返回列表
const handleBack = () => {
  router.push('/flow/list')
}

// 预览流程
const handlePreview = () => {
  previewVisible.value = true
  nextTick(() => {
    fitView()
  })
}

// 加载流程数据
const loadFlowData = async () => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    try {
      const res = await flowApi.get(Number(id))
      flowInfo.value = {
        id: res.data.id,
        flowName: res.data.flowName,
        flowCode: res.data.flowCode,
        formId: res.data.formId,
        formName: res.data.formName || '',
        status: res.data.status,
        version: res.data.version,
        tenantId: res.data.tenantId,
        createdTime: res.data.createdTime
      }

      // 加载节点
      if (res.data.nodes) {
        nodes.value = res.data.nodes.map((n: any) => ({
          id: n.nodeId,
          type: n.nodeType === 'start' ? 'input' : n.nodeType === 'end' ? 'output' : 'default',
          position: n.position,
          data: {
            label: n.nodeName,
            nodeType: n.nodeType,
            nodeName: n.nodeName,
            config: n.config || {}
          }
        }))
      }

      // 加载边
      if (res.data.edges) {
        edges.value = res.data.edges.map((e: any) => ({
          id: e.edgeId,
          source: e.source,
          target: e.target,
          animated: true,
          markerEnd: MarkerType.ArrowClosed
        }))
      }

      nextTick(() => {
        fitView()
      })
    } catch (e) {
      console.error(e)
    }
  } else {
    // 新建流程，添加默认开始和结束节点
    handleAddNode('start')
    handleAddNode('end')

    // 自动连接
    const startNode = nodes.value.find(n => n.data.nodeType === 'start')
    const endNode = nodes.value.find(n => n.data.nodeType === 'end')
    if (startNode && endNode) {
      addEdges([
        {
          id: 'edge_start_end',
          source: startNode.id,
          target: endNode.id,
          animated: true,
          markerEnd: MarkerType.ArrowClosed
        }
      ])
      edges.value = getEdges.value
    }
  }
}

// 加载表单列表
const loadFormList = async () => {
  try {
    const res = await flowApi.getForms()
    formList.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 加载审批人选项
const loadAssignOptions = async () => {
  // 用户列表
  try {
    const res = await flowApi.getAssignOptions()
    assignOptions.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

// 自定义节点模板
const nodeTemplate = (node: Node) => {
  const nodeTypeDef = nodeTypes.find(n => n.type === node.data.nodeType)
  return `
    <div class="flow-node ${node.data.nodeType}">
      <div class="node-header">
        <span class="node-icon" style="color: ${nodeTypeDef?.color}">
          <i class="el-icon">${nodeTypeDef?.icon}</i>
        </span>
        <span class="node-title">${node.data.nodeName}</span>
      </div>
      <div class="node-body">
        ${node.data.nodeType === 'user_task' ?
          `<span class="node-info">审批人: ${node.data.config?.assignValue?.join(',') || '未配置'}</span>` :
          ''}
        ${node.data.nodeType === 'condition' ?
          `<span class="node-info">条件: ${node.data.config?.conditionExpr || '未配置'}</span>` :
          ''}
      </div>
    </div>
  `
}

onMounted(() => {
  loadFlowData()
  loadFormList()
  loadAssignOptions()
})
</script>

<template>
  <div class="flow-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <el-input v-model="flowInfo.flowName" placeholder="流程名称" style="width: 200px" />
        <el-input v-model="flowInfo.flowCode" placeholder="流程编码" style="width: 150px" />
        <el-select v-model="flowInfo.formId" placeholder="关联表单" style="width: 200px" clearable>
          <el-option
            v-for="form in formList"
            :key="form.id"
            :label="form.formName"
            :value="form.id"
          />
        </el-select>
      </div>
      <div class="header-right">
        <el-button @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
        <el-button type="primary" @click="handleSave">
          <el-icon><FolderChecked /></el-icon>
          保存
        </el-button>
        <el-button type="success" @click="handlePublish" v-if="flowInfo.id && flowInfo.status === 0">
          <el-icon><Promotion /></el-icon>
          发布
        </el-button>
      </div>
    </div>

    <!-- 设计器主体 -->
    <div class="designer-body">
      <!-- 左侧节点面板 -->
      <div class="node-panel">
        <div class="panel-header">
          <span>节点组件</span>
        </div>
        <div class="panel-body">
          <div class="node-list">
            <div
              class="node-item"
              v-for="nodeType in nodeTypes"
              :key="nodeType.type"
              @click="handleAddNode(nodeType.type)"
            >
              <el-icon :size="24" :color="nodeType.color">
                <component :is="nodeType.icon" />
              </el-icon>
              <span>{{ nodeType.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-area">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :default-zoom="1"
          :min-zoom="0.5"
          :max-zoom="2"
          :snap-grid="[20, 20]"
          :snap-to-grid="true"
          fit-on-init
          @node-click="(event: any) => handleSelectNode(event.node)"
        >
          <!-- 自定义节点 -->
          <template #node-custom="{ data }">
            <div class="flow-node" :class="data.nodeType">
              <div class="node-header">
                <el-icon :color="nodeTypes.find(n => n.type === data.nodeType)?.color">
                  <component :is="nodeTypes.find(n => n.type === data.nodeType)?.icon" />
                </el-icon>
                <span>{{ data.nodeName }}</span>
              </div>
              <div class="node-content" v-if="data.nodeType === 'user_task'">
                <el-tag size="small" type="info">
                  {{ data.config?.assignType || '未配置审批人' }}
                </el-tag>
              </div>
            </div>
          </template>

          <!-- 控制面板 -->
          <Controls />

          <!-- 小地图 -->
          <MiniMap />

          <!-- 自定义面板 -->
          <Panel position="top-right" as="div">
            <div class="flow-info-panel">
              <el-tag>节点: {{ nodes.length }}</el-tag>
              <el-tag type="success">连线: {{ edges.length }}</el-tag>
            </div>
          </Panel>
        </VueFlow>
      </div>

      <!-- 右侧属性面板 -->
      <div class="props-panel">
        <div class="panel-header">
          <span>节点属性</span>
        </div>
        <div class="panel-body" v-if="selectedNode">
          <el-form :model="nodeConfig" label-width="80px" size="small">
            <el-form-item label="节点ID">
              <el-input v-model="nodeConfig.nodeId" disabled />
            </el-form-item>
            <el-form-item label="节点名称">
              <el-input v-model="nodeConfig.nodeName" />
            </el-form-item>
            <el-form-item label="节点类型">
              <el-tag :type="selectedNode.data.nodeType === 'start' ? 'success' :
                            selectedNode.data.nodeType === 'end' ? 'info' :
                            selectedNode.data.nodeType === 'user_task' ? 'primary' : 'warning'">
                {{ nodeTypes.find(n => n.type === selectedNode.data.nodeType)?.label }}
              </el-tag>
            </el-form-item>

            <!-- 用户审批节点配置 -->
            <template v-if="selectedNode.data.nodeType === 'user_task'">
              <el-divider content-position="left">审批配置</el-divider>
              <el-form-item label="审批类型">
                <el-select v-model="nodeConfig.assignType">
                  <el-option
                    v-for="item in assignTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="审批人" v-if="nodeConfig.assignType === 'user'">
                <el-select v-model="nodeConfig.assignValue" multiple filterable>
                  <el-option
                    v-for="user in assignOptions.filter(a => a.type === 'user')"
                    :key="user.id"
                    :label="user.name"
                    :value="user.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="审批角色" v-if="nodeConfig.assignType === 'role'">
                <el-select v-model="nodeConfig.assignValue" multiple>
                  <el-option
                    v-for="role in assignOptions.filter(a => a.type === 'role')"
                    :key="role.id"
                    :label="role.name"
                    :value="role.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="审批部门" v-if="nodeConfig.assignType === 'dept'">
                <el-tree-select
                  v-model="nodeConfig.assignValue"
                  :data="assignOptions.filter(a => a.type === 'dept')"
                  multiple
                />
              </el-form-item>
              <el-form-item label="超时时间">
                <el-input-number v-model="nodeConfig.timeout" :min="0" :max="72" />
                <span style="margin-left: 8px">小时</span>
              </el-form-item>
              <el-form-item label="自动审批">
                <el-switch v-model="nodeConfig.autoApprove" />
              </el-form-item>
              <el-form-item label="驳回动作">
                <el-select v-model="nodeConfig.rejectAction">
                  <el-option label="退回上一步" value="back" />
                  <el-option label="退回开始" value="restart" />
                  <el-option label="结束流程" value="end" />
                </el-select>
              </el-form-item>
            </template>

            <!-- 条件节点配置 -->
            <template v-if="selectedNode.data.nodeType === 'condition'">
              <el-divider content-position="left">条件配置</el-divider>
              <el-form-item label="条件表达式">
                <el-input
                  v-model="nodeConfig.conditionExpr"
                  type="textarea"
                  :rows="3"
                  placeholder="如: amount > 10000 && dept == '财务部'"
                />
              </el-form-item>
              <el-alert type="info" :closable="false">
                <template #title>表达式说明</template>
                支持表单字段变量，如: amount, dept, status
              </el-alert>
            </template>

            <!-- 操作按钮 -->
            <el-divider />
            <el-form-item>
              <el-button type="primary" @click="handleSaveNodeConfig">保存配置</el-button>
              <el-button type="danger" @click="handleDeleteNode(selectedNode)">删除节点</el-button>
            </el-form-item>
          </el-form>
        </div>
        <el-empty v-else description="请选择节点配置属性" />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog title="流程预览" v-model="previewVisible" width="90%" top="5vh">
      <div class="preview-flow">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          fit-on-init
          :interactive="false"
        />
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.flow-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%);

  .designer-header {
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

    .header-left {
      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper) {
        border-radius: 8px;
      }
    }

    .header-right {
      .el-button {
        border-radius: 8px;
        font-weight: 500;

        &:hover {
          transform: translateY(-1px);
        }
      }

      :deep(.el-button--primary) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
      }

      :deep(.el-button--success) {
        background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
        border: none;
      }
    }
  }

  .designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;

    .node-panel {
      width: 220px;
      background: #fff;
      border-right: 1px solid #e8e8e8;

      .panel-header {
        height: 48px;
        padding: 12px 20px;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        color: #303133;
        background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
      }

      .panel-body {
        padding: 20px 16px;

        .node-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .node-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border: 1px solid #e4e7ed;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #fff;

            &:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              border-color: transparent;
              background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);

              .el-icon {
                transform: scale(1.1);
              }
            }

            .el-icon {
              transition: transform 0.2s;
            }

            span {
              font-size: 14px;
              font-weight: 500;
              color: #303133;
            }
          }
        }
      }
    }

    .canvas-area {
      flex: 1;
      background: linear-gradient(180deg, #f5f7fa 0%, #e8eaed 100%);
      position: relative;

      .flow-info-panel {
        display: flex;
        gap: 8px;
        background: #fff;
        padding: 10px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

        .el-tag {
          border-radius: 12px;
        }
      }

      // Vue Flow 自定义节点样式
      .flow-node {
        padding: 12px 20px;
        border-radius: 12px;
        border: 2px solid;
        min-width: 180px;
        background: #fff;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .node-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 14px;

          .el-icon {
            font-size: 18px;
          }
        }

        .node-content {
          margin-top: 10px;
          font-size: 12px;

          .el-tag {
            border-radius: 12px;
          }
        }

        &.start {
          border-color: #67C23A;
          background: linear-gradient(135deg, #f0f9eb 0%, #fff 100%);

          .node-header {
            color: #67C23A;
          }
        }

        &.end {
          border-color: #909399;
          background: linear-gradient(135deg, #f4f4f5 0%, #fff 100%);

          .node-header {
            color: #909399;
          }
        }

        &.user_task {
          border-color: #409EFF;
          background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);

          .node-header {
            color: #409EFF;
          }
        }

        &.condition {
          border-color: #E6A23C;
          background: linear-gradient(135deg, #fdf6ec 0%, #fff 100%);
          transform: rotate(0deg);

          .node-header {
            color: #E6A23C;
          }
        }

        &.parallel {
          border-color: #909399;
          background: linear-gradient(135deg, #f4f4f5 0%, #fff 100%);

          .node-header {
            color: #909399;
          }
        }

        &.join {
          border-color: #F56C6C;
          background: linear-gradient(135deg, #fef0f0 0%, #fff 100%);

          .node-header {
            color: #F56C6C;
          }
        }
      }
    }

    .props-panel {
      width: 320px;
      background: #fff;
      border-left: 1px solid #e8e8e8;
      overflow: auto;

      .panel-header {
        height: 48px;
        padding: 12px 20px;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        color: #303133;
        background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
      }

      .panel-body {
        padding: 20px;

        :deep(.el-form-item) {
          margin-bottom: 18px;

          .el-form-item__label {
            font-weight: 500;
            color: #606266;
          }

          .el-input__wrapper,
          .el-select__wrapper {
            border-radius: 8px;
          }

          .el-input-number {
            :deep(.el-input__wrapper) {
              border-radius: 8px;
            }
          }
        }

        :deep(.el-divider) {
          margin: 24px 0 16px;

          .el-divider__text {
            font-weight: 500;
            color: #303133;
          }
        }

        :deep(.el-alert) {
          border-radius: 8px;
        }

        :deep(.el-tag) {
          border-radius: 12px;
        }
      }
    }
  }
}

.preview-flow {
  height: 70vh;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
}
</style>