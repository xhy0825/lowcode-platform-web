import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// 统一响应格式
const success = (data) => ({ code: 200, msg: 'success', data, timestamp: Date.now() })
const fail = (msg) => ({ code: 500, msg, data: null, timestamp: Date.now() })

// 模拟数据存储
const mockData = {
  users: [
    { id: 1, username: 'admin', realName: '管理员', email: 'admin@test.com', phone: '13800000001', status: 0, deptId: 1, roles: ['admin'], createdTime: '2024-01-01' },
    { id: 2, username: 'user1', realName: '张三', email: 'user1@test.com', phone: '13800000002', status: 0, deptId: 2, roles: ['user'], createdTime: '2024-01-02' }
  ],
  roles: [
    { id: 1, roleName: '管理员', roleCode: 'admin', dataScope: 'all', status: 0, remark: '系统管理员', createdTime: '2024-01-01' },
    { id: 2, roleName: '普通用户', roleCode: 'user', dataScope: 'self', status: 0, remark: '普通用户', createdTime: '2024-01-01' }
  ],
  permissions: [
    { id: 1, permissionName: '系统管理', permissionCode: 'system', permissionType: 'menu', path: '/system', icon: 'Setting', children: [
      { id: 2, permissionName: '用户管理', permissionCode: 'system:user', permissionType: 'menu', path: '/system/user' },
      { id: 3, permissionName: '角色管理', permissionCode: 'system:role', permissionType: 'menu', path: '/system/role' }
    ]},
    { id: 10, permissionName: '数据引擎', permissionCode: 'data', permissionType: 'menu', path: '/data', icon: 'DataAnalysis', children: [
      { id: 11, permissionName: '数据模型', permissionCode: 'data:model', permissionType: 'menu', path: '/data/model' }
    ]}
  ],
  dictTypes: [
    { id: 1, dictType: 'sys_normal_disable', dictName: '正常禁用', status: 0, remark: '系统状态' }
  ],
  dictData: {
    'sys_normal_disable': [
      { id: 1, dictType: 'sys_normal_disable', dictLabel: '正常', dictValue: '0', dictSort: 1, isDefault: 1, status: 0 },
      { id: 2, dictType: 'sys_normal_disable', dictLabel: '禁用', dictValue: '1', dictSort: 2, isDefault: 0, status: 0 }
    ]
  },
  commands: [
    { id: 1, commandName: '数据清理', commandCode: 'data_clean', commandType: 'script', scriptContent: 'println "clean data"', scheduleType: 'manual', timeout: 300, retryCount: 0, status: 0, remark: '清理过期数据' }
  ],
  forms: [
    { id: 1, formName: '请假申请表', formCode: 'leave_form', modelId: 1, status: 1, version: 1, createdTime: '2024-01-01' },
    { id: 2, formName: '报销申请表', formCode: 'expense_form', modelId: 2, status: 1, version: 1, createdTime: '2024-01-02' }
  ],
  formFields: {
    1: [
      { fieldCode: 'leave_type', fieldName: '请假类型', widgetType: 'select', placeholder: '请选择', isRequired: 1, colSpan: 6, dictType: 'leave_type' },
      { fieldCode: 'leave_days', fieldName: '请假天数', widgetType: 'number', placeholder: '请输入', isRequired: 1, colSpan: 6 },
      { fieldCode: 'leave_reason', fieldName: '请假原因', widgetType: 'textarea', placeholder: '请输入', isRequired: 1, colSpan: 12 },
      { fieldCode: 'start_date', fieldName: '开始日期', widgetType: 'date', placeholder: '请选择', isRequired: 1, colSpan: 6 },
      { fieldCode: 'end_date', fieldName: '结束日期', widgetType: 'date', placeholder: '请选择', isRequired: 1, colSpan: 6 }
    ]
  },
  flows: [
    { id: 1, flowName: '请假审批流程', flowCode: 'leave_flow', formId: 1, status: 1, version: 1, nodes: '[{"nodeId":"n1","nodeType":"start","nodeName":"开始"},{"nodeId":"n2","nodeType":"user_task","nodeName":"部门审批"},{"nodeId":"n3","nodeType":"end","nodeName":"结束"}]', edges: '[{"source":"n1","target":"n2"},{"source":"n2","target":"n3"}]', createdTime: '2024-01-01' }
  ],
  flowInstances: [
    { id: 1, flowDefinitionId: 1, flowName: '请假审批流程', flowCode: 'leave_flow', initiator: '张三', currentNode: '部门审批', status: 'running', startTime: '2024-01-10 10:00:00' }
  ],
  flowTasks: [
    { id: 1, instanceId: 1, nodeId: 'n2', nodeName: '部门审批', flowName: '请假审批流程', initiator: '张三', assignee: '李四', status: 'pending', createTime: '2024-01-10 10:00:00' }
  ],
  models: [
    { id: 1, modelName: '请假申请模型', modelCode: 'leave_model', tableName: 'tb_leave', status: 1, createdTime: '2024-01-01' },
    { id: 2, modelName: '报销申请模型', modelCode: 'expense_model', tableName: 'tb_expense', status: 1, createdTime: '2024-01-02' }
  ],
  pages: [
    { id: 1, pageName: '请假列表页', pageCode: 'leave_list', pageType: 'list', modelId: 1, status: 1, createdTime: '2024-01-01' }
  ],
  reports: [
    { id: 1, reportName: '请假统计', reportCode: 'leave_stats', reportType: 'bar', dataSource: 'model', status: 1, createdTime: '2024-01-01' }
  ],
  configs: [
    { id: 1, configKey: 'sys.upload.maxSize', configValue: '10MB', configType: 'upload', remark: '上传文件大小限制' }
  ],
  tenants: [
    { id: 1, tenantName: '默认租户', tenantCode: 'default', packageId: 1, expireTime: '2099-12-31', dbSchema: 'tenant_default', status: 0 }
  ]
}

