<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { reportApi, ReportDefinition } from '@/api'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()

const reportInfo = ref<ReportDefinition>({
  id: 0,
  reportName: '',
  reportType: 'bar',
  dataSource: '',
  chartConfig: { showLegend: true },
  filters: [],
  status: 0
})

const chartInstance = ref<echarts.ECharts | null>(null)
const loading = ref(false)

const reportTypeOptions = [
  { label: '柱状图', value: 'bar' },
  { label: '折线图', value: 'line' },
  { label: '饼图', value: 'pie' },
  { label: '表格', value: 'table' }
]

const handleSave = async () => {
  if (!reportInfo.value.reportName) {
    ElMessage.warning('请输入报表名称')
    return
  }
  try {
    if (reportInfo.value.id) {
      await reportApi.update(reportInfo.value)
      ElMessage.success('保存成功')
    } else {
      const res = await reportApi.create(reportInfo.value)
      reportInfo.value.id = res.data
      ElMessage.success('创建成功')
    }
  } catch (e) {
    console.error(e)
  }
}

const handlePreview = () => {
  initChart()
}

const handleBack = () => {
  router.push('/report/list')
}

const initChart = () => {
  const chartDom = document.getElementById('chart-container')
  if (!chartDom) return

  if (chartInstance.value) {
    chartInstance.value.dispose()
  }

  chartInstance.value = echarts.init(chartDom)

  const option: echarts.EChartsOption = {
    title: { text: reportInfo.value.reportName },
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    yAxis: { type: 'value' },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: reportInfo.value.reportType as 'bar' | 'line' | 'pie',
      smooth: true
    }]
  }

  chartInstance.value.setOption(option)
}

const loadReportData = async () => {
  const id = route.params.id as string
  if (id && id !== 'new') {
    loading.value = true
    try {
      const res = await reportApi.get(Number(id))
      reportInfo.value = res.data
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  loadReportData()
})
</script>

<template>
  <div class="report-designer">
    <div class="designer-header">
      <div class="header-left">
        <el-button @click="handleBack">
          <el-icon><Back /></el-icon>
          返回
        </el-button>
        <el-input v-model="reportInfo.reportName" placeholder="报表名称" style="width: 200px" />
        <el-select v-model="reportInfo.reportType" placeholder="报表类型" style="width: 120px">
          <el-option v-for="item in reportTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </div>
      <div class="header-right">
        <el-button @click="handlePreview">预览</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <div class="designer-body">
      <div class="config-panel">
        <div class="panel-title">数据配置</div>
        <el-form label-width="80px" style="padding: 16px">
          <el-form-item label="数据源">
            <el-select v-model="reportInfo.dataSource" placeholder="选择数据源">
              <el-option label="数据模型1" value="model1" />
              <el-option label="数据模型2" value="model2" />
            </el-select>
          </el-form-item>
          <el-form-item label="查询SQL">
            <el-input type="textarea" :rows="4" placeholder="输入SQL查询语句" />
          </el-form-item>
        </el-form>
      </div>

      <div class="canvas-area">
        <div class="canvas-title">报表预览</div>
        <div id="chart-container" class="chart-container"></div>
      </div>

      <div class="props-panel">
        <div class="panel-title">图表配置</div>
        <el-form label-width="80px" style="padding: 16px">
          <el-form-item label="标题">
            <el-input v-model="reportInfo.reportName" />
          </el-form-item>
          <el-form-item label="图例">
            <el-switch v-model="reportInfo.chartConfig.showLegend" />
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.report-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;

  .designer-header {
    height: 60px;
    background: #fff;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e4e7ed;

    .header-left, .header-right {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;

    .config-panel, .props-panel {
      width: 280px;
      background: #fff;
      border-right: 1px solid #e4e7ed;

      .panel-title {
        padding: 12px 16px;
        font-weight: 500;
        border-bottom: 1px solid #e4e7ed;
      }
    }

    .canvas-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 20px;

      .canvas-title {
        font-weight: 500;
        margin-bottom: 12px;
      }

      .chart-container {
        flex: 1;
        background: #fff;
        border-radius: 8px;
      }
    }

    .props-panel {
      border-right: none;
      border-left: 1px solid #e4e7ed;
    }
  }
}
</style>