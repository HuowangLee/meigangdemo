<template>
  <div class="ai-suggestions">
      <!-- 筛选器 -->
      <div class="filter-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-select v-model="filters.furnace" placeholder="选择炉次" clearable>
              <el-option label="全部炉次" value="" />
              <el-option label="F001" value="F001" />
              <el-option label="F002" value="F002" />
              <el-option label="F003" value="F003" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.shift" placeholder="选择班次" clearable>
              <el-option label="全部班次" value="" />
              <el-option label="白班" value="day" />
              <el-option label="中班" value="middle" />
              <el-option label="夜班" value="night" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.status" placeholder="选择状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="待执行" value="pending" />
              <el-option label="执行中" value="executing" />
              <el-option label="已完成" value="completed" />
              <el-option label="已拒绝" value="rejected" />
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-select v-model="filters.confidence" placeholder="置信度范围" clearable>
              <el-option label="全部" value="" />
              <el-option label="高(≥80%)" value="high" />
              <el-option label="中(60-80%)" value="medium" />
              <el-option label="低(<60%)" value="low" />
            </el-select>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 15px;">
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
            <el-input
              v-model="filters.keyword"
              placeholder="搜索建议内容"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="refreshData">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </el-col>
          <el-col :span="6">
            <el-button type="success" @click="batchApprove" :disabled="!hasSelectedItems">
              <el-icon><Check /></el-icon>
              批量审批
            </el-button>
          </el-col>
        </el-row>
      </div>

      <!-- 建议列表 -->
      <div class="suggestions-list">
        <el-table
          :data="filteredSuggestions"
          @selection-change="handleSelectionChange"
          stripe
          style="width: 100%"
        >
          <el-table-column type="selection" width="55" />
          
          <el-table-column prop="furnaceId" label="炉次" width="80" />
          
          <el-table-column prop="stage" label="阶段" width="100">
            <template #default="{ row }">
              <el-tag :type="getStageType(row.stage)" size="small">
                {{ row.stage }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="summary" label="建议摘要" min-width="200">
            <template #default="{ row }">
              <div class="suggestion-summary">
                <div class="summary-title">{{ row.title }}</div>
                <div class="summary-content">{{ row.summary }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="confidence" label="置信度" width="100">
            <template #default="{ row }">
              <div class="confidence-display">
                <el-progress 
                  :percentage="row.confidence" 
                  :color="getConfidenceColor(row.confidence)"
                  :show-text="false"
                  :stroke-width="6"
                />
                <span class="confidence-text">{{ row.confidence }}%</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="expectedProfit" label="预计收益" width="120">
            <template #default="{ row }">
              <span class="profit-value">¥{{ row.expectedProfit }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="createTime" label="创建时间" width="150" />
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button 
                v-if="row.status === 'pending'"
                type="primary" 
                size="small" 
                @click="approveSuggestion(row)"
              >
                通过
              </el-button>
              <el-button 
                v-if="row.status === 'pending'"
                type="danger" 
                size="small" 
                @click="rejectSuggestion(row)"
              >
                驳回
              </el-button>
              <el-button 
                v-if="row.status === 'executing'"
                type="success" 
                size="small" 
                @click="completeSuggestion(row)"
              >
                完成
              </el-button>
              <el-button 
                size="small" 
                @click="viewDetails(row)"
              >
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 事后对账卡片 -->
      <div class="reconciliation-section">
        <h3>事后对账</h3>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="reconciliation-card">
              <div class="card-header">
                <h4>命中率提升</h4>
                <el-tag type="success" size="small">+2.3%</el-tag>
              </div>
              <div class="card-content">
                <div class="metric">
                  <span class="label">优化前：</span>
                  <span class="value">95.2%</span>
                </div>
                <div class="metric">
                  <span class="label">优化后：</span>
                  <span class="value">97.5%</span>
                </div>
                <div class="improvement">
                  <el-icon><TrendCharts /></el-icon>
                  <span>AI建议执行后命中率显著提升</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="reconciliation-card">
              <div class="card-header">
                <h4>P波动降低</h4>
                <el-tag type="success" size="small">-37.5%</el-tag>
              </div>
              <div class="card-content">
                <div class="metric">
                  <span class="label">优化前：</span>
                  <span class="value">±0.0048%</span>
                </div>
                <div class="metric">
                  <span class="label">优化后：</span>
                  <span class="value">±0.0030%</span>
                </div>
                <div class="improvement">
                  <el-icon><TrendCharts /></el-icon>
                  <span>脱磷控制更加稳定</span>
                </div>
              </div>
            </div>
          </el-col>
          
          <el-col :span="8">
            <div class="reconciliation-card">
              <div class="card-header">
                <h4>药剂节约</h4>
                <el-tag type="success" size="small">-6.8%</el-tag>
              </div>
              <div class="card-content">
                <div class="metric">
                  <span class="label">石灰节约：</span>
                  <span class="value">45kg/炉</span>
                </div>
                <div class="metric">
                  <span class="label">萤石节约：</span>
                  <span class="value">8kg/炉</span>
                </div>
                <div class="improvement">
                  <el-icon><TrendCharts /></el-icon>
                  <span>原料成本显著降低</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 建议详情对话框 -->
      <el-dialog
        v-model="detailDialogVisible"
        :title="`建议详情 - ${selectedSuggestion?.furnaceId}`"
        width="800px"
      >
        <div v-if="selectedSuggestion" class="suggestion-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="炉次ID">{{ selectedSuggestion.furnaceId }}</el-descriptions-item>
            <el-descriptions-item label="当前阶段">{{ selectedSuggestion.stage }}</el-descriptions-item>
            <el-descriptions-item label="建议类型">{{ selectedSuggestion.type }}</el-descriptions-item>
            <el-descriptions-item label="置信度">{{ selectedSuggestion.confidence }}%</el-descriptions-item>
            <el-descriptions-item label="预计收益">¥{{ selectedSuggestion.expectedProfit }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ selectedSuggestion.createTime }}</el-descriptions-item>
          </el-descriptions>
          
          <div class="detail-content">
            <h4>建议详情</h4>
            <p>{{ selectedSuggestion.details }}</p>
          </div>
          
          <div class="detail-content">
            <h4>预期效果</h4>
            <p>{{ selectedSuggestion.expectedEffect }}</p>
          </div>
          
          <div class="detail-content">
            <h4>执行记录</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(record, index) in selectedSuggestion.executionRecords"
                :key="index"
                :timestamp="record.time"
                :type="record.type"
              >
                {{ record.action }} - {{ record.operator }}
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button 
            v-if="selectedSuggestion?.status === 'pending'"
            type="primary" 
            @click="approveSuggestion(selectedSuggestion)"
          >
            通过建议
          </el-button>
        </template>
      </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  Search, 
  Refresh, 
  RefreshLeft, 
  Check, 
  TrendCharts 
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 筛选器
const filters = reactive({
  furnace: '',
  shift: '',
  status: '',
  confidence: '',
  dateRange: [],
  keyword: ''
})

// 建议数据
const suggestions = ref([
  {
    id: 1,
    furnaceId: 'F001',
    stage: '主吹期',
    title: '建议增加石灰用量',
    summary: '根据当前渣系分析，建议增加石灰用量以提高脱磷效果',
    type: '材料调整',
    confidence: 85,
    expectedProfit: 1200,
    status: 'pending',
    createTime: '2024-01-15 14:20',
    details: '当前渣碱度偏低，建议增加石灰50kg，预计可提高脱磷效率15%，降低终点P含量0.002%',
    expectedEffect: '提高脱磷效率，降低P含量波动',
    executionRecords: [
      { time: '14:20', action: 'AI生成建议', operator: '系统', type: 'primary' },
      { time: '14:22', action: '建议审核', operator: '工艺员', type: 'success' }
    ]
  },
  {
    id: 2,
    furnaceId: 'F002',
    stage: '终点调整',
    title: '建议调整氧流量',
    summary: '根据温度预测，建议降低氧流量以避免过吹',
    type: '工艺调整',
    confidence: 92,
    expectedProfit: 800,
    status: 'executing',
    createTime: '2024-01-15 14:15',
    details: '当前温度预测偏高，建议将氧流量从8000降至7500m³/h，避免过吹导致温度超标',
    expectedEffect: '避免过吹，提高终点命中率',
    executionRecords: [
      { time: '14:15', action: 'AI生成建议', operator: '系统', type: 'primary' },
      { time: '14:17', action: '建议通过', operator: '操作员', type: 'success' },
      { time: '14:18', action: '开始执行', operator: '操作员', type: 'warning' }
    ]
  },
  {
    id: 3,
    furnaceId: 'F003',
    stage: '装料',
    title: '建议调整装料配比',
    summary: '根据历史数据，建议调整铁水废钢配比以提高终点命中率',
    type: '配比优化',
    confidence: 78,
    expectedProfit: 1500,
    status: 'completed',
    createTime: '2024-01-15 13:45',
    details: '建议将铁水比例从85%调整至87%，废钢比例从15%调整至13%，预计可提高温度命中率3%',
    expectedEffect: '提高温度命中率，减少终点调整时间',
    executionRecords: [
      { time: '13:45', action: 'AI生成建议', operator: '系统', type: 'primary' },
      { time: '13:47', action: '建议通过', operator: '操作员', type: 'success' },
      { time: '13:48', action: '开始执行', operator: '操作员', type: 'warning' },
      { time: '14:00', action: '执行完成', operator: '操作员', type: 'success' }
    ]
  },
  {
    id: 4,
    furnaceId: 'F001',
    stage: '取样',
    title: '建议延迟取样时间',
    summary: '根据当前反应状态，建议延迟2分钟取样以获得更准确的结果',
    type: '时间调整',
    confidence: 65,
    expectedProfit: 600,
    status: 'rejected',
    createTime: '2024-01-15 14:10',
    details: '当前反应尚未完全稳定，建议延迟取样时间2分钟，以获得更准确的成分数据',
    expectedEffect: '提高取样准确性，减少复测次数',
    executionRecords: [
      { time: '14:10', action: 'AI生成建议', operator: '系统', type: 'primary' },
      { time: '14:12', action: '建议拒绝', operator: '操作员', type: 'danger' }
    ]
  }
])

// 选中的项目
const selectedItems = ref([])
const detailDialogVisible = ref(false)
const selectedSuggestion = ref(null)

// 计算属性
const filteredSuggestions = computed(() => {
  return suggestions.value.filter(item => {
    // 炉次筛选
    if (filters.furnace && item.furnaceId !== filters.furnace) return false
    
    // 班次筛选
    if (filters.shift && !item.shift?.includes(filters.shift)) return false
    
    // 状态筛选
    if (filters.status && item.status !== filters.status) return false
    
    // 置信度筛选
    if (filters.confidence) {
      const confidence = item.confidence
      if (filters.confidence === 'high' && confidence < 80) return false
      if (filters.confidence === 'medium' && (confidence < 60 || confidence >= 80)) return false
      if (filters.confidence === 'low' && confidence >= 60) return false
    }
    
    // 关键词搜索
    if (filters.keyword && !item.summary.toLowerCase().includes(filters.keyword.toLowerCase())) return false
    
    return true
  })
})

const hasSelectedItems = computed(() => selectedItems.value.length > 0)

// 方法
const refreshData = () => {
  ElMessage.success('数据已刷新')
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = key === 'dateRange' ? [] : ''
  })
}