// ==================== 认证接口 ====================
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'admin123') {
    res.json(success({
      token: 'mock_token_' + Date.now(),
      user: mockData.users[0],
      permissions: ['system:user', 'system:role', 'data:model', 'form:list', 'flow:list']
    }))
  } else {
    res.json(fail('用户名或密码错误'))
  }
})

app.post('/auth/logout', (req, res) => res.json(success()))
app.get('/auth/info', (req, res) => res.json(success({ user: mockData.users[0], permissions: mockData.permissions })))

// ==================== 用户管理 ====================
app.get('/system/user/list', (req, res) => {
  const { pageNum = 1, pageSize = 10 } = req.query
  res.json(success({ total: mockData.users.length, pageNum, pageSize, list: mockData.users }))
})

app.get('/system/user/:id', (req, res) => {
  const user = mockData.users.find(u => u.id == req.params.id)
  res.json(success(user || null))
})

app.post('/system/user', (req, res) => {
  const id = mockData.users.length + 1
  mockData.users.push({ ...req.body, id, createdTime: new Date().toISOString() })
  res.json(success())
})

app.put('/system/user', (req, res) => res.json(success()))
app.delete('/system/user/:id', (req, res) => res.json(success()))
app.put('/system/user/:id/password', (req, res) => res.json(success()))
app.put('/system/user/:id/status', (req, res) => res.json(success()))

// ==================== 角色管理 ====================
app.get('/system/role/list', (req, res) => {
  res.json(success({ total: mockData.roles.length, pageNum: 1, pageSize: 10, list: mockData.roles }))
})

app.get('/system/role/:id', (req, res) => {
  const role = mockData.roles.find(r => r.id == req.params.id)
  res.json(success(role || null))
})

