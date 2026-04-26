<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { EditPen, Share, Grid, TrendCharts, User, Timer, Document, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

onMounted(() => {
  initChart()
  initLineChart()
})

const initChart = () => {
  const chartDom = document.getElementById('main-chart')
  if (chartDom) {
    const myChart = echarts.init(chartDom)
    const option = {
      title: {
        text: '资源统计',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#303133'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: '#fff',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        textStyle: {
          color: '#606266'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['表单', '流程', '页面', '报表', '用户', '租户'],
        axisLine: {
          lineStyle: {
            color: '#e4e7ed'
          }
        },
        axisLabel: {
          color: '#606266'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#909399'
        },
        splitLine: {
          lineStyle: {
            color: '#ebeef5',
            type: 'dashed'
          }
        }
      },
      series: [{
        name: '数量',
        type: 'bar',
        data: [12, 5, 8, 3, 25, 4],
        barWidth: '40%',
        itemStyle: {
          borderRadius: [8, 8, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#764ba2' },
              { offset: 1, color: '#667eea' }
            ])
          }
        }
      }]
    }
    myChart.setOption(option)

    window.addEventListener('resize', () => myChart.resize())
  }
}

const initLineChart = () => {
  const chartDom = document.getElementById('line-chart')
  if (chartDom) {
    const myChart = echarts.init(chartDom)
    const option = {
      title: {
        text: '本周活跃度',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
          color: '#303133'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#fff',
        borderColor: '#e4e7ed',
        borderWidth: 1,
        textStyle: {
          color: '#606266'
        }
      },
      legend: {
        bottom: 0,
        data: ['流程实例', '审批任务'],
        textStyle: {
          color: '#606266'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: {
          lineStyle: {
            color: '#e4e7ed'
          }
        },
        axisLabel: {
          color: '#606266'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: '#ebeef5',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: '流程实例',
          type: 'line',
          smooth: true,
          data: [5, 8, 6, 12, 15, 3, 2],
          lineStyle: {
            width: 3,
            color: '#667eea'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
            ])
          },
          itemStyle: {
            color: '#667eea'
          }
        },
        {
          name: '审批任务',
          type: 'line',
          smooth: true,
          data: [12, 15, 10, 20, 25, 5, 3],
          lineStyle: {
            width: 3,
            color: '#67c23a'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
              { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
            ])
          },
          itemStyle: {
            color: '#67c23a'
          }
        }
      ]
    }
    myChart.setOption(option)

    window.addEventListener('resize', () => myChart.resize())
  }
}

// 统计数据
const stats = [
  { icon: EditPen, label: '表单总数', value: 12, trend: '+3', up: true, color: '#409eff' },
  { icon: Share, label: '流程总数', value: 5, trend: '+2', up: true, color: '#67c23a' },
  { icon: Grid, label: '页面总数', value: 8, trend: '+1', up: true, color: '#e6a23c' },
  { icon: TrendCharts, label: '报表总数', value: 3, trend: '0', up: false, color: '#f56c6c' }
]

// 快捷操作
const quickActions = [
  { icon: EditPen, label: '新建表单', path: '/form/designer/new', color: '#409eff' },
  { icon: Share, label: '新建流程', path: '/flow/designer/new', color: '#67c23a' },
  { icon: Grid, label: '新建页面', path: '/page/list', color: '#e6a23c' },
  { icon: User, label: '用户管理', path: '/system/user', color: '#909399' }
]

// 最近动态
const activities = [
  { time: '2024-01-15 10:00', user: 'admin', action: '创建了表单', target: '员工入职登记表', icon: EditPen },
  { time: '2024-01-15 09:30', user: 'admin', action: '创建了流程', target: '员工入职审批流程', icon: Share },
  { time: '2024-01-14 16:00', user: '张三', action: '提交了审批', target: '请假申请', icon: Document },
  { time: '2024-01-14 15:30', user: '李四', action: '完成了审批', target: '报销申请', icon: Timer },
  { time: '2024-01-14 09:00', user: '系统', action: '初始化完成', target: '', icon: Grid }
]
</script>

