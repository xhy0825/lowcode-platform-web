import { request, ApiResponse, PageResponse } from './request'

// ==================== 登录认证 ====================

export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: User
  tenantId: string
  roles: string[]
  permissions: string[]
  menus: any[]
}

export interface CaptchaResponse {
  captchaKey: string
  captchaImage: string
}

export const loginApi = {
  // 获取验证码
  getCaptcha(): Promise<ApiResponse<CaptchaResponse>> {
    return request.get('/auth/captcha')
  },
  // 登录
  login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return request.post('/auth/login', data)
  },
  // 退出登录
  logout(): Promise<ApiResponse<void>> {
    return request.post('/auth/logout')
  },
  // 获取当前用户信息
  getUserInfo(): Promise<ApiResponse<{ user: User; permissions: string[] }>> {
    return request.get('/auth/user')
  },
  // 获取用户菜单
  getMenus(): Promise<ApiResponse<any[]>> {
    return request.get('/auth/menus')
  },
  // 刷新Token
  refreshToken(refreshToken: string, oldAccessToken?: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
    return request.post('/auth/refresh', { refreshToken, oldAccessToken })
  }
}

// ==================== 数据字典 ====================

export interface DictType {
  id: number
  tenantId: string
  dictType: string
  dictName: string
  status: number
  remark: string
}

export interface DictData {
  id: number
  tenantId: string
  dictType: string
  dictLabel: string
  dictValue: string
  dictSort: number
  cssClass: string
  listClass: string
  isDefault: number
  status: number
}

export const dictApi = {
  // 字典类型
  listTypes(params: any): Promise<ApiResponse<PageResponse<DictType>>> {
    return request.get('/system/dict/types', { params })
  },
  getType(dictType: string): Promise<ApiResponse<DictType>> {
    return request.get(`/system/dict/type/${dictType}`)
  },
  createType(data: DictType): Promise<ApiResponse<void>> {
    return request.post('/system/dict/type', data)
  },
  updateType(data: DictType): Promise<ApiResponse<void>> {
    return request.put('/system/dict/type', data)
  },
  deleteType(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/dict/type/${id}`)
  },

  // 字典数据
  listData(dictType: string): Promise<ApiResponse<DictData[]>> {
    return request.get(`/system/dict/data/${dictType}`)
  },
  createData(data: DictData): Promise<ApiResponse<void>> {
    return request.post('/system/dict/data', data)
  },
  updateData(data: DictData): Promise<ApiResponse<void>> {
    return request.put('/system/dict/data', data)
  },
  deleteData(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/dict/data/${id}`)
  },
  refreshCache(dictType: string): Promise<ApiResponse<void>> {
    return request.post(`/system/dict/cache/refresh/${dictType}`)
  }
}

// ==================== 角色管理 ====================

export interface Role {
  id: number
  tenantId?: string
  roleName: string
  roleCode: string
  dataScope: string
  status: number
  remark: string
  permissionIds?: number[]
  deptIds?: number[]
  createdTime?: string
}

