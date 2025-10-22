<template>
  <div class="dashboard">
      <!-- 时间筛选器 -->
      <div class="filter-bar">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="timeRange" placeholder="选择时间范围">
              <el-option label="今日" value="today" />
              <el-option label="近7天" value="week" />
              <el-option label="近30天" value="month" />
              <el-option label="自定义" value="custom" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="aggregationType" placeholder="聚合维度">
              <el-option label="按炉" value="furnace" />
              <el-option label="按班" value="shift" />
              <el-option label="按钢种" value="steelType" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="customDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              v-if="timeRange === 'custom'"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新数据
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- KPI卡片区域 -->
      <div class="kpi-cards">
        <el-row :gutter="20">
          <el-col :span="6">
            <KpiCard
              title="温度/碳命中率"
              :value="hitRate"
              unit="%"
              :target="97"
              :trend="hitRateTrend"
              color="#67C23A"
            />
          </el-col>
          <el-col :span="6">
            <KpiCard
              title="钢中P波动"
              :value="pFluctuation"
              unit="%"
              :target="0.003"
              :trend="pFluctuationTrend"
              color="#E6A23C"
            />
          </el-col>
          <el-col :span="6">
            <KpiCard
              title="石灰单耗降幅"
              :value="limeReduction"
              unit="%"
              :target="5"
              :trend="limeReductionTrend"
              color="#409EFF"
            />
          </el-col>
          <el-col :span="6">
            <KpiCard
              title="年度累计节约"
              :value="annualSavings"
              unit="万元"
              :target="1000"
              :trend="annualSavingsTrend"
              color="#F56C6C"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 图表区域 -->
      <div class="charts-section">
        <el-row :gutter="20">
          <!-- 命中率趋势图 -->
          <el-col :span="12">
            <div class="chart-container">
              <h3>命中率趋势</h3>
              <v-chart 
                :option="hitRateChartOption" 
                style="height: 300px;"
                @click="handleChartClick"
              />
            </div>
          </el-col>
          
          <!-- P波动趋势图 -->
          <el-col :span="12">
            <div class="chart-container">
              <h3>P波动趋势</h3>
              <v-chart 
                :option="pFluctuationChartOption" 
                style="height: 300px;"
                @click="handleChartClick"
              />
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <!-- 未命中原因分布 -->
          <el-col :span="12">
            <div class="chart-container">
              <h3>未命中原因分布</h3>
              <v-chart 
                :option="missReasonChartOption" 
                style="height: 300px;"
              />
            </div>
          </el-col>
          
          <!-- 进行中炉次 -->
          <el-col :span="12">
            <div class="chart-container">
              <h3>进行中炉次</h3>
              <div class="furnace-cards">
                <div 
                  v-for="furnace in activeFurnaces" 
                  :key="furnace.id"
                  class="furnace-card"
                  @click="goToFurnaceDetail(furnace.id)"
                >
                  <div class="furnace-header">
                    <span class="furnace-id">{{ furnace.id }}</span>
                    <el-tag 
                      :type="getFurnaceStatusType(furnace.status)"
                      size="small"
                    >
                      {{ furnace.status }}
                    </el-tag>
                  </div>
                  <div class="furnace-content">
                    <div class="stage-info">
                      <span>阶段：{{ furnace.stage }}</span>
                      <span>预计终点：{{ furnace.estimatedEnd }}</span>
                    </div>
                    <div class="prediction-info">
                      <span>T预测：{{ furnace.tempPrediction }}°C</span>
                      <span>C预测：{{ furnace.carbonPrediction }}%</span>
                    </div>
                    <div class="risk-indicator">
                      <el-icon 
                        :color="getRiskColor(furnace.slagRisk)"
                        size="16"
                      >
                        <Warning v-if="furnace.slagRisk === 'high'" />
                        <InfoFilled v-else-if="furnace.slagRisk === 'medium'" />
                        <SuccessFilled v-else />
                      </el-icon>
                      <span>溅渣风险：{{ getRiskText(furnace.slagRisk) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import KpiCard from '@/components/KpiCard.vue'
import { 
  Refresh, 
  Warning, 
  InfoFilled, 
  SuccessFilled 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const router = useRouter()

// 响应式数据
const timeRange = ref('week')
const aggregationType = ref('furnace')
const customDateRange = ref([])

// KPI数据
const hitRate = ref(97.2)
const pFluctuation = ref(0.0028)
const limeReduction = ref(6.5)
const annualSavings = ref(1250)

// 趋势数据
const hitRateTrend = ref(2.1)
const pFluctuationTrend = ref(-15.2)
const limeReductionTrend = ref(8.3)
const annualSavingsTrend = ref(12.5)

// 进行中炉次数据
const activeFurnaces = ref([
  {
    id: 'F001',
    status: '吹炼中',
    stage: '主吹期',
    estimatedEnd: '14:25',
    tempPrediction: 1680,
    carbonPrediction: 0.08,
    slagRisk: 'low'
  },
  {
    id: 'F002',
    status: '取样中',
    stage: '终点调整',
    estimatedEnd: '14:35',
    tempPrediction: 1650,
    carbonPrediction: 0.12,
    slagRisk: 'medium'
  },
  {
    id: 'F003',
    status: '准备中',
    stage: '装料',
    estimatedEnd: '15:10',
    tempPrediction: 0,
    carbonPrediction: 0,
    slagRisk: 'low'
  }
])

// 命中率趋势图配置
const hitRateChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['温度命中率', '碳命中率', '综合命中率']
  },
  xAxis: {
    type: 'category',
    data: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7']
  },
  yAxis: {
    type: 'value',
    min: 90,
    max: 100
  },
  series: [
    {
      name: '温度命中率',
      type: 'line',
      data: [96.2, 97.1, 96.8, 97.5, 97.2, 96.9, 97.2],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '碳命中率',
      type: 'line',
      data: [95.8, 96.5, 97.2, 96.8, 97.1, 96.7, 97.0],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: '综合命中率',
      type: 'line',
      data: [96.0, 96.8, 97.0, 97.2, 97.2, 96.8, 97.1],
      smooth: true,
      itemStyle: { color: '#E6A23C' }
    }
  ]
}))

