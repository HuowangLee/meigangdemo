<template>
  <div class="furnace-realtime">
      <!-- 炉次信息头部 -->
      <div class="furnace-header">
        <div class="furnace-info">
          <h2>炉次 {{ furnaceId }} - {{ furnaceStatus }}</h2>
          <div class="furnace-details">
            <span>钢种：{{ steelType }}</span>
            <span>开始时间：{{ startTime }}</span>
            <span>预计结束：{{ estimatedEnd }}</span>
          </div>
        </div>
        <div class="furnace-actions">
          <el-button type="primary" @click="takeSample">
            <el-icon><Document /></el-icon>
            取样
          </el-button>
          <el-button type="success" @click="takeTemperature">
            测温
          </el-button>
          <el-button type="warning" @click="showMaterialWizard">
            <el-icon><MagicStick /></el-icon>
            加料向导
          </el-button>
        </div>
      </div>

      <el-row :gutter="20">
        <!-- 左侧：吹炼时间轴和实时曲线 -->
        <el-col :span="16">
          <!-- 吹炼时间轴 -->
          <div class="timeline-section">
            <h3>吹炼时间轴</h3>
            <div class="timeline">
              <div 
                v-for="(event, index) in timelineEvents" 
                :key="index"
                class="timeline-item"
                :class="{ 'active': event.active, 'completed': event.completed }"
              >
                <div class="timeline-marker">
                  <el-icon v-if="event.completed">
                    <Check />
                  </el-icon>
                  <el-icon v-else-if="event.active">
                    <Loading />
                  </el-icon>
                  <el-icon v-else>
                    <Clock />
                  </el-icon>
                </div>
                <div class="timeline-content">
                  <div class="event-title">{{ event.title }}</div>
                  <div class="event-time">{{ event.time }}</div>
                  <div class="event-details" v-if="event.details">{{ event.details }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 实时曲线图 -->
          <div class="realtime-charts">
            <h3>实时监测曲线</h3>
            <v-chart 
              :option="realtimeChartOption" 
              style="height: 400px;"
            />
          </div>
        </el-col>

        <!-- 右侧：AI建议面板和目标窗口 -->
        <el-col :span="8">
          <!-- AI建议面板 -->
          <div class="ai-suggestions-panel">
            <h3>AI智能建议</h3>
            <div class="suggestion-card" v-if="currentSuggestion">
              <div class="suggestion-header">
                <span class="suggestion-title">{{ currentSuggestion.title }}</span>
                <el-tag 
                  :type="getConfidenceType(currentSuggestion.confidence)"
                  size="small"
                >
                  置信度: {{ currentSuggestion.confidence }}%
                </el-tag>
              </div>
              <div class="suggestion-content">
                <p>{{ currentSuggestion.description }}</p>
                <div class="suggestion-details">
                  <div class="detail-item">
                    <span class="label">建议内容：</span>
                    <span>{{ currentSuggestion.content }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">预期效果：</span>
                    <span>{{ currentSuggestion.expectedEffect }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">预计收益：</span>
                    <span class="profit">{{ currentSuggestion.expectedProfit }}元</span>
                  </div>
                </div>
              </div>
              <div class="suggestion-actions">
                <el-button type="primary" size="small" @click="executeSuggestion">
                  执行
                </el-button>
                <el-button size="small" @click="partialExecute">
                  部分执行
                </el-button>
                <el-button type="danger" size="small" @click="rejectSuggestion">
                  拒绝
                </el-button>
              </div>
            </div>
            <div v-else class="no-suggestion">
              <el-icon><InfoFilled /></el-icon>
              <span>暂无AI建议</span>
            </div>
          </div>

          <!-- 目标窗口条 -->
          <div class="target-windows">
            <h3>目标窗口</h3>
            <div class="target-item">
              <div class="target-label">温度目标</div>
              <div class="target-range">
                <span>{{ tempTarget.min }}°C - {{ tempTarget.max }}°C</span>
                <span class="current-value">当前: {{ currentTemp }}°C</span>
              </div>
              <el-progress 
                :percentage="getTempProgress()" 
                :color="getTempColor()"
                :show-text="false"
              />
            </div>
            
            <div class="target-item">
              <div class="target-label">碳含量目标</div>
              <div class="target-range">
                <span>{{ carbonTarget.min }}% - {{ carbonTarget.max }}%</span>
                <span class="current-value">当前: {{ currentCarbon }}%</span>
              </div>
              <el-progress 
                :percentage="getCarbonProgress()" 
                :color="getCarbonColor()"
                :show-text="false"
              />
            </div>

            <div class="target-item">
              <div class="target-label">渣碱度目标</div>
              <div class="target-range">
                <span>{{ rTarget.min }} - {{ rTarget.max }}</span>
                <span class="current-value">当前: {{ currentR }}</span>
              </div>
              <el-progress 
                :percentage="getRProgress()" 
                :color="getRColor()"
                :show-text="false"
              />
            </div>
          </div>

          <!-- 倒计时提醒 -->
          <div class="countdown-reminder" v-if="countdownTime > 0">
            <el-alert
              :title="`${countdownTime}分钟后复测`"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
        </el-col>
      </el-row>

      <!-- 加料向导对话框 -->
      <el-dialog
        v-model="materialWizardVisible"
        title="加料向导"
        width="600px"
      >
        <div class="material-wizard">
          <el-form :model="materialForm" label-width="120px">
            <el-form-item label="当前库存">
              <el-input v-model="materialForm.limeStock" placeholder="石灰库存(kg)">
                <template #append>kg</template>
              </el-input>
            </el-form-item>
            <el-form-item label="目标渣碱度">
              <el-input v-model="materialForm.targetR" placeholder="目标R值">
              </el-input>
            </el-form-item>
            <el-form-item label="约束条件">
              <el-checkbox-group v-model="materialForm.constraints">
                <el-checkbox label="lime">石灰用量限制</el-checkbox>
                <el-checkbox label="fluorite">萤石用量限制</el-checkbox>
                <el-checkbox label="cost">成本控制</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
          <div class="wizard-result" v-if="materialResult">
            <h4>推荐配比方案</h4>
            <div class="result-item">
              <span>石灰：{{ materialResult.lime }}kg</span>
              <span>萤石：{{ materialResult.fluorite }}kg</span>
              <span>预计R值：{{ materialResult.expectedR }}</span>
            </div>
          </div>
        </div>
        <template #footer>
          <el-button @click="materialWizardVisible = false">取消</el-button>
          <el-button type="primary" @click="executeMaterialPlan">执行方案</el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  Document, 
  MagicStick, 
  Check, 
  Loading, 
  Clock,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent
])

const route = useRoute()

// 炉次基本信息
const furnaceId = ref(route.query.id || 'F001')
const furnaceStatus = ref('吹炼中')
const steelType = ref('Q235B')
const startTime = ref('14:00')
const estimatedEnd = ref('14:25')

// 时间轴事件
const timelineEvents = ref([
  {
    title: '装料开始',
    time: '14:00',
    completed: true,
    active: false,
    details: '铁水120t，废钢15t'
  },
  {
    title: '吹炼开始',
    time: '14:05',
    completed: true,
    active: false,
    details: '氧流量8000m³/h'
  },
  {
    title: '主吹期',
    time: '14:10',
    completed: false,
    active: true,
    details: '当前阶段'
  },
  {
    title: '取样',
    time: '14:20',
    completed: false,
    active: false,
    details: '预计取样时间'
  },
  {
    title: '终点调整',
    time: '14:22',
    completed: false,
    active: false,
    details: '根据取样结果调整'
  },
  {
    title: '出钢',
    time: '14:25',
    completed: false,
    active: false,
    details: '预计出钢时间'
  }
])

// 实时数据
const currentTemp = ref(1680)
const currentCarbon = ref(0.08)
const currentR = ref(3.2)

// 目标窗口
const tempTarget = ref({ min: 1650, max: 1700 })
const carbonTarget = ref({ min: 0.05, max: 0.15 })
const rTarget = ref({ min: 3.0, max: 3.5 })

// AI建议
const currentSuggestion = ref({
  title: '建议增加石灰用量',
  description: '根据当前渣系分析，建议增加石灰用量以提高脱磷效果',
  content: '石灰 +50kg',
  expectedEffect: '提高脱磷效率15%',
  expectedProfit: 1200,
  confidence: 85
})

// 倒计时
const countdownTime = ref(0)

// 加料向导
const materialWizardVisible = ref(false)
const materialForm = reactive({
  limeStock: 5000,
  targetR: 3.2,
  constraints: ['lime']
})
const materialResult = ref(null)

// 生成时间标签
function generateTimeLabels() {
  const labels = []
  const now = new Date()
  for (let i = 0; i < 20; i++) {
    const time = new Date(now.getTime() - (19 - i) * 60000) // 每分钟一个点
    labels.push(time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
  }
  return labels
}

// 生成各种数据
function generateTempData() {
  return Array.from({ length: 20 }, (_, i) => 1650 + Math.sin(i * 0.3) * 30 + Math.random() * 10)
}

function generateCarbonData() {
  return Array.from({ length: 20 }, (_, i) => 0.1 + Math.sin(i * 0.2) * 0.05 + Math.random() * 0.02)
}

function generateRData() {
  return Array.from({ length: 20 }, (_, i) => 3.0 + Math.sin(i * 0.25) * 0.3 + Math.random() * 0.1)
}

function generateFeOData() {
  return Array.from({ length: 20 }, (_, i) => 15 + Math.sin(i * 0.4) * 5 + Math.random() * 2)
}

function generateOxygenData() {
  return Array.from({ length: 20 }, (_, i) => 8000 + Math.sin(i * 0.15) * 500 + Math.random() * 200)
}

function generateGunPositionData() {
  return Array.from({ length: 20 }, (_, i) => 1.5 + Math.sin(i * 0.35) * 0.3 + Math.random() * 0.1)
}

// 实时曲线图配置
const realtimeChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['温度', '碳含量', '渣碱度', 'FeO', '氧流量', '枪位']
  },
  xAxis: {
    type: 'category',
    data: generateTimeLabels()
  },
  yAxis: [
    {
      type: 'value',
      name: '温度(°C)',
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
      name: '温度',
      type: 'line',
      yAxisIndex: 0,
      data: generateTempData(),
      smooth: true,
      itemStyle: { color: '#F56C6C' }
    },
    {
      name: '碳含量',
      type: 'line',
      yAxisIndex: 1,
      data: generateCarbonData(),
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '渣碱度',
      type: 'line',
      yAxisIndex: 1,
      data: generateRData(),
      smooth: true,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: 'FeO',
      type: 'line',
      yAxisIndex: 1,
      data: generateFeOData(),
      smooth: true,
      itemStyle: { color: '#E6A23C' }
    },
    {
      name: '氧流量',
      type: 'line',
      yAxisIndex: 1,
      data: generateOxygenData(),
      smooth: true,
      itemStyle: { color: '#909399' }
    },
    {
      name: '枪位',
      type: 'line',
      yAxisIndex: 1,
      data: generateGunPositionData(),
      smooth: true,
      itemStyle: { color: '#9C27B0' }
    }
  ],
  dataZoom: [
    {
      type: 'inside',
      start: 70,
      end: 100
    }
  ]
}))