export const roleApi = {
  list(params: any): Promise<ApiResponse<PageResponse<Role>>> {
    return request.get('/system/role/list', { params })
  },
  get(id: number): Promise<ApiResponse<Role>> {
    return request.get(`/system/role/${id}`)
  },
  create(data: Role): Promise<ApiResponse<void>> {
    return request.post('/system/role', data)
  },
  update(data: Role): Promise<ApiResponse<void>> {
    return request.put('/system/role', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/role/${id}`)
  },
  getPermissions(id: number): Promise<ApiResponse<number[]>> {
    return request.get(`/system/role/${id}/permissions`)
  },
  updatePermissions(id: number, permissionIds: number[]): Promise<ApiResponse<void>> {
    return request.put(`/system/role/${id}/permissions`, permissionIds)
  },
  updateDataScope(id: number, data: { dataScope: string; deptIds: number[] }): Promise<ApiResponse<void>> {
    return request.put(`/system/role/${id}/data-scope`, data)
  }
}

// ==================== 权限管理 ====================

export interface Permission {
  id: number
  permissionName: string
  permissionCode: string
  permissionType: string
  parentId: number
  path: string
  component: string
  icon: string
  orderNum: number
  visible: number
  status: number
  children?: Permission[]
}

export const permissionApi = {
  list(): Promise<ApiResponse<Permission[]>> {
    return request.get('/system/permission/list')
  },
  tree(): Promise<ApiResponse<Permission[]>> {
    return request.get('/system/permission/tree')
  }
}

// ==================== 命令管理 ====================

export interface Command {
  id: number
  tenantId: string
  commandName: string
  commandCode: string
  commandType: string
  scriptContent: string
  paramsSchema: string
  scheduleType: string
  cronExpression: string
  timeout: number
  retryCount: number
  status: number
  remark: string
}

export interface CommandLog {
  id: number
  commandId: number
  tenantId: string
  triggerType: string
  params: string
  startTime: string
  endTime: string
  duration: number
  status: string
  result: string
  errorMessage: string
}

export const commandApi = {
  list(params: any): Promise<ApiResponse<PageResponse<Command>>> {
    return request.get('/system/command/list', { params })
  },
  get(id: number): Promise<ApiResponse<Command>> {
    return request.get(`/system/command/${id}`)
  },
  create(data: Command): Promise<ApiResponse<void>> {
    return request.post('/system/command', data)
  },
  update(data: Command): Promise<ApiResponse<void>> {
    return request.put('/system/command', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/command/${id}`)
  },
  execute(id: number, params: Record<string, any>): Promise<ApiResponse<CommandLog>> {
    return request.post(`/system/command/${id}/execute`, params)
  },
  getLogs(id: number): Promise<ApiResponse<CommandLog[]>> {
    return request.get(`/system/command/${id}/logs`)
  },
  checkSecurity(scriptContent: string): Promise<ApiResponse<{ secure: boolean; errors: string[] }>> {
    return request.post('/system/command/check-security', scriptContent)
  },
  getTemplates(): Promise<ApiResponse<Record<string, string>>> {
    return request.get('/system/command/templates')
  }
}

// ==================== 表单管理 ====================

export interface FormDefinition {
  id: number
  tenantId?: string
  formName: string
  formCode: string
  modelId: number | null
  fieldConfig?: string
  layoutConfig?: string
  status: number
  version?: number
  createdTime?: string
}

export interface FieldConfig {
  fieldCode: string
  fieldName: string
  widgetType: string
  placeholder: string
  defaultValue: string
  dictType: string
  isRequired: number
  isReadonly: number
  isHidden: number
  colSpan: number
  rowOrder: number
  // 校验配置
  validateType?: string  // 预设校验类型: email/phone/idcard/url/number/custom
  validateRegex?: string  // 自定义正则表达式
  validateMessage?: string  // 校验失败提示信息
  minLength?: number  // 最小长度
  maxLength?: number  // 最大长度
  minValue?: number  // 最小值(数字字段)
  maxValue?: number  // 最大值(数字字段)
  extraConfig?: Record<string, any>
}

export const formApi = {
  list(params: any): Promise<ApiResponse<PageResponse<FormDefinition>>> {
    return request.get('/form/list', { params })
  },
  get(id: number): Promise<ApiResponse<FormDefinition>> {
    return request.get(`/form/${id}`)
  },
  create(data: FormDefinition): Promise<ApiResponse<number>> {
    return request.post('/form', data)
  },
  update(data: FormDefinition): Promise<ApiResponse<void>> {
    return request.put('/form', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/form/${id}`)
  },
  publish(id: number): Promise<ApiResponse<void>> {
    return request.post(`/form/${id}/publish`)
  },
  getFields(id: number): Promise<ApiResponse<FieldConfig[]>> {
    return request.get(`/form/${id}/fields`)
  },
  updateFields(id: number, fields: FieldConfig[]): Promise<ApiResponse<void>> {
    return request.put(`/form/${id}/fields`, fields)
  },
  submitData(id: number, data: Record<string, any>): Promise<ApiResponse<number>> {
    return request.post(`/form/${id}/data`, data)
  },
  queryData(id: number, params: any): Promise<ApiResponse<PageResponse<Record<string, any>>>> {
    return request.get(`/form/${id}/data`, { params })
  }
}

// ==================== 用户管理补充 ====================

export interface User {
  id: number
  tenantId: string
  username: string
  password?: string
  realName: string
  email: string
  phone: string
  avatar: string
  status: number
  deptId: number
  deptName?: string
  roles?: string[]
  createdTime: string
}

export interface UserQuery {
  pageNum: number
  pageSize: number
  username?: string
  realName?: string
  status?: number
  deptId?: number
}

export const userApi = {
  list(params: UserQuery): Promise<ApiResponse<PageResponse<User>>> {
    return request.get('/system/user/list', { params })
  },
  get(id: number): Promise<ApiResponse<User>> {
    return request.get(`/system/user/${id}`)
  },
  create(data: User): Promise<ApiResponse<void>> {
    return request.post('/system/user', data)
  },
  update(data: User): Promise<ApiResponse<void>> {
    return request.put('/system/user', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/user/${id}`)
  },
  resetPwd(id: number, password: string): Promise<ApiResponse<void>> {
    return request.put(`/system/user/${id}/password`, null, { params: { password } })
  },
  changeStatus(id: number, status: number): Promise<ApiResponse<void>> {
    return request.put(`/system/user/${id}/status`, null, { params: { status } })
  }
}

