<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { commandApi, Command, CommandLog } from '@/api'

// 命令列表
const commandList = ref<Command[]>([])
const commandTotal = ref(0)
const loading = ref(false)
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  commandName: '',
  commandCode: '',
  commandType: '',
  status: undefined as number | undefined
})

// 弹窗
const dialogVisible = ref(false)
const dialogTitle = ref('')
const commandForm = ref<Command>({
  id: 0,
  tenantId: '',
  commandName: '',
  commandCode: '',
  commandType: 'script',
  scriptContent: '',
  paramsSchema: '',
  scheduleType: 'manual',
  cronExpression: '',
  timeout: 300,
  retryCount: 0,
  status: 0,
  remark: ''
})

// 执行参数弹窗
const executeDialogVisible = ref(false)
const executeParams = ref('{}')
const currentCommandId = ref(0)
const executeResult = ref<CommandLog | null>(null)

// 执行日志弹窗
const logDialogVisible = ref(false)
const logList = ref<CommandLog[]>([])
const logLoading = ref(false)

// 安全检查结果
const securityCheckResult = ref<{ secure: boolean; errors: string[] } | null>(null)

// 命令类型选项
const commandTypeOptions = [
  { label: 'Groovy脚本', value: 'script' },
  { label: 'SQL脚本', value: 'sql' },
  { label: 'HTTP请求', value: 'http' }
]

// 触发类型选项
const scheduleTypeOptions = [
  { label: '手动执行', value: 'manual' },
  { label: '定时执行', value: 'cron' },
  { label: '事件触发', value: 'event' }
]

// 脚本模板
const scriptTemplates = ref<Record<string, string>>({})
const selectedTemplate = ref('')

// 获取命令列表
const getList = async () => {
  loading.value = true
  try {
    const res = await commandApi.list(query)
    commandList.value = res.data.list
    commandTotal.value = res.data.total
  } finally {
    loading.value = false
  }
}

// 新增
const handleAdd = () => {
  resetForm()
  dialogTitle.value = '新增命令'
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Command) => {
  resetForm()
  dialogTitle.value = '编辑命令'
  commandApi.get(row.id).then(res => {
    commandForm.value = res.data
    dialogVisible.value = true
  })
}

// 删除
const handleDelete = (row: Command) => {
  ElMessageBox.confirm(`确认删除命令 "${row.commandName}" 吗?`, '提示', {
    type: 'warning'
  }).then(() => {
    commandApi.delete(row.id).then(() => {
      ElMessage.success('删除成功')
      getList()
    })
  })
}

// 执行命令
const handleExecute = (row: Command) => {
  currentCommandId.value = row.id
  executeParams.value = '{}'
  executeResult.value = null
  executeDialogVisible.value = true
}

// 查看执行日志
const handleViewLogs = (row: Command) => {
  logDialogVisible.value = true
  logLoading.value = true
  commandApi.getLogs(row.id).then(res => {
    logList.value = res.data
    logLoading.value = false
  })
}

// 检查脚本安全
const handleCheckSecurity = async () => {
  if (!commandForm.value.scriptContent) {
    ElMessage.warning('请先输入脚本内容')
    return
  }
  try {
    const res = await commandApi.checkSecurity(commandForm.value.scriptContent)
    securityCheckResult.value = res.data
    if (res.data.secure) {
      ElMessage.success('脚本安全检查通过')
    } else {
      ElMessage.warning(`脚本存在安全问题: ${res.data.errors.join(', ')}`)
    }
  } catch (e) {
    console.error(e)
  }
}

// 使用模板
const handleUseTemplate = () => {
  if (selectedTemplate.value && scriptTemplates.value[selectedTemplate.value]) {
    commandForm.value.scriptContent = scriptTemplates.value[selectedTemplate.value]
    ElMessage.success('模板已应用')
  }
}

// 执行提交
const handleExecuteSubmit = async () => {
  try {
    const params = JSON.parse(executeParams.value)
    const res = await commandApi.execute(currentCommandId.value, params)
    executeResult.value = res.data
    if (res.data.status === 'success') {
      ElMessage.success('执行成功')
    } else {
      ElMessage.error(`执行失败: ${res.data.errorMessage}`)
    }
  } catch (e) {
    ElMessage.error('参数格式错误或执行异常')
    console.error(e)
  }
}

