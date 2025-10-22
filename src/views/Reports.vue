<template>
  <div class="reports">
      <!-- 报表筛选器 -->
      <div class="report-filters">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.reportType" placeholder="报表类型">
              <el-option label="日报" value="daily" />
              <el-option label="周报" value="weekly" />
              <el-option label="月报" value="monthly" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.dimension" placeholder="聚合维度">
              <el-option label="按班次" value="shift" />
              <el-option label="按炉次" value="furnace" />
              <el-option label="按钢种" value="steelType" />
              <el-option label="按日期" value="date" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="generateReport">
              <el-icon><Document /></el-icon>
              生成报表
            </el-button>
            <el-button @click="exportExcel">
              <el-icon><Download /></el-icon>
              导出Excel
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 汇总表 -->
      <div class="summary-table">
        <h3>KPI汇总表</h3>
        <el-table
          :data="summaryData"
          border
          stripe
          style="width: 100%"
        >
          <el-table-column prop="dimension" label="维度" width="120" />
          <el-table-column prop="hitRate" label="命中率(%)" width="100">
            <template #default="{ row }">
              <span :class="getHitRateClass(row.hitRate)">{{ row.hitRate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="pFluctuation" label="P波动(%)" width="100">
            <template #default="{ row }">
              <span :class="getPFluctuationClass(row.pFluctuation)">{{ row.pFluctuation }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="limeConsumption" label="石灰单耗(kg/t)" width="120" />
          <el-table-column prop="fluoriteConsumption" label="萤石单耗(kg/t)" width="120" />
          <el-table-column prop="energyConsumption" label="能耗(kWh/t)" width="120" />
          <el-table-column prop="furnaceLife" label="炉衬寿命(炉)" width="120" />
          <el-table-column prop="savings" label="节约金额(万元)" width="120">
            <template #default="{ row }">
              <span class="savings-value">¥{{ row.savings }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 趋势图表 -->
      <div class="trend-charts">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="chart-container">
              <h3>KPI时序趋势</h3>
              <v-chart 
                :option="trendChartOption" 
                style="height: 300px;"
              />
            </div>
          </el-col>
          <el-col :span="12">
            <div class="chart-container">
              <h3>班组对比</h3>
              <v-chart 
                :option="teamComparisonOption" 
                style="height: 300px;"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 成本瀑布图 -->
      <div class="cost-waterfall">
        <h3>成本节约瀑布图</h3>
        <v-chart 
          :option="costWaterfallOption" 
          style="height: 400px;"
        />
      </div>

      <!-- 钻取表 -->
      <div class="drill-down-table">
        <h3>多维度钻取表</h3>
        <div class="table-filters">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-select v-model="drillFilters.steelType" placeholder="钢种" clearable>
                <el-option label="全部" value="" />
                <el-option label="Q235B" value="Q235B" />
                <el-option label="Q345B" value="Q345B" />
                <el-option label="Q420B" value="Q420B" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="drillFilters.batch" placeholder="原料批次" clearable>
                <el-option label="全部" value="" />
                <el-option label="批次A" value="A" />
                <el-option label="批次B" value="B" />
                <el-option label="批次C" value="C" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-select v-model="drillFilters.shift" placeholder="班组" clearable>
                <el-option label="全部" value="" />
                <el-option label="白班" value="day" />
                <el-option label="中班" value="middle" />
                <el-option label="夜班" value="night" />
              </el-select>
            </el-col>
            <el-col :span="6">
              <el-button type="primary" @click="applyDrillFilters">
                <el-icon><Search /></el-icon>
                应用筛选
              </el-button>
            </el-col>
          </el-row>
        </div>
        
        <el-table
          :data="drillDownData"
          border
          stripe
          style="width: 100%"
          max-height="400"
        >
          <el-table-column prop="date" label="日期" width="100" />
          <el-table-column prop="shift" label="班次" width="80" />
          <el-table-column prop="furnace" label="炉次" width="80" />
          <el-table-column prop="steelType" label="钢种" width="100" />
          <el-table-column prop="batch" label="原料批次" width="100" />
          <el-table-column prop="hitRate" label="命中率(%)" width="100">
            <template #default="{ row }">
              <span :class="getHitRateClass(row.hitRate)">{{ row.hitRate }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="pContent" label="P含量(%)" width="100" />
          <el-table-column prop="limeUsed" label="石灰用量(kg)" width="120" />
          <el-table-column prop="fluoriteUsed" label="萤石用量(kg)" width="120" />
          <el-table-column prop="energyUsed" label="能耗(kWh)" width="100" />
          <el-table-column prop="cost" label="成本(元)" width="100">
            <template #default="{ row }">
              <span class="cost-value">¥{{ row.cost }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 报表布局管理 -->
      <div class="layout-management">
        <h3>报表布局管理</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>保存当前布局</span>
                  <el-button type="primary" size="small" @click="saveLayout">
                    <el-icon><DocumentAdd /></el-icon>
                    保存
                  </el-button>
                </div>
              </template>
              <el-form :model="layoutForm" label-width="80px">
                <el-form-item label="布局名称">
                  <el-input v-model="layoutForm.name" placeholder="输入布局名称" />
                </el-form-item>
                <el-form-item label="描述">
                  <el-input 
                    v-model="layoutForm.description" 
                    type="textarea" 
                    placeholder="输入布局描述"
                  />
                </el-form-item>
                <el-form-item label="共享">
                  <el-switch v-model="layoutForm.shared" />
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card>
              <template #header>
                <span>加载布局</span>
              </template>
              <div class="layout-list">
                <div 
                  v-for="layout in savedLayouts" 
                  :key="layout.id"
                  class="layout-item"
                >
                  <div class="layout-info">
                    <div class="layout-name">{{ layout.name }}</div>
                    <div class="layout-desc">{{ layout.description }}</div>
                    <div class="layout-meta">
                      <span>{{ layout.createTime }}</span>
                      <el-tag v-if="layout.shared" type="success" size="small">共享</el-tag>
                    </div>
                  </div>
                  <div class="layout-actions">
                    <el-button size="small" @click="loadLayout(layout)">加载</el-button>
                    <el-button size="small" type="danger" @click="deleteLayout(layout)">删除</el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card>
              <template #header>
                <span>一键对账</span>
              </template>
              <div class="reconciliation-options">
                <el-button type="primary" @click="compareWithBaseline">
                  <el-icon><TrendCharts /></el-icon>
                  与基线对比
                </el-button>
                <el-button type="success" @click="compareWithTarget">
                  <el-icon><Aim /></el-icon>
                  与目标对比
                </el-button>
                <el-button type="warning" @click="compareWithPrevious">
                  <el-icon><DataLine /></el-icon>
                  与上期对比
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  Document, 
  Download, 
  Search, 
  DocumentAdd, 
  TrendCharts, 
  Aim, 
  DataLine 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 筛选器
const filters = reactive({
  reportType: 'daily',
  dimension: 'shift',
  dateRange: []
})

const drillFilters = reactive({
  steelType: '',
  batch: '',
  shift: ''
})

// 汇总数据
const summaryData = ref([
  {
    dimension: '白班',
    hitRate: 97.2,
    pFluctuation: 0.0028,
    limeConsumption: 45.2,
    fluoriteConsumption: 8.5,
    energyConsumption: 125.6,
    furnaceLife: 1250,
    savings: 15.8
  },
  {
    dimension: '中班',
    hitRate: 96.8,
    pFluctuation: 0.0031,
    limeConsumption: 46.1,
    fluoriteConsumption: 8.8,
    energyConsumption: 128.2,
    furnaceLife: 1180,
    savings: 12.5
  },
  {
    dimension: '夜班',
    hitRate: 96.5,
    pFluctuation: 0.0035,
    limeConsumption: 47.3,
    fluoriteConsumption: 9.2,
    energyConsumption: 131.5,
    furnaceLife: 1150,
    savings: 10.2
  }
])

// 钻取数据
const drillDownData = ref([
  {
    date: '2024-01-15',
    shift: '白班',
    furnace: 'F001',
    steelType: 'Q235B',
    batch: 'A',
    hitRate: 97.5,
    pContent: 0.025,
    limeUsed: 120,
    fluoriteUsed: 15,
    energyUsed: 1250,
    cost: 2850
  },
  {
    date: '2024-01-15',
    shift: '白班',
    furnace: 'F002',
    steelType: 'Q345B',
    batch: 'B',
    hitRate: 96.8,
    pContent: 0.023,
    limeUsed: 135,
    fluoriteUsed: 18,
    energyUsed: 1280,
    cost: 3120
  }
])

// 布局管理
const layoutForm = reactive({
  name: '',
  description: '',
  shared: false
})

const savedLayouts = ref([
  {
    id: 1,
    name: '标准日报布局',
    description: '包含所有KPI指标的日报布局',
    createTime: '2024-01-15',
    shared: true
  },
  {
    id: 2,
    name: '成本分析布局',
    description: '专注于成本分析的布局',
    createTime: '2024-01-14',
    shared: false
  }
])

// 图表配置
const trendChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['命中率', 'P波动', '石灰单耗', '能耗']
  },
  xAxis: {
    type: 'category',
    data: ['1/1', '1/2', '1/3', '1/4', '1/5', '1/6', '1/7']
  },
  yAxis: [
    {
      type: 'value',
      name: '命中率(%)',
      position: 'left'
    },
    {
      type: 'value',
      name: '其他',
      position: 'right'
    }
  ],
  series: [
    {
      name: '命中率',
      type: 'line',
      yAxisIndex: 0,
      data: [96.2, 97.1, 96.8, 97.5, 97.2, 96.9, 97.2],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: 'P波动',
      type: 'line',
      yAxisIndex: 1,
      data: [0.0045, 0.0032, 0.0028, 0.0025, 0.0028, 0.0031, 0.0028],
      smooth: true,
      itemStyle: { color: '#F56C6C' }
    },
    {
      name: '石灰单耗',
      type: 'line',
      yAxisIndex: 1,
      data: [48.2, 47.8, 46.5, 45.2, 45.8, 46.1, 45.5],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '能耗',
      type: 'line',
      yAxisIndex: 1,
      data: [130.5, 128.2, 125.6, 124.8, 125.2, 126.1, 125.8],
      smooth: true,
      itemStyle: { color: '#E6A23C' }
    }
  ]
}))

const teamComparisonOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['白班', '中班', '夜班']
  },
  xAxis: {
    type: 'category',
    data: ['命中率', 'P波动', '石灰单耗', '能耗', '节约金额']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '白班',
      type: 'bar',
      data: [97.2, 0.0028, 45.2, 125.6, 15.8],
      itemStyle: { color: '#67C23A' }
    },
    {
      name: '中班',
      type: 'bar',
      data: [96.8, 0.0031, 46.1, 128.2, 12.5],
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '夜班',
      type: 'bar',
      data: [96.5, 0.0035, 47.3, 131.5, 10.2],
      itemStyle: { color: '#F56C6C' }
    }
  ]
}))

const costWaterfallOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['原料成本', '能耗成本', '耐材成本', '人工成本', '总成本', '节约金额']
  },
  yAxis: {
    type: 'value',
    name: '金额(万元)'
  },
  series: [
    {
      name: '成本构成',
      type: 'bar',
      data: [120, 45, 25, 15, 205, -38],
      itemStyle: {
        color: function(params) {
          return params.dataIndex === 5 ? '#67C23A' : '#409EFF'
        }
      }
    }
  ]
}))

// 方法
const generateReport = () => {
  ElMessage.success('报表生成中...')
}

const exportExcel = () => {
  ElMessage.success('Excel导出中...')
}

const applyDrillFilters = () => {
  ElMessage.success('筛选条件已应用')
}

const getHitRateClass = (hitRate) => {
  if (hitRate >= 97) return 'hit-rate-excellent'
  if (hitRate >= 95) return 'hit-rate-good'
  return 'hit-rate-poor'
}

const getPFluctuationClass = (pFluctuation) => {
  if (pFluctuation <= 0.003) return 'p-fluctuation-excellent'
  if (pFluctuation <= 0.005) return 'p-fluctuation-good'
  return 'p-fluctuation-poor'
}

const saveLayout = () => {
  if (!layoutForm.name) {
    ElMessage.warning('请输入布局名称')
    return
  }
  
  const newLayout = {
    id: savedLayouts.value.length + 1,
    name: layoutForm.name,
    description: layoutForm.description,
    createTime: new Date().toLocaleDateString('zh-CN'),
    shared: layoutForm.shared
  }
  
  savedLayouts.value.push(newLayout)
  
  // 重置表单
  layoutForm.name = ''
  layoutForm.description = ''
  layoutForm.shared = false
  
  ElMessage.success('布局已保存')
}