// ==================== 流程管理 ====================

export interface FlowDefinition {
  id: number
  tenantId?: string
  flowName: string
  flowCode: string
  formId: number | null
  formName?: string
  nodes: FlowNode[]
  edges: FlowEdge[]
  status: number
  version: number
  description?: string
  createdTime?: string
}

export interface FlowNode {
  nodeId: string
  nodeType: string
  nodeName: string
  position: { x: number; y: number }
  config: FlowNodeConfig
}

export interface FlowNodeConfig {
  assignType?: string
  assignValue?: string[]
  conditionExpr?: string
  timeout?: number
  autoApprove?: boolean
  rejectAction?: string
}

export interface FlowEdge {
  edgeId: string
  source: string
  target: string
  condition?: string
}

export interface FlowInstance {
  id: number
  tenantId: string
  flowDefinitionId: number
  flowName: string
  flowCode: string
  formDataId: number
  initiator: string
  currentNode: string
  status: string
  startTime: string
  endTime?: string
  duration?: number
}

export interface FlowTask {
  id: number
  tenantId: string
  instanceId: number
  nodeId: string
  nodeName: string
  flowName: string
  initiator: string
  assignee: string
  assignType: string
  status: string
  action?: string
  comment?: string
  createTime: string
  deadline?: string
  isOverdue?: boolean
}

export const flowApi = {
  // 流程定义
  list(params: any): Promise<ApiResponse<PageResponse<FlowDefinition>>> {
    return request.get('/flow/list', { params })
  },
  get(id: number): Promise<ApiResponse<FlowDefinition>> {
    return request.get(`/flow/${id}`)
  },
  create(data: FlowDefinition): Promise<ApiResponse<number>> {
    return request.post('/flow', data)
  },
  update(data: FlowDefinition): Promise<ApiResponse<void>> {
    return request.put('/flow', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/flow/${id}`)
  },
  publish(id: number): Promise<ApiResponse<void>> {
    return request.post(`/flow/${id}/publish`)
  },
  getForms(): Promise<ApiResponse<{ id: number; formName: string }[]>> {
    return request.get('/flow/forms')
  },
  getAssignOptions(): Promise<ApiResponse<{ type: string; id: string; name: string }[]>> {
    return request.get('/flow/assign-options')
  },

  // 流程实例
  getInstances(params: any): Promise<ApiResponse<PageResponse<FlowInstance>>> {
    return request.get('/flow/instances', { params })
  },
  getInstanceDetail(id: number): Promise<ApiResponse<{ nodes: any[] }>> {
    return request.get(`/flow/instance/${id}`)
  },
  cancelInstance(id: number): Promise<ApiResponse<void>> {
    return request.post(`/flow/instance/${id}/cancel`)
  },
  start(data: { flowDefinitionId: number; formData: Record<string, any> }): Promise<ApiResponse<number>> {
    return request.post('/flow/start', data)
  },
  getFormData(instanceId: number): Promise<ApiResponse<Record<string, any>>> {
    return request.get(`/flow/instance/${instanceId}/form-data`)
  },

  // 流程任务
  getTasks(params: any): Promise<ApiResponse<PageResponse<FlowTask>>> {
    return request.get('/flow/tasks', { params })
  },
  handleTask(id: number, data: { action: string; comment?: string; delegateUser?: string }): Promise<ApiResponse<void>> {
    return request.post(`/flow/task/${id}/handle`, data)
  },
  batchApprove(taskIds: number[]): Promise<ApiResponse<void>> {
    return request.post('/flow/task/batch-approve', taskIds)
  }
}

// ==================== 页面管理 ====================

export interface PageDefinition {
  id: number
  tenantId?: string
  pageName: string
  pageCode: string
  pageType: string
  modelId: number | null
  components: any[]
  status: number
  createdTime?: string
}

export const pageApi = {
  list(params: any): Promise<ApiResponse<PageResponse<PageDefinition>>> {
    return request.get('/page/list', { params })
  },
  get(id: number): Promise<ApiResponse<PageDefinition>> {
    return request.get(`/page/${id}`)
  },
  create(data: PageDefinition): Promise<ApiResponse<number>> {
    return request.post('/page', data)
  },
  update(data: PageDefinition): Promise<ApiResponse<void>> {
    return request.put('/page', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/page/${id}`)
  }
}

