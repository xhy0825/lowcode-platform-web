<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { flowApi, FlowTask } from '@/api'

const router = useRouter()

// 待办任务列表
const taskList = ref<FlowTask[]>([])
const taskTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  flowName: '',
  taskType: 'pending' // pending | done | all
})

// 处理弹窗
const handleVisible = ref(false)
const currentTask = ref<FlowTask | null>(null)
const handleForm = ref({
  action: 'approve', // approve | reject | delegate
  comment: '',
  delegateUser: ''
})

// 表单数据弹窗
const formDataVisible = ref(false)
const formData = ref<Record<string, any>>({})

// 状态映射
const actionMap: Record<string, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  approve: { label: '同意', type: 'success' },
  reject: { label: '驳回', type: 'danger' },
  delegate: { label: '转办', type: 'warning' },
  cancel: { label: '撤销', type: 'info' }
}

const statusMap: Record<string, { label: string; type: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  pending: { label: '待处理', type: 'warning' },
  approved: { label: '已同意', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  delegated: { label: '已转办', type: 'info' }
}

// 获取任务列表
const getList = async () => {
  loading.value = true
  try {
    const res = await flowApi.getTasks(query)
    taskList.value = res.data.list
    taskTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 处理任务
const handleTask = (row: FlowTask) => {
  currentTask.value = row
  handleForm.value = {
    action: 'approve',
    comment: '',
    delegateUser: ''
  }
  handleVisible.value = true
}

// 查看表单
const viewForm = (row: FlowTask) => {
  flowApi.getFormData(row.instanceId).then(res => {
    formData.value = res.data
    formDataVisible.value = true
  })
}

// 提交处理
const submitHandle = async () => {
  if (!currentTask.value) return

  if (!handleForm.value.comment && handleForm.value.action !== 'approve') {
    ElMessage.warning('请填写审批意见')
    return
  }

  if (handleForm.value.action === 'delegate' && !handleForm.value.delegateUser) {
    ElMessage.warning('请选择转办人员')
    return
  }

  try {
    await flowApi.handleTask(currentTask.value.id, {
      action: handleForm.value.action,
      comment: handleForm.value.comment,
      delegateUser: handleForm.value.delegateUser
    })
    ElMessage.success('处理成功')
    handleVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
    ElMessage.error('处理失败')
  }
}

// 批量审批
const batchApprove = async () => {
  const selectedTasks = taskList.value.filter(t => t.status === 'pending')
  if (selectedTasks.length === 0) {
    ElMessage.warning('没有待处理的任务')
    return
  }
  ElMessageBox.confirm(`确认批量同意 ${selectedTasks.length} 个任务吗？`, '批量审批', {
    type: 'warning'
  }).then(async () => {
    try {
      await flowApi.batchApprove(selectedTasks.map(t => t.id))
      ElMessage.success('批量审批成功')
      getList()
    } catch (e) {
      console.error(e)
    }
  })
}

// 切换任务类型
const switchTaskType = (type: string) => {
  query.taskType = type
  query.pageNum = 1
  getList()
}

// 分页
const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 标签切换 -->
    <el-card class="tabs-card">
      <el-radio-group v-model="query.taskType" @change="getList">
        <el-radio-button value="pending">
          <el-icon><Bell /></el-icon>
          待办任务
        </el-radio-button>
        <el-radio-button value="done">
          <el-icon><Select /></el-icon>
          已办任务
        </el-radio-button>
        <el-radio-button value="all">
          <el-icon><List /></el-icon>
          全部任务
        </el-radio-button>
      </el-radio-group>

      <el-input
        v-model="query.flowName"
        placeholder="流程名称"
        clearable
        style="width: 200px; margin-left: 16px"
      />
      <el-button type="primary" @click="getList">搜索</el-button>
      <el-button type="success" @click="batchApprove" v-if="query.taskType === 'pending'">
        <el-icon><Finished /></el-icon>
        批量审批
      </el-button>
    </el-card>

    <!-- 任务列表 -->
    <el-card>
      <el-table :data="taskList" v-loading="loading" stripe>
        <el-table-column prop="flowName" label="流程名称" width="150" />
        <el-table-column prop="nodeName" label="任务节点" width="100" />
        <el-table-column prop="initiator" label="发起人" width="80" />
        <el-table-column prop="assignee" label="当前处理人" width="80" />
        <el-table-column prop="createTime" label="任务时间" width="180" />
        <el-table-column prop="deadline" label="截止时间" width="180">
          <template #default="{ row }">
            <span :class="{ 'deadline-warning': row.isOverdue }">
              {{ row.deadline || '-' }}
              <el-tag size="small" type="danger" v-if="row.isOverdue">超时</el-tag>
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="处理结果" width="80">
          <template #default="{ row }">
            <el-tag :type="actionMap[row.action]?.type || 'info'" v-if="row.action">
              {{ actionMap[row.action]?.label || row.action }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="审批意见" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleTask(row)" v-if="row.status === 'pending'">处理</el-button>
            <el-button link type="primary" @click="viewForm(row)">表单</el-button>
            <el-button link type="info" @click="router.push(`/flow/instance/${row.instanceId}`)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="taskTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 处理弹窗 -->
    <el-dialog title="审批处理" v-model="handleVisible" width="500px">
      <el-form :model="handleForm" label-width="80px" v-if="currentTask">
        <el-form-item label="任务信息">
          <el-descriptions :column="2" size="small">
            <el-descriptions-item label="流程">{{ currentTask.flowName }}</el-descriptions-item>
            <el-descriptions-item label="节点">{{ currentTask.nodeName }}</el-descriptions-item>
            <el-descriptions-item label="发起人">{{ currentTask.initiator }}</el-descriptions-item>
            <el-descriptions-item label="发起时间">{{ currentTask.createTime }}</el-descriptions-item>
          </el-descriptions>
        </el-form-item>

        <el-divider />

        <el-form-item label="处理方式">
          <el-radio-group v-model="handleForm.action">
            <el-radio value="approve">
              <el-icon><Select /></el-icon>
              同意
            </el-radio>
            <el-radio value="reject">
              <el-icon><Close /></el-icon>
              驳回
            </el-radio>
            <el-radio value="delegate">
              <el-icon><UserFilled /></el-icon>
              转办
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审批意见" v-if="handleForm.action !== 'approve'">
          <el-input
            v-model="handleForm.comment"
            type="textarea"
            :rows="3"
            placeholder="请填写审批意见"
          />
        </el-form-item>

        <el-form-item label="转办人员" v-if="handleForm.action === 'delegate'">
          <el-select v-model="handleForm.delegateUser" filterable placeholder="选择转办人员">
            <el-option label="用户1" value="user1" />
            <el-option label="用户2" value="user2" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleVisible = false">取消</el-button>
        <el-button type="primary" @click="submitHandle">确定</el-button>
      </template>
    </el-dialog>

    <!-- 表单数据弹窗 -->
    <el-dialog title="表单详情" v-model="formDataVisible" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item
          v-for="(value, key) in formData"
          :key="key"
          :label="key"
        >
          {{ value }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .tabs-card {
    margin-bottom: 16px;

    :deep(.el-radio-button__inner) {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }

  .deadline-warning {
    color: #F56C6C;
  }
}
</style>