// 提交命令表单
const handleSubmit = async () => {
  try {
    if (commandForm.value.id) {
      await commandApi.update(commandForm.value)
      ElMessage.success('修改成功')
    } else {
      await commandApi.create(commandForm.value)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (e) {
    console.error(e)
  }
}

// 重置表单
const resetForm = () => {
  commandForm.value = {
    id: 0,
    tenantId: '',
    commandName: '',
    commandCode: '',
    commandType: 'script',
    scriptContent: '',
    paramsSchema: '',
    scheduleType: 'manual',
    cronExpression: '',
    timeout: 300,
    retryCount: 0,
    status: 0,
    remark: ''
  }
  securityCheckResult.value = null
}

// 分页
const handlePageChange = (page: number) => {
  query.pageNum = page
  getList()
}

// 加载脚本模板
const loadTemplates = async () => {
  try {
    const res = await commandApi.getTemplates()
    scriptTemplates.value = res.data
  } catch (e) {
    console.error(e)
  }
}

// 状态格式化
const statusFormat = (status: string) => {
  const map: Record<string, { label: string; type: string }> = {
    running: { label: '执行中', type: 'warning' },
    success: { label: '成功', type: 'success' },
    failed: { label: '失败', type: 'danger' }
  }
  return map[status] || { label: status, type: 'info' }
}

// 格式化时间
const formatDuration = (duration: number) => {
  if (duration < 1000) return `${duration}ms`
  return `${(duration / 1000).toFixed(2)}s`
}

onMounted(() => {
  getList()
  loadTemplates()
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true">
        <el-form-item label="命令名称">
          <el-input v-model="query.commandName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="命令编码">
          <el-input v-model="query.commandCode" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="命令类型">
          <el-select v-model="query.commandType" placeholder="请选择" clearable>
            <el-option v-for="item in commandTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList">搜索</el-button>
          <el-button @click="query.commandName = ''; query.commandCode = ''; query.commandType = ''; getList()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>命令管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增
          </el-button>
        </div>
      </template>

      <el-table :data="commandList" v-loading="loading" stripe>
        <el-table-column prop="commandName" label="命令名称" width="150" />
        <el-table-column prop="commandCode" label="命令编码" width="150" />
        <el-table-column prop="commandType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.commandType === 'script' ? 'success' : 'info'">
              {{ commandTypeOptions.find(t => t.value === row.commandType)?.label || row.commandType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="scheduleType" label="触发类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.scheduleType === 'manual' ? 'info' : 'warning'">
              {{ scheduleTypeOptions.find(t => t.value === row.scheduleType)?.label || row.scheduleType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeout" label="超时(秒)" width="80" />
        <el-table-column prop="retryCount" label="重试次数" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">
              {{ row.status === 0 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="success" @click="handleExecute(row)">执行</el-button>
            <el-button link type="info" @click="handleViewLogs(row)">日志</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        :current-page="query.pageNum"
        :page-size="query.pageSize"
        :total="commandTotal"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="800px" top="5vh">
      <el-form :model="commandForm" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="命令名称" required>
              <el-input v-model="commandForm.commandName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="命令编码" required>
              <el-input v-model="commandForm.commandCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="命令类型">
              <el-select v-model="commandForm.commandType">
                <el-option v-for="item in commandTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="触发类型">
              <el-select v-model="commandForm.scheduleType">
                <el-option v-for="item in scheduleTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="commandForm.scheduleType === 'cron'">
          <el-col :span="12">
            <el-form-item label="定时表达式">
              <el-input v-model="commandForm.cronExpression" placeholder="如: 0 0 2 * * ? (每天2点)" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="超时时间">
              <el-input-number v-model="commandForm.timeout" :min="1" :max="3600" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="重试次数">
              <el-input-number v-model="commandForm.retryCount" :min="0" :max="5" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态">
              <el-radio-group v-model="commandForm.status">
                <el-radio :value="0">正常</el-radio>
                <el-radio :value="1">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 脚本编辑 -->
        <el-form-item label="脚本内容" v-if="commandForm.commandType === 'script'">
          <div class="script-editor-wrapper">
            <div class="template-bar">
              <el-select v-model="selectedTemplate" placeholder="选择模板" size="small" style="width: 150px">
                <el-option v-for="key in Object.keys(scriptTemplates)" :key="key" :label="key" :value="key" />
              </el-select>
              <el-button size="small" @click="handleUseTemplate">应用模板</el-button>
              <el-button size="small" type="warning" @click="handleCheckSecurity">安全检查</el-button>
            </div>
            <el-input
              v-model="commandForm.scriptContent"
              type="textarea"
              :rows="12"
              placeholder="输入Groovy脚本内容..."
            />
            <div class="security-result" v-if="securityCheckResult">
              <el-alert
                v-if="securityCheckResult.secure"
                type="success"
                title="安全检查通过"
                :closable="false"
                show-icon
              />
              <el-alert
                v-else
                type="warning"
                title="存在安全问题"
                :closable="false"
                show-icon
              >
                <template #default>
                  <ul>
                    <li v-for="error in securityCheckResult.errors" :key="error">{{ error }}</li>
                  </ul>
                </template>
              </el-alert>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="commandForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 执行弹窗 -->
    <el-dialog title="执行命令" v-model="executeDialogVisible" width="600px">
      <el-form label-width="80px">
        <el-form-item label="执行参数">
          <el-input
            v-model="executeParams"
            type="textarea"
            :rows="5"
            placeholder='输入JSON格式参数，如: {"tenantId": "000000", "days": 30}'
          />
        </el-form-item>
        <el-form-item label="执行结果" v-if="executeResult">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="状态">
              <el-tag :type="statusFormat(executeResult.status).type">
                {{ statusFormat(executeResult.status).label }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="耗时">{{ formatDuration(executeResult.duration) }}</el-descriptions-item>
            <el-descriptions-item label="结果" :span="2">
              <pre class="result-code">{{ executeResult.result || executeResult.errorMessage }}</pre>
            </el-descriptions-item>
          </el-descriptions>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="executeDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExecuteSubmit">执行</el-button>
      </template>
    </el-dialog>

    <!-- 执行日志弹窗 -->
    <el-dialog title="执行日志" v-model="logDialogVisible" width="800px">
      <el-table :data="logList" v-loading="logLoading" stripe max-height="400">
        <el-table-column prop="triggerType" label="触发类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.triggerType === 'manual' ? 'info' : 'warning'">{{ row.triggerType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180" />
        <el-table-column prop="endTime" label="结束时间" width="180" />
        <el-table-column prop="duration" label="耗时" width="80">
          <template #default="{ row }">{{ formatDuration(row.duration) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="statusFormat(row.status).type">{{ statusFormat(row.status).label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="结果">
          <template #default="{ row }">
            <el-text truncated>{{ row.result || row.errorMessage }}</el-text>
          </template>
        </el-table-column>
      </el-table>
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

  .script-editor-wrapper {
    .template-bar {
      margin-bottom: 8px;
      display: flex;
      gap: 8px;
    }

    .security-result {
      margin-top: 8px;
    }
  }

  .result-code {
    background: #f5f5f5;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    max-height: 200px;
    overflow: auto;
  }
}
</style>