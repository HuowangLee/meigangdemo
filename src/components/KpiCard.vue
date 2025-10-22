<template>
  <div class="kpi-card" :class="{ 'trend-up': trend > 0, 'trend-down': trend < 0 }">
    <div class="kpi-header">
      <h3>{{ title }}</h3>
      <div class="trend-indicator">
        <el-icon v-if="trend > 0" color="#67C23A">
          <ArrowUp />
        </el-icon>
        <el-icon v-else-if="trend < 0" color="#F56C6C">
          <ArrowDown />
        </el-icon>
        <el-icon v-else color="#909399">
          <Minus />
        </el-icon>
        <span class="trend-value">{{ Math.abs(trend) }}%</span>
      </div>
    </div>
    
    <div class="kpi-content">
      <div class="kpi-value">
        <span class="value">{{ value }}</span>
        <span class="unit">{{ unit }}</span>
      </div>
      
      <div class="kpi-target">
        <span class="target-label">目标值：</span>
        <span class="target-value">{{ target }}{{ unit }}</span>
      </div>
      
      <div class="kpi-progress">
        <el-progress 
          :percentage="progressPercentage" 
          :color="progressColor"
          :show-text="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  target: {
    type: Number,
    required: true
  },
  trend: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#409EFF'
  }
})

const progressPercentage = computed(() => {
  if (props.target === 0) return 0
  return Math.min((props.value / props.target) * 100, 100)
})

const progressColor = computed(() => {
  if (progressPercentage.value >= 100) return '#67C23A'
  if (progressPercentage.value >= 80) return '#E6A23C'
  return '#F56C6C'
})
</script>

<style scoped>
.kpi-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  cursor: pointer;
}

.kpi-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.kpi-header h3 {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.trend-value {
  font-weight: 500;
}

.kpi-content {
  text-align: center;
}

.kpi-value {
  margin-bottom: 10px;
}

.value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}

.unit {
  font-size: 14px;
  color: #909399;
  margin-left: 5px;
}

.kpi-target {
  margin-bottom: 15px;
  font-size: 12px;
  color: #606266;
}

.target-label {
  color: #909399;
}

.target-value {
  color: #303133;
  font-weight: 500;
}

.kpi-progress {
  margin-top: 10px;
}

.trend-up .kpi-card {
  border-left: 4px solid #67C23A;
}

.trend-down .kpi-card {
  border-left: 4px solid #F56C6C;
}
</style>
