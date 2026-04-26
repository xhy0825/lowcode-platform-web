<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formApi, FieldConfig } from '@/api'
import Sortable from 'sortablejs'

const router = useRouter()
const route = useRoute()

// 表单基本信息
const formInfo = ref({
  id: 0,
  formName: '',
  formCode: '',
  modelId: null as number | null,
  status: 0
})

// 字段列表
const fieldList = ref<FieldConfig[]>([])

// 当前选中字段
const selectedField = ref<FieldConfig | null>(null)
const selectedFieldIndex = ref<number | null>(null)

// 组件库分组
const widgetGroups = [
  {
    name: '基础组件',
    widgets: [
      { type: 'input', label: '文本框', icon: 'EditPen' },
      { type: 'textarea', label: '多行文本', icon: 'Document' },
      { type: 'number', label: '数字框', icon: 'Calculator' },
      { type: 'password', label: '密码框', icon: 'Lock' },
      { type: 'radio', label: '单选', icon: 'CircleCheck' },
      { type: 'checkbox', label: '多选', icon: 'Checkbox' },
      { type: 'select', label: '下拉框', icon: 'ArrowDown' },
      { type: 'switch', label: '开关', icon: 'Switch' },
      { type: 'slider', label: '滑块', icon: 'Minus' },
      { type: 'rate', label: '评分', icon: 'Star' }
    ]
  },
  {
    name: '时间组件',
    widgets: [
      { type: 'date', label: '日期', icon: 'Calendar' },
      { type: 'datetime', label: '日期时间', icon: 'Timer' },
      { type: 'daterange', label: '日期范围', icon: 'Calendar' },
      { type: 'time', label: '时间', icon: 'Clock' }
    ]
  },
  {
    name: '上传组件',
    widgets: [
      { type: 'upload', label: '文件上传', icon: 'Upload' },
      { type: 'image', label: '图片上传', icon: 'Picture' }
    ]
  },
  {
    name: '业务组件',
    widgets: [
      { type: 'user', label: '人员选择', icon: 'User' },
      { type: 'dept', label: '部门选择', icon: 'OfficeBuilding' },
      { type: 'dict', label: '字典选择', icon: 'Collection' },
      { type: 'tree', label: '树形选择', icon: 'Share' }
    ]
  }
]

// 布局组件
const layoutWidgets = [
  { type: 'row', label: '行容器', icon: 'Grid' },
  { type: 'col', label: '列容器', icon: 'Grid' },
  { type: 'card', label: '卡片', icon: 'Postcard' },
  { type: 'divider', label: '分割线', icon: 'Minus' },
  { type: 'tabs', label: '标签页', icon: 'Folder' }
]

// 字段类型默认配置
const getDefaultFieldConfig = (type: string): FieldConfig => {
  const defaults: Record<string, Partial<FieldConfig>> = {
    input: { widgetType: 'input', colSpan: 6, placeholder: '请输入' },
    textarea: { widgetType: 'textarea', colSpan: 12, placeholder: '请输入' },
    number: { widgetType: 'number', colSpan: 6, placeholder: '请输入数字' },
    password: { widgetType: 'password', colSpan: 6, placeholder: '请输入密码' },
    select: { widgetType: 'select', colSpan: 6, placeholder: '请选择' },
    radio: { widgetType: 'radio', colSpan: 6 },
    checkbox: { widgetType: 'checkbox', colSpan: 6 },
    switch: { widgetType: 'switch', colSpan: 4 },
    date: { widgetType: 'date', colSpan: 6, placeholder: '请选择日期' },
    datetime: { widgetType: 'datetime', colSpan: 6, placeholder: '请选择日期时间' },
    upload: { widgetType: 'upload', colSpan: 12 },
    image: { widgetType: 'image', colSpan: 12 },
    user: { widgetType: 'user', colSpan: 6, placeholder: '请选择人员' },
    dept: { widgetType: 'dept', colSpan: 6, placeholder: '请选择部门' },
    dict: { widgetType: 'dict', colSpan: 6, placeholder: '请选择' }
  }
  return {
    fieldCode: '',
    fieldName: '',
    widgetType: type,
    placeholder: '',
    defaultValue: '',
    dictType: '',
    isRequired: 0,
    isReadonly: 0,
    isHidden: 0,
    colSpan: 6,
    rowOrder: fieldList.value.length,
    validateRegex: '',
    extraConfig: {},
    ...defaults[type]
  }
}

// 添加字段
const handleAddField = (type: string) => {
  const field = getDefaultFieldConfig(type)
  field.fieldCode = `field_${fieldList.value.length + 1}`
  field.fieldName = widgetGroups.flatMap(g => g.widgets).find(w => w.type === type)?.label || type
  field.rowOrder = fieldList.value.length
  fieldList.value.push(field)
  handleSelectField(fieldList.value.length - 1)
}