// ==================== 报表管理 ====================

export interface ReportDefinition {
  id: number
  tenantId?: string
  reportName: string
  reportType: string
  dataSource: string
  chartConfig?: any
  filters?: any[]
  status: number
  createdTime?: string
}

export const reportApi = {
  list(params: any): Promise<ApiResponse<PageResponse<ReportDefinition>>> {
    return request.get('/report/list', { params })
  },
  get(id: number): Promise<ApiResponse<ReportDefinition>> {
    return request.get(`/report/${id}`)
  },
  create(data: ReportDefinition): Promise<ApiResponse<number>> {
    return request.post('/report', data)
  },
  update(data: ReportDefinition): Promise<ApiResponse<void>> {
    return request.put('/report', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/report/${id}`)
  }
}

// ==================== 系统配置 ====================

export interface SysConfig {
  id: number
  tenantId: string
  configKey: string
  configValue: string
  configType: string
  remark: string
}

export const configApi = {
  list(params: any): Promise<ApiResponse<PageResponse<SysConfig>>> {
    return request.get('/system/config/list', { params })
  },
  get(id: number): Promise<ApiResponse<SysConfig>> {
    return request.get(`/system/config/${id}`)
  },
  create(data: SysConfig): Promise<ApiResponse<void>> {
    return request.post('/system/config', data)
  },
  update(data: SysConfig): Promise<ApiResponse<void>> {
    return request.put('/system/config', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/config/${id}`)
  }
}

// ==================== 租户管理 ====================

export interface Tenant {
  id: number
  tenantName: string
  tenantCode: string
  packageId: number
  expireTime: string
  dbSchema: string
  status: number
}

export const tenantApi = {
  list(params: any): Promise<ApiResponse<PageResponse<Tenant>>> {
    return request.get('/system/tenant/list', { params })
  },
  get(id: number): Promise<ApiResponse<Tenant>> {
    return request.get(`/system/tenant/${id}`)
  },
  create(data: Tenant): Promise<ApiResponse<void>> {
    return request.post('/system/tenant', data)
  },
  update(data: Tenant): Promise<ApiResponse<void>> {
    return request.put('/system/tenant', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/tenant/${id}`)
  }
}

// ==================== 数据模型 ====================

export interface DataModel {
  id: number
  tenantId?: string
  modelName: string
  modelCode: string
  tableName: string
  description: string
  status: number
  version: number
  createdTime?: string
  fields?: DataModelField[]
}

export interface DataModelField {
  id?: number
  modelId?: number
  tenantId?: string
  fieldName: string
  fieldCode: string
  columnName: string
  fieldType: string
  length: number
  precision: number
  scale: number
  isRequired: number
  isUnique: number
  isIndexed: number
  isPrimary: number
  defaultValue: string
  dictType: string
  relationType: string
  relationModelId: number
  orderNum: number
  delFlag?: number
}

export interface DataModelIndex {
  id: number
  modelId: number
  indexName: string
  indexType: string
  indexColumns: string
}

export const modelApi = {
  list(params: any): Promise<ApiResponse<PageResponse<DataModel>>> {
    return request.get('/data/model/list', { params })
  },
  get(id: number): Promise<ApiResponse<any>> {
    return request.get(`/data/model/${id}`)
  },
  create(data: any): Promise<ApiResponse<number>> {
    return request.post('/data/model', data)
  },
  update(data: any): Promise<ApiResponse<void>> {
    return request.put('/data/model', data)
  },
  delete(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/data/model/${id}`)
  },
  generateDdl(id: number): Promise<ApiResponse<string>> {
    return request.post(`/data/model/${id}/generate`)
  },
  executeDdl(id: number): Promise<ApiResponse<void>> {
    return request.post(`/data/model/${id}/execute`)
  },
  getFields(id: number): Promise<ApiResponse<any[]>> {
    return request.get(`/data/model/${id}/fields`)
  },
  updateFields(id: number, fields: any[]): Promise<ApiResponse<void>> {
    return request.put(`/data/model/${id}/fields`, fields)
  },
  getTableList(): Promise<ApiResponse<any[]>> {
    return request.get('/data/table/list')
  }
}