app.post('/system/role', (req, res) => res.json(success(1)))
app.put('/system/role', (req, res) => res.json(success()))
app.delete('/system/role/:id', (req, res) => res.json(success()))
app.get('/system/role/:id/permissions', (req, res) => res.json(success([1, 2, 3])))
app.put('/system/role/:id/permissions', (req, res) => res.json(success()))
app.put('/system/role/:id/data-scope', (req, res) => res.json(success()))

// ==================== 权限管理 ====================
app.get('/system/permission/list', (req, res) => res.json(success(mockData.permissions)))
app.get('/system/permission/tree', (req, res) => res.json(success(mockData.permissions)))

// ==================== 数据字典 ====================
app.get('/system/dict/types', (req, res) => {
  res.json(success({ total: mockData.dictTypes.length, pageNum: 1, pageSize: 10, list: mockData.dictTypes }))
})

app.get('/system/dict/data/:dictType', (req, res) => {
  const data = mockData.dictData[req.params.dictType] || []
  res.json(success(data))
})

app.post('/system/dict/type', (req, res) => res.json(success()))
app.put('/system/dict/type', (req, res) => res.json(success()))
app.delete('/system/dict/type/:id', (req, res) => res.json(success()))
app.post('/system/dict/data', (req, res) => res.json(success()))
app.put('/system/dict/data', (req, res) => res.json(success()))
app.delete('/system/dict/data/:id', (req, res) => res.json(success()))
app.post('/system/dict/cache/refresh/:dictType', (req, res) => res.json(success()))

// ==================== 命令管理 ====================
app.get('/system/command/list', (req, res) => {
  res.json(success({ total: mockData.commands.length, pageNum: 1, pageSize: 10, list: mockData.commands }))
})

app.get('/system/command/:id', (req, res) => {
  const cmd = mockData.commands.find(c => c.id == req.params.id)
  res.json(success(cmd || null))
})

app.post('/system/command', (req, res) => res.json(success(1)))
app.put('/system/command', (req, res) => res.json(success()))
app.delete('/system/command/:id', (req, res) => res.json(success()))
app.post('/system/command/:id/execute', (req, res) => {
  res.json(success({ id: 1, status: 'success', duration: 150, result: '执行成功' }))
})
app.get('/system/command/:id/logs', (req, res) => res.json(success([])))
app.post('/system/command/check-security', (req, res) => res.json(success({ secure: true, errors: [] })))
app.get('/system/command/templates', (req, res) => res.json(success({ '数据清理': 'println "clean"', '数据导出': 'println "export"' })))

// ==================== 系统配置 ====================
app.get('/system/config/list', (req, res) => {
  res.json(success({ total: mockData.configs.length, pageNum: 1, pageSize: 10, list: mockData.configs }))
})
app.get('/system/config/:id', (req, res) => res.json(success(mockData.configs[0])))
app.post('/system/config', (req, res) => res.json(success()))
app.put('/system/config', (req, res) => res.json(success()))
app.delete('/system/config/:id', (req, res) => res.json(success()))

// ==================== 租户管理 ====================
app.get('/system/tenant/list', (req, res) => {
  res.json(success({ total: mockData.tenants.length, pageNum: 1, pageSize: 10, list: mockData.tenants }))
})
app.get('/system/tenant/:id', (req, res) => res.json(success(mockData.tenants[0])))
app.post('/system/tenant', (req, res) => res.json(success()))
app.put('/system/tenant', (req, res) => res.json(success()))
app.delete('/system/tenant/:id', (req, res) => res.json(success()))

// ==================== 数据模型 ====================
app.get('/data/model/list', (req, res) => {
  res.json(success({ total: mockData.models.length, pageNum: 1, pageSize: 10, list: mockData.models }))
})

app.get('/data/model/:id', (req, res) => {
  const model = mockData.models.find(m => m.id == req.params.id)
  res.json(success(model || null))
})