// 选择字段
const handleSelectField = (index: number) => {
  selectedFieldIndex.value = index
  selectedField.value = fieldList.value[index]
}

// 删除字段
const handleDeleteField = (index: number) => {
  const field = fieldList.value[index]
  ElMessageBox.confirm(`确认删除字段 "${field.fieldName}" 吗?`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(() => {
    fieldList.value.splice(index, 1)
    if (selectedFieldIndex.value === index) {
      selectedField.value = null
      selectedFieldIndex.value = null
    } else if (selectedFieldIndex.value !== null && selectedFieldIndex.value > index) {
      selectedFieldIndex.value -= 1
    }
    // 更新排序
    fieldList.value.forEach((f, i) => f.rowOrder = i)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 复制字段
const handleCopyField = (index: number) => {
  const field = JSON.parse(JSON.stringify(fieldList.value[index]))
  field.fieldCode = `${field.fieldCode}_copy`
  field.rowOrder = fieldList.value.length
  fieldList.value.push(field)
}

// 上移字段
const handleMoveUp = (index: number) => {
  if (index > 0) {
    const temp = fieldList.value[index]
    fieldList.value[index] = fieldList.value[index - 1]
    fieldList.value[index - 1] = temp
    fieldList.value.forEach((f, i) => f.rowOrder = i)
    if (selectedFieldIndex.value === index) {
      selectedFieldIndex.value = index - 1
    } else if (selectedFieldIndex.value === index - 1) {
      selectedFieldIndex.value = index
    }
  }
}

// 下移字段
const handleMoveDown = (index: number) => {
  if (index < fieldList.value.length - 1) {
    const temp = fieldList.value[index]
    fieldList.value[index] = fieldList.value[index + 1]
    fieldList.value[index + 1] = temp
    fieldList.value.forEach((f, i) => f.rowOrder = i)
    if (selectedFieldIndex.value === index) {
      selectedFieldIndex.value = index + 1
    } else if (selectedFieldIndex.value === index + 1) {
      selectedFieldIndex.value = index
    }
  }
}

// 保存表单
const handleSave = async () => {
  if (!formInfo.value.formName) {
    ElMessage.warning('请输入表单名称')
    return
  }
  if (fieldList.value.length === 0) {
    ElMessage.warning('请添加至少一个字段')
    return
  }
  try {
    if (formInfo.value.id) {
      await formApi.update(formInfo.value)
      await formApi.updateFields(formInfo.value.id, fieldList.value)
      ElMessage.success('保存成功')
    } else {
      const res = await formApi.create(formInfo.value)
      formInfo.value.id = res.data
      await formApi.updateFields(formInfo.value.id, fieldList.value)
      ElMessage.success('创建成功')
    }
  } catch (e) {
    console.error(e)
  }
}

// 发布表单
const handlePublish = async () => {
  if (!formInfo.value.id) {
    ElMessage.warning('请先保存表单')
    return
  }
  ElMessageBox.confirm('确认发布表单吗？发布后可用于数据录入', '提示', {
    type: 'warning'
  }).then(async () => {
    await formApi.publish(formInfo.value.id)
    formInfo.value.status = 1
    ElMessage.success('发布成功')
  })
}

// 返回列表
const handleBack = () => {
  router.push('/form/list')
}

// 预览表单
const previewVisible = ref(false)
const handlePreview = () => {
  previewVisible.value = true
}

// 加载表单数据
const loadFormData = async () => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    try {
      const res = await formApi.get(Number(id))
      formInfo.value = res.data
      const fieldsRes = await formApi.getFields(Number(id))
      fieldList.value = fieldsRes.data || []
    } catch (e) {
      console.error(e)
    }
  }
}

// 初始化拖拽
const initSortable = () => {
  nextTick(() => {
    const el = document.querySelector('.field-list')
    if (el) {
      Sortable.create(el as HTMLElement, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt
          if (oldIndex !== undefined && newIndex !== undefined) {
            const item = fieldList.value.splice(oldIndex, 1)[0]
            fieldList.value.splice(newIndex, 0, item)
            fieldList.value.forEach((f, i) => f.rowOrder = i)
          }
        }
      })
    }
  })
}

// 监听字段变化更新选中
watch(selectedField, (newVal) => {
  if (newVal && selectedFieldIndex.value !== null) {
    fieldList.value[selectedFieldIndex.value] = newVal
  }
}, { deep: true })

onMounted(() => {
  loadFormData()
  initSortable()
})
</script>