// P波动趋势图配置
const pFluctuationChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7']
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 0.01
  },
  series: [
    {
      name: 'P波动',
      type: 'line',
      data: [0.0045, 0.0032, 0.0028, 0.0025, 0.0028, 0.0031, 0.0028],
      smooth: true,
      itemStyle: { color: '#F56C6C' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
          ]
        }
      }
    }
  ]
}))

// 未命中原因分布图配置
const missReasonChartOption = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '未命中原因',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 35, name: '温度偏差' },
        { value: 28, name: '碳含量偏差' },
        { value: 20, name: '渣系偏离' },
        { value: 12, name: '设备波动' },
        { value: 5, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}))

// 方法
const refreshData = () => {
  // 模拟数据刷新
  console.log('刷新数据...')
}

const handleChartClick = (params) => {
  // 跳转到报表中心进行详细分析
  router.push('/reports')
}

const goToFurnaceDetail = (furnaceId) => {
  router.push(`/furnace-realtime?id=${furnaceId}`)
}

const getFurnaceStatusType = (status) => {
  const statusMap = {
    '吹炼中': 'warning',
    '取样中': 'info',
    '准备中': 'success'
  }
  return statusMap[status] || 'info'
}

const getRiskColor = (risk) => {
  const riskMap = {
    'high': '#F56C6C',
    'medium': '#E6A23C',
    'low': '#67C23A'
  }
  return riskMap[risk] || '#67C23A'
}

const getRiskText = (risk) => {
  const riskMap = {
    'high': '高风险',
    'medium': '中风险',
    'low': '低风险'
  }
  return riskMap[risk] || '低风险'
}

onMounted(() => {
  // 初始化数据
  console.log('Dashboard页面已加载')
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.filter-bar {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.kpi-cards {
  margin-bottom: 20px;
}

.charts-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  margin-bottom: 20px;
}

.chart-container h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.furnace-cards {
  max-height: 300px;
  overflow-y: auto;
}

.furnace-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.furnace-card:hover {
  background: #e9ecef;
  border-color: #409EFF;
}

.furnace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.furnace-id {
  font-weight: bold;
  color: #303133;
}

.furnace-content {
  font-size: 14px;
  color: #606266;
}

.stage-info,
.prediction-info,
.risk-indicator {
  margin-bottom: 5px;
  display: flex;
  justify-content: space-between;
}

.risk-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}
</style>