const handleSelectionChange = (selection) => {
  selectedItems.value = selection
}

const batchApprove = () => {
  ElMessage.success(`已批量通过 ${selectedItems.value.length} 条建议`)
  selectedItems.value.forEach(item => {
    item.status = 'executing'
  })
  selectedItems.value = []
}

const approveSuggestion = (suggestion) => {
  suggestion.status = 'executing'
  ElMessage.success('建议已通过')
}

const rejectSuggestion = (suggestion) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝建议', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    suggestion.status = 'rejected'
    suggestion.rejectReason = value
    ElMessage.success('建议已拒绝')
  })
}

const completeSuggestion = (suggestion) => {
  suggestion.status = 'completed'
  ElMessage.success('建议执行完成')
}

const viewDetails = (suggestion) => {
  selectedSuggestion.value = suggestion
  detailDialogVisible.value = true
}

const getStageType = (stage) => {
  const stageMap = {
    '装料': 'info',
    '主吹期': 'warning',
    '终点调整': 'danger',
    '取样': 'primary'
  }
  return stageMap[stage] || 'info'
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'executing': 'primary',
    'completed': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待执行',
    'executing': '执行中',
    'completed': '已完成',
    'rejected': '已拒绝'
  }
  return statusMap[status] || status
}

const getConfidenceColor = (confidence) => {
  if (confidence >= 80) return '#67C23A'
  if (confidence >= 60) return '#E6A23C'
  return '#F56C6C'
}

onMounted(() => {
  console.log('AI建议队列页面已加载')
})
</script>

<style scoped>
.ai-suggestions {
  padding: 20px;
}

.filter-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggestions-list {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggestion-summary {
  padding: 5px 0;
}

.summary-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.summary-content {
  font-size: 12px;
  color: #606266;
  line-height: 1.4;
}

.confidence-display {
  display: flex;
  align-items: center;
  gap: 10px;
}

.confidence-text {
  font-size: 12px;
  color: #606266;
  min-width: 35px;
}

.profit-value {
  color: #67C23A;
  font-weight: 500;
}

.reconciliation-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reconciliation-section h3 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.reconciliation-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-header h4 {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  margin: 0;
}

.metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.metric .label {
  color: #606266;
}

.metric .value {
  color: #303133;
  font-weight: 500;
}

.improvement {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  font-size: 12px;
  color: #67C23A;
}

.suggestion-detail {
  max-height: 600px;
  overflow-y: auto;
}

.detail-content {
  margin: 20px 0;
}

.detail-content h4 {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.detail-content p {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}
</style>