app.post('/data/model', (req, res) => res.json(success(mockData.models.length + 1)))
app.put('/data/model', (req, res) => res.json(success()))
app.delete('/data/model/:id', (req, res) => res.json(success()))
app.post('/data/model/:id/generate', (req, res) => res.json(success('CREATE TABLE tb_xxx (id INT PRIMARY KEY);')))
app.post('/data/model/:id/execute', (req, res) => res.json(success()))
app.get('/data/model/:id/fields', (req, res) => res.json(success([])))
app.put('/data/model/:id/fields', (req, res) => res.json(success()))
app.get('/data/table/list', (req, res) => res.json(success([])))

// ==================== 表单管理 ====================
app.get('/form/list', (req, res) => {
  res.json(success({ total: mockData.forms.length, pageNum: 1, pageSize: 10, list: mockData.forms }))
})

app.get('/form/:id', (req, res) => {
  const form = mockData.forms.find(f => f.id == req.params.id)
  res.json(success(form || null))
})

app.post('/form', (req, res) => res.json(success(mockData.forms.length + 1)))
app.put('/form', (req, res) => res.json(success()))
app.delete('/form/:id', (req, res) => res.json(success()))
app.post('/form/:id/publish', (req, res) => res.json(success()))
app.get('/form/:id/fields', (req, res) => {
  const fields = mockData.formFields[req.params.id] || []
  res.json(success(fields))
})
app.put('/form/:id/fields', (req, res) => res.json(success()))
app.post('/form/:id/data', (req, res) => res.json(success(1)))
app.get('/form/:id/data', (req, res) => res.json(success({ total: 0, list: [] })))

// ==================== 流程管理 ====================
app.get('/flow/list', (req, res) => {
  res.json(success({ total: mockData.flows.length, pageNum: 1, pageSize: 10, list: mockData.flows.map(f => ({
    ...f,
    nodes: JSON.parse(f.nodes),
    edges: JSON.parse(f.edges)
  })) }))
})

app.get('/flow/:id', (req, res) => {
  const flow = mockData.flows.find(f => f.id == req.params.id)
  if (flow) {
    res.json(success({ ...flow, nodes: JSON.parse(flow.nodes), edges: JSON.parse(flow.edges) }))
  } else {
    res.json(success(null))
  }
})

app.post('/flow', (req, res) => res.json(success(mockData.flows.length + 1)))
app.put('/flow', (req, res) => res.json(success()))
app.delete('/flow/:id', (req, res) => res.json(success()))
app.post('/flow/:id/publish', (req, res) => res.json(success()))
app.get('/flow/forms', (req, res) => res.json(success(mockData.forms)))
app.get('/flow/assign-options', (req, res) => res.json(success([
  { type: 'user', id: 'admin', name: '管理员' },
  { type: 'role', id: 'admin', name: '管理员角色' }
])))

// 流程实例
app.get('/flow/instances', (req, res) => {
  res.json(success({ total: mockData.flowInstances.length, pageNum: 1, pageSize: 10, list: mockData.flowInstances }))
})

app.get('/flow/instance/:id', (req, res) => {
  res.json(success({ nodes: mockData.flowTasks.filter(t => t.instanceId == req.params.id) }))
})

app.post('/flow/instance/:id/cancel', (req, res) => res.json(success()))
app.post('/flow/start', (req, res) => res.json(success(mockData.flowInstances.length + 1)))
app.get('/flow/instance/:instanceId/form-data', (req, res) => res.json(success({ leave_type: '年假', leave_days: 3, leave_reason: '回家探亲' })))

// 流程任务
app.get('/flow/tasks', (req, res) => {
  res.json(success({ total: mockData.flowTasks.length, pageNum: 1, pageSize: 10, list: mockData.flowTasks }))
})

app.post('/flow/task/:id/handle', (req, res) => res.json(success()))
app.post('/flow/task/batch-approve', (req, res) => res.json(success()))
app.get('/flow/task/pending-count', (req, res) => res.json(success(mockData.flowTasks.filter(t => t.status === 'pending').length)))

