<template>
  <div class="analysis">
      <!-- 炉次选择器 -->
      <div class="furnace-selector">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-select v-model="selectedFurnace" placeholder="选择炉次" @change="loadFurnaceData">
              <el-option label="F001 - Q235B" value="F001" />
              <el-option label="F002 - Q345B" value="F002" />
              <el-option label="F003 - Q235B" value="F003" />
            </el-select>
          </el-col>
          <el-col :span="8">
            <el-button type="primary" @click="compareMode = !compareMode">
              <el-icon><Switch /></el-icon>
              {{ compareMode ? '退出对比' : '对比模式' }}
            </el-button>
            <el-button type="success" @click="generateTemplate" v-if="!compareMode">
              <el-icon><Document /></el-icon>
              生成优化模板
            </el-button>
          </el-col>
          <el-col :span="8">
            <el-button type="warning" @click="exportReport">
              <el-icon><Download /></el-icon>
              导出报告
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 对比模式选择器 -->
      <div v-if="compareMode" class="compare-selector">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-select v-model="compareFurnace1" placeholder="选择对比炉次A">
              <el-option label="F001 - 标杆炉次" value="F001" />
              <el-option label="F002 - 方案A" value="F002" />
            </el-select>
          </el-col>
          <el-col :span="12">
            <el-select v-model="compareFurnace2" placeholder="选择对比炉次B">
              <el-option label="F002 - 方案B" value="F002" />
              <el-option label="F003 - 方案C" value="F003" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <el-row :gutter="20">
        <!-- 左侧：全过程回放 -->
        <el-col :span="16">
          <!-- 事件甘特图 -->
          <div class="gantt-section">
            <h3>全过程事件甘特图</h3>
            <div class="gantt-chart">
              <div class="gantt-timeline">
                <div class="time-axis">
                  <div 
                    v-for="hour in timeAxis" 
                    :key="hour" 
                    class="time-marker"
                    :style="{ left: getTimePosition(hour) + '%' }"
                  >
                    {{ hour }}:00
                  </div>
                </div>
                <div class="gantt-bars">
                  <div 
                    v-for="event in ganttEvents" 
                    :key="event.id"
                    class="gantt-bar"
                    :style="{
                      left: getEventPosition(event.start) + '%',
                      width: getEventWidth(event.start, event.end) + '%',
                      backgroundColor: event.color
                    }"
                  >
                    <span class="event-label">{{ event.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 过程曲线对比 -->
          <div class="process-curves">
            <h3>过程曲线对比</h3>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="温度曲线" name="temperature">
                <v-chart 
                  :option="temperatureChartOption" 
                  style="height: 300px;"
                />
              </el-tab-pane>
              <el-tab-pane label="碳含量曲线" name="carbon">
                <v-chart 
                  :option="carbonChartOption" 
                  style="height: 300px;"
                />
              </el-tab-pane>
              <el-tab-pane label="渣碱度曲线" name="basicity">
                <v-chart 
                  :option="basicityChartOption" 
                  style="height: 300px;"
                />
              </el-tab-pane>
            </el-tabs>
          </div>
        </el-col>

        <!-- 右侧：根因分析 -->
        <el-col :span="8">
          <!-- 根因雷达图 -->
          <div class="root-cause-analysis">
            <h3>根因分析雷达图</h3>
            <v-chart 
              :option="radarChartOption" 
              style="height: 300px;"
            />
          </div>

          <!-- 渣系与脱磷分析 -->
          <div class="slag-analysis">
            <h3>渣系与脱磷分析</h3>
            <el-tabs v-model="slagActiveTab">
              <el-tab-pane label="ΔP分布" name="deltaP">
                <v-chart 
                  :option="deltaPChartOption" 
                  style="height: 250px;"
                />
              </el-tab-pane>
              <el-tab-pane label="R/FeO散点" name="rFeo">
                <v-chart 
                  :option="rFeoChartOption" 
                  style="height: 250px;"
                />
              </el-tab-pane>
              <el-tab-pane label="班次控制图" name="control">
                <v-chart 
                  :option="controlChartOption" 
                  style="height: 250px;"
                />
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 经验注释 -->
          <div class="experience-notes">
            <h3>经验注释</h3>
            <div class="notes-list">
              <div 
                v-for="note in experienceNotes" 
                :key="note.id"
                class="note-item"
              >
                <div class="note-header">
                  <span class="note-tag">{{ note.tag }}</span>
                  <span class="note-time">{{ note.time }}</span>
                </div>
                <div class="note-content">{{ note.content }}</div>
                <div class="note-tags">
                  <el-tag 
                    v-for="tag in note.tags" 
                    :key="tag"
                    size="small"
                    type="info"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
            <el-button type="primary" size="small" @click="addNote">
              <el-icon><Plus /></el-icon>
              添加注释
            </el-button>
          </div>
        </el-col>
      </el-row>

      <!-- 添加注释对话框 -->
      <el-dialog
        v-model="noteDialogVisible"
        title="添加经验注释"
        width="500px"
      >
        <el-form :model="noteForm" label-width="80px">
          <el-form-item label="标签">
            <el-select v-model="noteForm.tag" placeholder="选择标签">
              <el-option label="工艺优化" value="process" />
              <el-option label="设备维护" value="equipment" />
              <el-option label="原料控制" value="material" />
              <el-option label="操作技巧" value="operation" />
            </el-select>
          </el-form-item>
          <el-form-item label="内容">
            <el-input
              v-model="noteForm.content"
              type="textarea"
              :rows="4"
              placeholder="请输入注释内容"
            />
          </el-form-item>
          <el-form-item label="标签">
            <el-input
              v-model="noteForm.tags"
              placeholder="输入标签，用逗号分隔"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="noteDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNote">保存</el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, RadarChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { 
  Switch, 
  Document, 
  Download, 
  Plus 
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 注册ECharts组件
use([
  CanvasRenderer,
  LineChart,
  RadarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  RadarComponent
])

// 响应式数据
const selectedFurnace = ref('F001')
const compareMode = ref(false)
const compareFurnace1 = ref('F001')
const compareFurnace2 = ref('F002')
const activeTab = ref('temperature')
const slagActiveTab = ref('deltaP')
const noteDialogVisible = ref(false)

// 时间轴数据
const timeAxis = ref(['14:00', '14:10', '14:20', '14:30', '14:40', '15:00'])

// 甘特图事件
const ganttEvents = ref([
  { id: 1, name: '装料', start: '14:00', end: '14:05', color: '#409EFF' },
  { id: 2, name: '吹炼', start: '14:05', end: '14:20', color: '#67C23A' },
  { id: 3, name: '取样', start: '14:20', end: '14:22', color: '#E6A23C' },
  { id: 4, name: '调整', start: '14:22', end: '14:25', color: '#F56C6C' },
  { id: 5, name: '出钢', start: '14:25', end: '14:30', color: '#909399' }
])

// 经验注释
const experienceNotes = ref([
  {
    id: 1,
    tag: '工艺优化',
    time: '2024-01-15 14:30',
    content: '本次炉次在终点调整阶段温度控制较好，建议在类似条件下采用相同的氧流量控制策略',
    tags: ['温度控制', '氧流量', '终点调整']
  },
  {
    id: 2,
    tag: '原料控制',
    time: '2024-01-15 13:45',
    content: '石灰质量稳定，脱磷效果良好，建议保持当前石灰用量配比',
    tags: ['石灰', '脱磷', '配比']
  }
])

// 注释表单
const noteForm = reactive({
  tag: '',
  content: '',
  tags: ''
})

// 图表配置
const temperatureChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['预测温度', '实际温度', '目标区间']
  },
  xAxis: {
    type: 'category',
    data: ['14:00', '14:05', '14:10', '14:15', '14:20', '14:25']
  },
  yAxis: {
    type: 'value',
    name: '温度(°C)'
  },
  series: [
    {
      name: '预测温度',
      type: 'line',
      data: [1650, 1680, 1700, 1685, 1670, 1665],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '实际温度',
      type: 'line',
      data: [1650, 1675, 1695, 1680, 1675, 1668],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: '目标区间',
      type: 'line',
      data: [1650, 1650, 1650, 1650, 1650, 1650],
      lineStyle: { color: '#F56C6C', type: 'dashed' },
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

const carbonChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['预测碳含量', '实际碳含量', '目标区间']
  },
  xAxis: {
    type: 'category',
    data: ['14:00', '14:05', '14:10', '14:15', '14:20', '14:25']
  },
  yAxis: {
    type: 'value',
    name: '碳含量(%)'
  },
  series: [
    {
      name: '预测碳含量',
      type: 'line',
      data: [0.15, 0.12, 0.08, 0.06, 0.05, 0.05],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '实际碳含量',
      type: 'line',
      data: [0.15, 0.13, 0.09, 0.07, 0.06, 0.05],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    }
  ]
}))

const basicityChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['预测渣碱度', '实际渣碱度', '目标区间']
  },
  xAxis: {
    type: 'category',
    data: ['14:00', '14:05', '14:10', '14:15', '14:20', '14:25']
  },
  yAxis: {
    type: 'value',
    name: '渣碱度'
  },
  series: [
    {
      name: '预测渣碱度',
      type: 'line',
      data: [2.8, 3.0, 3.2, 3.1, 3.0, 3.0],
      smooth: true,
      itemStyle: { color: '#409EFF' }
    },
    {
      name: '实际渣碱度',
      type: 'line',
      data: [2.8, 3.1, 3.3, 3.2, 3.1, 3.0],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    }
  ]
}))

const radarChartOption = computed(() => ({
  tooltip: {},
  legend: {
    data: ['数据质量', '模型精度', '执行偏差', '设备状态']
  },
  radar: {
    indicator: [
      { name: '数据质量', max: 100 },
      { name: '模型精度', max: 100 },
      { name: '执行偏差', max: 100 },
      { name: '设备状态', max: 100 }
    ]
  },
  series: [
    {
      name: '根因权重',
      type: 'radar',
      data: [
        {
          value: [85, 92, 78, 88],
          name: '当前炉次',
          itemStyle: { color: '#409EFF' }
        }
      ]
    }
  ]
}))

const deltaPChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['班次1', '班次2', '班次3', '班次4', '班次5']
  },
  yAxis: {
    type: 'value',
    name: 'ΔP(%)'
  },
  series: [
    {
      name: 'ΔP分布',
      type: 'bar',
      data: [0.002, 0.003, 0.0025, 0.0028, 0.0022],
      itemStyle: { color: '#67C23A' }
    }
  ]
}))

const rFeoChartOption = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  xAxis: {
    type: 'value',
    name: 'R值'
  },
  yAxis: {
    type: 'value',
    name: 'FeO(%)'
  },
  series: [
    {
      name: 'R-FeO关系',
      type: 'scatter',
      data: [
        [3.0, 15], [3.1, 14], [3.2, 13], [3.3, 12], [3.4, 11]
      ],
      itemStyle: { color: '#409EFF' }
    }
  ]
}))

const controlChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  },
  yAxis: {
    type: 'value',
    name: 'P含量(%)'
  },
  series: [
    {
      name: 'P含量',
      type: 'line',
      data: [0.025, 0.023, 0.024, 0.022, 0.025, 0.023, 0.024, 0.021, 0.025, 0.023],
      smooth: true,
      itemStyle: { color: '#67C23A' }
    },
    {
      name: '控制上限',
      type: 'line',
      data: [0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03, 0.03],
      lineStyle: { color: '#F56C6C', type: 'dashed' }
    },
    {
      name: '控制下限',
      type: 'line',
      data: [0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02, 0.02],
      lineStyle: { color: '#F56C6C', type: 'dashed' }
    }
  ]
}))

// 方法
const loadFurnaceData = () => {
  console.log('加载炉次数据:', selectedFurnace.value)
}

const generateTemplate = () => {
  ElMessage.success('优化模板已生成')
}

const exportReport = () => {
  ElMessage.success('报告导出中...')
}

const getTimePosition = (time) => {
  const startTime = 14 * 60 // 14:00 in minutes
  const endTime = 15 * 60   // 15:00 in minutes
  const currentTime = parseInt(time.split(':')[0]) * 60 + parseInt(time.split(':')[1])
  return ((currentTime - startTime) / (endTime - startTime)) * 100
}

const getEventPosition = (startTime) => {
  const start = 14 * 60 // 14:00 in minutes
  const end = 15 * 60   // 15:00 in minutes
  const eventTime = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
  return ((eventTime - start) / (end - start)) * 100
}

const getEventWidth = (startTime, endTime) => {
  const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
  const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
  const duration = end - start
  const totalDuration = 60 // 1 hour in minutes
  return (duration / totalDuration) * 100
}

const addNote = () => {
  noteDialogVisible.value = true
}

const saveNote = () => {
  const newNote = {
    id: experienceNotes.value.length + 1,
    tag: noteForm.tag,
    time: new Date().toLocaleString('zh-CN'),
    content: noteForm.content,
    tags: noteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
  }
  experienceNotes.value.push(newNote)
  noteDialogVisible.value = false
  
  // 重置表单
  noteForm.tag = ''
  noteForm.content = ''
  noteForm.tags = ''
  
  ElMessage.success('注释已保存')
}

onMounted(() => {
  console.log('炉次复盘页面已加载')
})
</script>

<style scoped>
.analysis {
  padding: 20px;
}

.furnace-selector,
.compare-selector {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gantt-section,
.process-curves,
.root-cause-analysis,
.slag-analysis,
.experience-notes {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.gantt-section h3,
.process-curves h3,
.root-cause-analysis h3,
.slag-analysis h3,
.experience-notes h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.gantt-chart {
  height: 200px;
  position: relative;
}

.gantt-timeline {
  height: 100%;
  position: relative;
}

.time-axis {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30px;
  border-bottom: 1px solid #e4e7ed;
}

.time-marker {
  position: absolute;
  top: 5px;
  font-size: 12px;
  color: #606266;
}

.gantt-bars {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  height: 150px;
}

.gantt-bar {
  position: absolute;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-size: 12px;
  color: #fff;
  margin-top: 5px;
}

.event-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notes-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.note-item {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.note-tag {
  background: #409EFF;
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.note-time {
  font-size: 12px;
  color: #909399;
}

.note-content {
  color: #606266;
  line-height: 1.5;
  margin-bottom: 8px;
}

.note-tags {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
</style>