// 方法
const takeSample = () => {
  ElMessage.success('取样指令已发送')
  countdownTime.value = 5 // 5分钟后复测
}

const takeTemperature = () => {
  ElMessage.success('测温指令已发送')
}

const showMaterialWizard = () => {
  materialWizardVisible.value = true
  // 计算推荐方案
  calculateMaterialPlan()
}

const calculateMaterialPlan = () => {
  // 模拟AI计算
  materialResult.value = {
    lime: 120,
    fluorite: 15,
    expectedR: 3.2
  }
}

const executeMaterialPlan = () => {
  ElMessage.success('加料方案已执行')
  materialWizardVisible.value = false
}

const executeSuggestion = () => {
  ElMessage.success('AI建议已执行')
  currentSuggestion.value = null
}

const partialExecute = () => {
  ElMessage.info('部分执行AI建议')
}

const rejectSuggestion = () => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝AI建议', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    ElMessage.success('已拒绝AI建议')
    currentSuggestion.value = null
  })
}

const getConfidenceType = (confidence) => {
  if (confidence >= 80) return 'success'
  if (confidence >= 60) return 'warning'
  return 'danger'
}

const getTempProgress = () => {
  const range = tempTarget.value.max - tempTarget.value.min
  const position = (currentTemp.value - tempTarget.value.min) / range
  return Math.max(0, Math.min(100, position * 100))
}