// ==================== 页面管理 ====================
app.get('/page/list', (req, res) => {
  res.json(success({ total: mockData.pages.length, pageNum: 1, pageSize: 10, list: mockData.pages }))
})
app.get('/page/:id', (req, res) => res.json(success(mockData.pages[0])))
app.post('/page', (req, res) => res.json(success(1)))
app.put('/page', (req, res) => res.json(success()))
app.delete('/page/:id', (req, res) => res.json(success()))

// ==================== 报表管理 ====================
app.get('/report/list', (req, res) => {
  res.json(success({ total: mockData.reports.length, pageNum: 1, pageSize: 10, list: mockData.reports }))
})
app.get('/report/:id', (req, res) => res.json(success(mockData.reports[0])))
app.post('/report', (req, res) => res.json(success(1)))
app.put('/report', (req, res) => res.json(success()))
app.delete('/report/:id', (req, res) => res.json(success()))

// ==================== 仪表盘数据 ====================
app.get('/dashboard/stats', (req, res) => {
  res.json(success({
    formCount: 12,
    flowCount: 8,
    pageCount: 6,
    reportCount: 4,
    pendingTasks: 5,
    todayInstances: 3,
    weeklyStats: [
      { day: '周一', instances: 5, tasks: 12 },
      { day: '周二', instances: 8, tasks: 15 },
      { day: '周三', instances: 6, tasks: 10 },
      { day: '周四', instances: 12, tasks: 20 },
      { day: '周五', instances: 15, tasks: 25 },
      { day: '周六', instances: 3, tasks: 5 },
      { day: '周日', instances: 2, tasks: 3 }
    ]
  }))
})

// ==================== 表单数据查询 ====================
app.get('/form/:id/data/list', (req, res) => {
  const formDataList = [
    { id: 1, leave_type: '年假', leave_days: 3, leave_reason: '回家探亲', applicant: '张三', status: '已批准', createdTime: '2024-01-10' },
    { id: 2, leave_type: '病假', leave_days: 1, leave_reason: '身体不适', applicant: '李四', status: '审批中', createdTime: '2024-01-12' },
    { id: 3, leave_type: '事假', leave_days: 2, leave_reason: '家庭事务', applicant: '王五', status: '已批准', createdTime: '2024-01-15' }
  ]
  res.json(success({ total: formDataList.length, pageNum: 1, pageSize: 10, list: formDataList }))
})

// ==================== 字段数据 ====================
app.get('/form/:id/fields', (req, res) => {
  const id = parseInt(req.params.id)
  const fields = mockData.formFields[id] || [
    { fieldCode: 'field_1', fieldName: '申请类型', widgetType: 'select', placeholder: '请选择', isRequired: 1, colSpan: 6 },
    { fieldCode: 'field_2', fieldName: '申请原因', widgetType: 'textarea', placeholder: '请输入', isRequired: 1, colSpan: 12 },
    { fieldCode: 'field_3', fieldName: '申请日期', widgetType: 'date', placeholder: '请选择', isRequired: 1, colSpan: 6 }
  ]
  res.json(success(fields))
})

// ==================== 数据模型字段 ====================
app.get('/data/model/:id/fields', (req, res) => {
  res.json(success([
    { fieldCode: 'id', fieldName: '主键', fieldType: 'integer', isRequired: 1, isPrimary: 1 },
    { fieldCode: 'name', fieldName: '名称', fieldType: 'string', length: 100, isRequired: 1 },
    { fieldCode: 'status', fieldName: '状态', fieldType: 'integer', defaultValue: '0' },
    { fieldCode: 'createdTime', fieldName: '创建时间', fieldType: 'datetime' }
  ]))
})

// 启动服务
const PORT = 8080
app.listen(PORT, () => {
  console.log(`Mock API Server running at http://localhost:${PORT}`)
  console.log(`前端访问地址: http://localhost:3003`)
  console.log(`登录账号: admin / admin123`)
})