<template>
  <div class="form-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <el-input v-model="formInfo.formName" placeholder="表单名称" style="width: 200px" />
        <el-input v-model="formInfo.formCode" placeholder="表单编码" style="width: 200px" />
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
        <el-button type="success" @click="handlePublish" v-if="formInfo.id && formInfo.status === 0">
          <el-icon><Promotion /></el-icon>
          发布
        </el-button>
      </div>
    </div>

    <!-- 设计器主体 -->
    <div class="designer-body">
      <!-- 左侧组件库 -->
      <div class="widget-panel">
        <el-tabs>
          <el-tab-pane label="字段组件">
            <el-collapse>
              <el-collapse-item v-for="group in widgetGroups" :key="group.name" :title="group.name">
                <div class="widget-grid">
                  <div
                    class="widget-item"
                    v-for="widget in group.widgets"
                    :key="widget.type"
                    @click="handleAddField(widget.type)"
                  >
                    <el-icon size="24"><component :is="widget.icon" /></el-icon>
                    <span>{{ widget.label }}</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
          <el-tab-pane label="布局组件">
            <div class="widget-grid">
              <div
                class="widget-item"
                v-for="widget in layoutWidgets"
                :key="widget.type"
              >
                <el-icon size="24"><component :is="widget.icon" /></el-icon>
                <span>{{ widget.label }}</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中间画布 -->
      <div class="canvas-area">
        <div class="canvas-header">
          <span>字段列表 ({{ fieldList.length }})</span>
        </div>
        <div class="canvas-body">
          <div class="field-list" v-if="fieldList.length > 0">
            <div
              class="field-item"
              v-for="(field, index) in fieldList"
              :key="index"
              :class="{ selected: selectedFieldIndex === index }"
              @click="handleSelectField(index)"
            >
              <div class="field-item-left">
                <el-icon class="drag-handle"><Rank /></el-icon>
                <span class="field-name">{{ field.fieldName }}</span>
                <el-tag size="small" type="info">{{ field.widgetType }}</el-tag>
                <el-tag size="small" type="warning" v-if="field.isRequired === 1">必填</el-tag>
              </div>
              <div class="field-item-right">
                <el-button link size="small" @click.stop="handleCopyField(index)">
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button link size="small" @click.stop="handleMoveUp(index)" :disabled="index === 0">
                  <el-icon><ArrowUp /></el-icon>
                </el-button>
                <el-button link size="small" @click.stop="handleMoveDown(index)" :disabled="index === fieldList.length - 1">
                  <el-icon><ArrowDown /></el-icon>
                </el-button>
                <el-button link size="small" type="danger" @click.stop="handleDeleteField(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-else description="请从左侧拖拽或点击添加字段" />
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="props-panel">
        <div class="props-header">
          <span>字段属性</span>
        </div>
        <div class="props-body" v-if="selectedField">
          <el-form :model="selectedField" label-width="80px" size="small">
            <el-form-item label="字段编码">
              <el-input v-model="selectedField.fieldCode" />
            </el-form-item>
            <el-form-item label="字段名称">
              <el-input v-model="selectedField.fieldName" />
            </el-form-item>
            <el-form-item label="组件类型">
              <el-select v-model="selectedField.widgetType">
                <el-option
                  v-for="w in widgetGroups.flatMap(g => g.widgets)"
                  :key="w.type"
                  :label="w.label"
                  :value="w.type"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="占位提示">
              <el-input v-model="selectedField.placeholder" />
            </el-form-item>
            <el-form-item label="默认值">
              <el-input v-model="selectedField.defaultValue" />
            </el-form-item>
            <el-form-item label="列宽度">
              <el-select v-model="selectedField.colSpan">
                <el-option label="1/4 (col-3)" :value="3" />
                <el-option label="1/3 (col-4)" :value="4" />
                <el-option label="1/2 (col-6)" :value="6" />
                <el-option label="2/3 (col-8)" :value="8" />
                <el-option label="全行 (col-12)" :value="12" />
              </el-select>
            </el-form-item>
            <el-form-item label="字典类型" v-if="['select', 'radio', 'checkbox', 'dict'].includes(selectedField.widgetType)">
              <el-input v-model="selectedField.dictType" placeholder="如: sys_normal_disable" />
            </el-form-item>
            <el-form-item label="是否必填">
              <el-switch v-model="selectedField.isRequired" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="是否只读">
              <el-switch v-model="selectedField.isReadonly" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="是否隐藏">
              <el-switch v-model="selectedField.isHidden" :active-value="1" :inactive-value="0" />
            </el-form-item>
            <el-form-item label="校验规则">
              <el-input v-model="selectedField.validateRegex" placeholder="正则表达式" />
            </el-form-item>
          </el-form>
        </div>
        <el-empty v-else description="请选择字段配置属性" />
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog title="表单预览" v-model="previewVisible" width="800px">
      <el-form label-width="100px">
        <el-row :gutter="20">
          <el-col
            v-for="(field, index) in fieldList"
            :key="index"
            :span="field.colSpan"
            v-show="field.isHidden !== 1"
          >
            <el-form-item :label="field.fieldName" :required="field.isRequired === 1">
              <!-- 根据组件类型渲染 -->
              <el-input v-if="['input', 'password'].includes(field.widgetType)"
                :type="field.widgetType"
                :placeholder="field.placeholder"
                :disabled="field.isReadonly === 1"
              />
              <el-input v-else-if="field.widgetType === 'textarea'"
                type="textarea"
                :rows="3"
                :placeholder="field.placeholder"
                :disabled="field.isReadonly === 1"
              />
              <el-input-number v-else-if="field.widgetType === 'number'"
                :placeholder="field.placeholder"
                style="width: 100%"
              />
              <el-select v-else-if="['select', 'dict'].includes(field.widgetType)"
                :placeholder="field.placeholder"
                style="width: 100%"
              />
              <el-radio-group v-else-if="field.widgetType === 'radio'" />
              <el-checkbox-group v-else-if="field.widgetType === 'checkbox'" />
              <el-switch v-else-if="field.widgetType === 'switch'" />
              <el-date-picker v-else-if="['date', 'datetime'].includes(field.widgetType)"
                :type="field.widgetType"
                :placeholder="field.placeholder"
                style="width: 100%"
              />
              <el-upload v-else-if="field.widgetType === 'upload'" />
              <el-upload v-else-if="field.widgetType === 'image'" list-type="picture-card" />
              <el-input v-else :placeholder="field.placeholder" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.form-designer {
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
      :deep(.el-input__wrapper) {
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

    .widget-panel {
      width: 280px;
      background: #fff;
      border-right: 1px solid #e8e8e8;
      overflow: auto;

      :deep(.el-tabs__header) {
        padding: 0 16px;
        margin: 0;
      }

      :deep(.el-tabs__item) {
        font-weight: 500;
      }

      :deep(.el-collapse-item__header) {
        background: transparent;
        font-weight: 500;
        color: #303133;
      }

      .widget-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        padding: 12px 16px;

        .widget-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 12px;
          border: 1px solid #e4e7ed;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #fff;

          &:hover {
            border-color: #409eff;
            color: #409eff;
            background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);

            .el-icon {
              color: #409eff;
            }
          }

          .el-icon {
            color: #606266;
            transition: color 0.2s;
          }

          span {
            font-size: 12px;
            margin-top: 8px;
            color: #606266;
          }
        }
      }
    }

    .canvas-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;

      .canvas-header {
        height: 48px;
        background: #fff;
        padding: 12px 24px;
        border-bottom: 1px solid #ebeef5;
        display: flex;
        align-items: center;

        span {
          font-size: 14px;
          font-weight: 600;
          color: #303133;
        }
      }

      .canvas-body {
        flex: 1;
        overflow: auto;
        padding: 24px;

        .field-list {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #ebeef5;

          .field-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            border: 1px solid #e4e7ed;
            border-radius: 12px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            background: #fff;

            &:hover {
              border-color: #409eff;
              box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
            }

            &.selected {
              border-color: #409eff;
              background: linear-gradient(135deg, #ecf5ff 0%, #fff 100%);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

              .drag-handle {
                color: #409eff;
              }
            }

            .field-item-left {
              display: flex;
              align-items: center;
              gap: 12px;

              .drag-handle {
                cursor: move;
                color: #909399;
                transition: color 0.2s;
              }

              .field-name {
                font-weight: 500;
                color: #303133;
                font-size: 14px;
              }

              .el-tag {
                border-radius: 12px;
              }
            }

            .field-item-right {
              display: flex;
              gap: 8px;

              .el-button {
                border-radius: 8px;

                &:hover {
                  opacity: 0.8;
                }
              }
            }
          }
        }

        :deep(.el-empty) {
          padding: 60px 0;

          .el-empty__description {
            color: #909399;
          }
        }
      }
    }

    .props-panel {
      width: 340px;
      background: #fff;
      border-left: 1px solid #e8e8e8;
      overflow: auto;

      .props-header {
        height: 48px;
        padding: 12px 20px;
        border-bottom: 1px solid #ebeef5;
        font-weight: 600;
        color: #303133;
        background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%);
      }

      .props-body {
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

          .el-switch {
            --el-switch-on-color: #67c23a;
          }
        }

        :deep(.el-divider) {
          margin: 24px 0 16px;

          .el-divider__text {
            font-weight: 500;
            color: #303133;
          }
        }
      }
    }
  }
}
</style>