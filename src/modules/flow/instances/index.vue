<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { flowApi, FlowInstance } from '@/api'

const router = useRouter()

// 流程实例列表
const instanceList = ref<FlowInstance[]>([])
const instanceTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  flowDefinitionId: undefined as number | undefined,
  flowName: '',
  initiator: '',
  status: undefined as string | undefined
})

// 流程定义列表
const flowDefList = ref<any[]>([])

// 详情弹窗
const detailVisible = ref(false)
const currentInstance = ref<FlowInstance | null>(null)
const instanceNodes = ref<any[]>([])

// 状态映射
const statusMap: Record<string, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  running: { label: '进行中', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  cancelled: { label: '已取消', type: 'info' }
}

// 获取实例列表
const getList = async () => {
  loading.value = true
  try {
    const res = await flowApi.getInstances(query)
    instanceList.value = res.data.list
    instanceTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 获取流程定义列表
const getFlowDefList = async () => {
  try {
    const res = await flowApi.list({ pageNum: 1, pageSize: 100, status: 1 })
    flowDefList.value = res.data.list
  } catch (e) {
    console.error(e)
  }
}

// 查看详情
const handleDetail = (row: FlowInstance) => {
  currentInstance.value = row
  flowApi.getInstanceDetail(row.id).then(res => {
    instanceNodes.value = res.data.nodes || []
    detailVisible.value = true
  })
}

// 查看表单数据
const handleViewForm = (row: FlowInstance) => {
  router.push(`/flow/form-data/${row.id}`)
}

// 查看任务
const handleViewTasks = (row: FlowInstance) => {
  router.push(`/flow/tasks/${row.id}`)
}

// 取消流程
const handleCancel = (row: FlowInstance) => {
  if (row.status !== 'running') {
    ElMessage.warning('只有进行中的流程可以取消')
    return
  }
  ElMessageBox.confirm('确认取消该流程吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    await flowApi.cancelInstance(row.id)
    ElMessage.success('取消成功')
    getList()
  })
}

// 分页
const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

onMounted(() => {
  getList()
  getFlowDefList()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="流程名称">
          <el-select v-model="query.flowDefinitionId" placeholder="请选择" clearable filterable>
            <el-option
              v-for="flow in flowDefList"
              :key="flow.id"
              :label="flow.flowName"
              :value="flow.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发起人">
          <el-input v-model="query.initiator" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="请选择" clearable>
            <el-option label="进行中" value="running" />
            <el-option label="已完成" value="completed" />
            <el-option label="已驳回" value="rejected" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="query.flowDefinitionId = undefined; query.initiator = ''; query.status = undefined; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程实例</span>
        </div>
      </template>

      <el-table :data="instanceList" v-loading="loading" stripe>
        <el-table-column prop="flowName" label="流程名称" width="150" />
        <el-table-column prop="flowCode" label="流程编码" width="120" />
        <el-table-column prop="initiator" label="发起人" width="100" />
        <el-table-column prop="currentNode" label="当前节点" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="发起时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="duration" label="耗时" width="80">
          <template #default="{ row }">
            {{ row.duration ? `${row.duration}秒` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleDetail(row)">详情</el-button>
            <el-button link type="primary" @click="handleViewForm(row)">表单</el-button>
            <el-button link type="info" @click="handleViewTasks(row)">任务</el-button>
            <el-button link type="danger" @click="handleCancel(row)" v-if="row.status === 'running'">取消</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="instanceTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog title="流程实例详情" v-model="detailVisible" width="800px">
      <el-descriptions :column="2" border v-if="currentInstance">
        <el-descriptions-item label="流程名称">{{ currentInstance.flowName }}</el-descriptions-item>
        <el-descriptions-item label="流程编码">{{ currentInstance.flowCode }}</el-descriptions-item>
        <el-descriptions-item label="发起人">{{ currentInstance.initiator }}</el-descriptions-item>
        <el-descriptions-item label="当前节点">{{ currentInstance.currentNode }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusMap[currentInstance.status]?.type">
            {{ statusMap[currentInstance.status]?.label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="发起时间">{{ currentInstance.startTime }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ currentInstance.endTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="耗时">{{ currentInstance.duration ? `${currentInstance.duration}秒` : '-' }}</el-descriptions-item>
      </el-descriptions>

      <!-- 流程进度 -->
      <div class="flow-progress" v-if="instanceNodes.length > 0">
        <el-divider content-position="left">审批进度</el-divider>
        <el-timeline>
          <el-timeline-item
            v-for="node in instanceNodes"
            :key="node.id"
            :type="node.status === 'completed' ? 'success' :
                   node.status === 'running' ? 'warning' :
                   node.status === 'rejected' ? 'danger' : 'info'"
            :timestamp="node.actionTime"
          >
            <div class="timeline-content">
              <div class="node-name">{{ node.nodeName }}</div>
              <div class="node-info">
                <el-tag size="small" :type="node.status === 'completed' ? 'success' :
                              node.status === 'running' ? 'warning' : 'info'">
                  {{ node.status === 'completed' ? '已通过' :
                    node.status === 'running' ? '待审批' :
                    node.status === 'rejected' ? '已驳回' : '待处理' }}
                </el-tag>
                <span class="assignee" v-if="node.assignee">审批人: {{ node.assignee }}</span>
                <span class="comment" v-if="node.comment">意见: {{ node.comment }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .search-card { margin-bottom: 16px; }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .flow-progress {
    .timeline-content {
      .node-name {
        font-weight: 500;
        margin-bottom: 8px;
      }

      .node-info {
        display: flex;
        gap: 12px;
        align-items: center;
        font-size: 12px;

        .assignee {
          color: #909399;
        }

        .comment {
          color: #606266;
        }
      }
    }
  }
}
</style>