const loadLayout = (layout) => {
  ElMessage.success(`已加载布局: ${layout.name}`)
}

const deleteLayout = (layout) => {
  ElMessageBox.confirm('确定要删除这个布局吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = savedLayouts.value.findIndex(item => item.id === layout.id)
    if (index > -1) {
      savedLayouts.value.splice(index, 1)
      ElMessage.success('布局已删除')
    }
  })
}

const compareWithBaseline = () => {
  ElMessage.info('与基线对比分析中...')
}

const compareWithTarget = () => {
  ElMessage.info('与目标对比分析中...')
}

const compareWithPrevious = () => {
  ElMessage.info('与上期对比分析中...')
}

onMounted(() => {
  console.log('报表中心页面已加载')
})
</script>

<style scoped>
.reports {
  padding: 20px;
}

.report-filters,
.summary-table,
.trend-charts,
.cost-waterfall,
.drill-down-table,
.layout-management {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-filters h3,
.summary-table h3,
.trend-charts h3,
.cost-waterfall h3,
.drill-down-table h3,
.layout-management h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.chart-container {
  margin-bottom: 20px;
}

.table-filters {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.hit-rate-excellent {
  color: #67C23A;
  font-weight: bold;
}

.hit-rate-good {
  color: #E6A23C;
  font-weight: bold;
}

.hit-rate-poor {
  color: #F56C6C;
  font-weight: bold;
}

.p-fluctuation-excellent {
  color: #67C23A;
  font-weight: bold;
}

.p-fluctuation-good {
  color: #E6A23C;
  font-weight: bold;
}

.p-fluctuation-poor {
  color: #F56C6C;
  font-weight: bold;
}

.savings-value {
  color: #67C23A;
  font-weight: bold;
}

.cost-value {
  color: #F56C6C;
  font-weight: bold;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layout-list {
  max-height: 300px;
  overflow-y: auto;
}

.layout-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 10px;
}

.layout-info {
  flex: 1;
}

.layout-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.layout-desc {
  font-size: 12px;
  color: #606266;
  margin-bottom: 5px;
}

.layout-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #909399;
}

.layout-actions {
  display: flex;
  gap: 5px;
}

.reconciliation-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reconciliation-options .el-button {
  width: 100%;
}
</style>
