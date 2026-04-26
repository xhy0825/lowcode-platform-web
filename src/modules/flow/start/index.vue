<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { flowApi, formApi } from '@/api'

const router = useRouter()
const route = useRoute()

// 流程信息
const flowInfo = ref<any>(null)
const formId = ref<number | null>(null)

// 表单字段配置
const formFields = ref<any[]>([])

// 表单数据
const formData = reactive<Record<string, any>>({})

// 表单校验规则
const formRules = reactive<Record<string, any>>({})

// 加载中
const loading = ref(false)

// 获取流程定义
const loadFlowDef = async () => {
  const id = route.params.id as string
  loading.value = true
  try {
    const res = await flowApi.get(Number(id))
    flowInfo.value = res.data
    formId.value = res.data.formId

    if (formId.value) {
      await loadFormFields()
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('获取流程定义失败')
  } finally {
    loading.value = false
  }
}

// 获取表单字段配置
const loadFormFields = async () => {
  if (!formId.value) return
  try {
    const res = await formApi.getFields(formId.value)
    formFields.value = res.data || []

    // 初始化表单数据和校验规则
    formFields.value.forEach(field => {
      formData[field.fieldCode] = field.defaultValue || ''

      if (field.isRequired === 1) {
        formRules[field.fieldCode] = [
          { required: true, message: `${field.fieldName}不能为空`, trigger: 'blur' }
        ]
      }

      if (field.validateRegex) {
        formRules[field.fieldCode] = formRules[field.fieldCode] || []
        formRules[field.fieldCode].push({
          pattern: new RegExp(field.validateRegex),
          message: `${field.fieldName}格式不正确`,
          trigger: 'blur'
        })
      }
    })
  } catch (e) {
    console.error(e)
  }
}

// 提交流程
const handleSubmit = async () => {
  // 校验表单
  if (!flowInfo.value) return

  try {
    const res = await flowApi.start({
      flowDefinitionId: flowInfo.value.id,
      formData
    })
    ElMessage.success('流程发起成功')
    router.push(`/flow/instances/${flowInfo.value.id}`)
  } catch (e) {
    console.error(e)
    ElMessage.error('发起失败')
  }
}

// 返回
const handleBack = () => {
  router.push('/flow/list')
}

onMounted(() => {
  loadFlowDef()
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <!-- 流程信息 -->
      <div class="flow-header" v-if="flowInfo">
        <div class="header-left">
          <el-button @click="handleBack">
            <el-icon><Back /></el-icon>
            返回
          </el-button>
          <span class="flow-name">{{ flowInfo.flowName }}</span>
          <el-tag type="info">v{{ flowInfo.version }}</el-tag>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleSubmit">
            <el-icon><Promotion /></el-icon>
            提交审批
          </el-button>
        </div>
      </div>

      <el-divider />

      <!-- 流程说明 -->
      <el-alert type="info" :closable="false" v-if="flowInfo?.description">
        <template #title>流程说明</template>
        {{ flowInfo.description }}
      </el-alert>

      <!-- 表单填写 -->
      <div class="form-section" v-if="formFields.length > 0">
        <div class="section-title">
          <el-icon><Document /></el-icon>
          表单信息
        </div>

        <el-form :model="formData" :rules="formRules" label-width="120px">
          <el-row :gutter="20">
            <el-col
              v-for="field in formFields"
              :key="field.fieldCode"
              :span="field.colSpan"
              v-show="field.isHidden !== 1"
            >
              <el-form-item :label="field.fieldName" :prop="field.fieldCode">
                <!-- 文本框 -->
                <el-input
                  v-if="['input', 'password'].includes(field.widgetType)"
                  :type="field.widgetType"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  clearable
                />

                <!-- 多行文本 -->
                <el-input
                  v-else-if="field.widgetType === 'textarea'"
                  type="textarea"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  :rows="3"
                />

                <!-- 数字框 -->
                <el-input-number
                  v-else-if="field.widgetType === 'number'"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  style="width: 100%"
                />

                <!-- 下拉框 -->
                <el-select
                  v-else-if="['select', 'dict'].includes(field.widgetType)"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  style="width: 100%"
                  clearable
                >
                  <!-- 字典数据需从API加载 -->
                  <el-option label="选项1" value="1" />
                  <el-option label="选项2" value="2" />
                </el-select>

                <!-- 单选 -->
                <el-radio-group
                  v-else-if="field.widgetType === 'radio'"
                  v-model="formData[field.fieldCode]"
                  :disabled="field.isReadonly === 1"
                >
                  <el-radio label="1">选项1</el-radio>
                  <el-radio label="2">选项2</el-radio>
                </el-radio-group>

                <!-- 多选 -->
                <el-checkbox-group
                  v-else-if="field.widgetType === 'checkbox'"
                  v-model="formData[field.fieldCode]"
                  :disabled="field.isReadonly === 1"
                >
                  <el-checkbox label="1">选项1</el-checkbox>
                  <el-checkbox label="2">选项2</el-checkbox>
                </el-checkbox-group>

                <!-- 开关 -->
                <el-switch
                  v-else-if="field.widgetType === 'switch'"
                  v-model="formData[field.fieldCode]"
                  :disabled="field.isReadonly === 1"
                />

                <!-- 日期 -->
                <el-date-picker
                  v-else-if="['date', 'datetime'].includes(field.widgetType)"
                  v-model="formData[field.fieldCode]"
                  :type="field.widgetType"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  style="width: 100%"
                  clearable
                />

                <!-- 日期范围 -->
                <el-date-picker
                  v-else-if="field.widgetType === 'daterange'"
                  v-model="formData[field.fieldCode]"
                  type="daterange"
                  :disabled="field.isReadonly === 1"
                  style="width: 100%"
                />

                <!-- 时间 -->
                <el-time-picker
                  v-else-if="field.widgetType === 'time'"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  style="width: 100%"
                />

                <!-- 文件上传 -->
                <el-upload
                  v-else-if="field.widgetType === 'upload'"
                  :file-list="formData[field.fieldCode] || []"
                  :on-success="(res: any, file: any) => formData[field.fieldCode] = [...(formData[field.fieldCode] || []), file]"
                  action="/api/file/upload"
                >
                  <el-button type="primary">点击上传</el-button>
                </el-upload>

                <!-- 图片上传 -->
                <el-upload
                  v-else-if="field.widgetType === 'image'"
                  :file-list="formData[field.fieldCode] || []"
                  list-type="picture-card"
                  :on-success="(res: any, file: any) => formData[field.fieldCode] = [...(formData[field.fieldCode] || []), file]"
                  action="/api/file/upload"
                />

                <!-- 人员选择 -->
                <el-select
                  v-else-if="field.widgetType === 'user'"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  filterable
                  clearable
                >
                  <el-option label="用户1" value="user1" />
                  <el-option label="用户2" value="user2" />
                </el-select>

                <!-- 部门选择 -->
                <el-tree-select
                  v-else-if="field.widgetType === 'dept'"
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :data="[]"
                  clearable
                />

                <!-- 默认文本框 -->
                <el-input
                  v-else
                  v-model="formData[field.fieldCode]"
                  :placeholder="field.placeholder"
                  :disabled="field.isReadonly === 1"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 无表单提示 -->
      <el-empty description="该流程未关联表单" v-else-if="!loading && flowInfo && formFields.length === 0" />

      <!-- 流程预览 -->
      <div class="flow-preview" v-if="flowInfo?.nodes">
        <div class="section-title">
          <el-icon><Share /></el-icon>
          流程预览
        </div>

        <el-steps :active="0" align-center>
          <el-step
            v-for="node in flowInfo.nodes"
            :key="node.nodeId"
            :title="node.nodeName"
            :description="node.nodeType === 'user_task' ? `审批人: ${node.config?.assignType || '待配置'}` : ''"
          />
        </el-steps>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.app-container {
  padding: 20px;

  .flow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      .flow-name {
        font-size: 18px;
        font-weight: 500;
      }
    }
  }

  .form-section, .flow-preview {
    margin-top: 20px;

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 16px;
      color: #303133;
    }
  }

  .flow-preview {
    .el-steps {
      margin-top: 20px;
    }
  }
}
</style>