const getTempColor = () => {
  if (currentTemp.value >= tempTarget.value.min && currentTemp.value <= tempTarget.value.max) {
    return '#67C23A'
  }
  return '#F56C6C'
}

const getCarbonProgress = () => {
  const range = carbonTarget.value.max - carbonTarget.value.min
  const position = (currentCarbon.value - carbonTarget.value.min) / range
  return Math.max(0, Math.min(100, position * 100))
}

const getCarbonColor = () => {
  if (currentCarbon.value >= carbonTarget.value.min && currentCarbon.value <= carbonTarget.value.max) {
    return '#67C23A'
  }
  return '#F56C6C'
}

const getRProgress = () => {
  const range = rTarget.value.max - rTarget.value.min
  const position = (currentR.value - rTarget.value.min) / range
  return Math.max(0, Math.min(100, position * 100))
}

const getRColor = () => {
  if (currentR.value >= rTarget.value.min && currentR.value <= rTarget.value.max) {
    return '#67C23A'
  }
  return '#F56C6C'
}

// 定时器
let timer = null

onMounted(() => {
  // 启动实时数据更新
  timer = setInterval(() => {
    // 模拟实时数据更新
    currentTemp.value += (Math.random() - 0.5) * 2
    currentCarbon.value += (Math.random() - 0.5) * 0.001
    currentR.value += (Math.random() - 0.5) * 0.01
    
    if (countdownTime.value > 0) {
      countdownTime.value--
    }
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style scoped>
.furnace-realtime {
  padding: 20px;
}

.furnace-header {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.furnace-info h2 {
  color: #303133;
  margin-bottom: 10px;
}

.furnace-details {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.furnace-actions {
  display: flex;
  gap: 10px;
}

.timeline-section,
.realtime-charts,
.ai-suggestions-panel,
.target-windows {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-section h3,
.realtime-charts h3,
.ai-suggestions-panel h3,
.target-windows h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e4e7ed;
}

.timeline-item {
  position: relative;
  margin-bottom: 20px;
  padding-left: 20px;
}

.timeline-marker {
  position: absolute;
  left: -25px;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
}

.timeline-item.completed .timeline-marker {
  background: #67C23A;
}

.timeline-item.active .timeline-marker {
  background: #409EFF;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.event-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.event-time {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.event-details {
  font-size: 12px;
  color: #606266;
}

.suggestion-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.suggestion-title {
  font-weight: 500;
  color: #303133;
}

.suggestion-content p {
  color: #606266;
  margin-bottom: 10px;
}

.suggestion-details {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
}

.detail-item .label {
  color: #909399;
}

.detail-item .profit {
  color: #67C23A;
  font-weight: 500;
}

.suggestion-actions {
  display: flex;
  gap: 10px;
}

.no-suggestion {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}

.no-suggestion .el-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.target-item {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.target-label {
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
}

.target-range {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.current-value {
  color: #409EFF;
  font-weight: 500;
}

.countdown-reminder {
  margin-top: 20px;
}

.material-wizard .wizard-result {
  margin-top: 20px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 6px;
}

.wizard-result h4 {
  margin-bottom: 10px;
  color: #303133;
}

.result-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #606266;
}
</style>