<template>
  <div class="dashboard">
    <!-- 统计卡片区域 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-icon" :style="{ background: stat.color }">
            <el-icon :size="28"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-trend" :class="{ up: stat.up }">
            <el-icon :size="14">
              <ArrowUp v-if="stat.up" />
              <ArrowDown v-else />
            </el-icon>
            <span>{{ stat.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="chart-card">
        <div id="main-chart" style="height: 320px"></div>
      </div>
      <div class="chart-card">
        <div id="line-chart" style="height: 320px"></div>
      </div>
    </div>

    <!-- 下方区域 -->
    <div class="bottom-section">
      <!-- 快捷操作 -->
      <div class="quick-actions-card">
        <div class="card-header">
          <span>快捷操作</span>
        </div>
        <div class="quick-grid">
          <div class="quick-item" v-for="action in quickActions" :key="action.label">
            <div class="quick-icon" :style="{ background: action.color }">
              <el-icon :size="24"><component :is="action.icon" /></el-icon>
            </div>
            <span class="quick-label">{{ action.label }}</span>
          </div>
        </div>
      </div>

      <!-- 最近动态 -->
      <div class="activity-card">
        <div class="card-header">
          <span>最近动态</span>
        </div>
        <div class="activity-list">
          <div class="activity-item" v-for="(item, index) in activities" :key="index">
            <div class="activity-icon">
              <el-icon :size="16"><component :is="item.icon" /></el-icon>
            </div>
            <div class="activity-content">
              <div class="activity-text">
                <span class="activity-user">{{ item.user }}</span>
                <span class="activity-action">{{ item.action }}</span>
                <span class="activity-target" v-if="item.target">{{ item.target }}</span>
              </div>
              <div class="activity-time">{{ item.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  padding: 0;

  // 统计卡片区域
  .stats-section {
    margin-bottom: 20px;

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;

      .stat-card {
        background: #fff;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);

          .stat-icon {
            transform: scale(1.1);
          }
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;

          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #303133;
            line-height: 1;
          }

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-top: 6px;
          }
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #909399;
          background: rgba(144, 147, 153, 0.1);

          &.up {
            color: #67c23a;
            background: rgba(103, 194, 58, 0.1);
          }
        }
      }
    }
  }

  // 图表区域
  .charts-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;

    .chart-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
  }

  // 下方区域
  .bottom-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 16px;

    // 快捷操作卡片
    .quick-actions-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .card-header {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;
      }

      .quick-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .quick-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          background: #f5f7fa;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: #fff;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

            .quick-icon {
              transform: scale(1.1);
            }
          }

          .quick-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            transition: transform 0.3s ease;
          }

          .quick-label {
            font-size: 14px;
            color: #606266;
          }
        }
      }
    }

    // 最近动态卡片
    .activity-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .card-header {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #ebeef5;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          background: #f5f7fa;
          transition: all 0.2s ease;

          &:hover {
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          }

          .activity-icon {
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
          }

          .activity-content {
            flex: 1;

            .activity-text {
              font-size: 14px;
              color: #606266;

              .activity-user {
                color: #409eff;
                font-weight: 500;
              }

              .activity-action {
                color: #909399;
                margin-left: 4px;
              }

              .activity-target {
                color: #67c23a;
                font-weight: 500;
                margin-left: 4px;
              }
            }

            .activity-time {
              font-size: 12px;
              color: #909399;
              margin-top: 4px;
            }
          }
        }
      }
    }
  }
}

// 响应式
@media screen and (max-width: 1200px) {
  .dashboard {
    .stats-section .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .charts-section {
      grid-template-columns: 1fr;
    }

    .bottom-section {
      grid-template-columns: 1fr;
    }
  }
}
</style>