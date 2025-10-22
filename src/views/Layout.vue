<template>
  <el-container>
    <el-aside width="240px">
      <div class="logo">
        <el-icon size="24"><Operation /></el-icon>
        <span>炼钢AI优化系统</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        class="sidebar-menu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>生产总览</span>
        </el-menu-item>
        
        <el-menu-item index="furnace-realtime">
          <el-icon><Monitor /></el-icon>
          <span>炉次实时</span>
        </el-menu-item>
        
        <el-menu-item index="ai-suggestions">
          <el-icon><MagicStick /></el-icon>
          <span>AI建议队列</span>
        </el-menu-item>
        
        <el-menu-item index="analysis">
          <el-icon><TrendCharts /></el-icon>
          <span>炉次复盘</span>
        </el-menu-item>
        
        <el-menu-item index="reports">
          <el-icon><Document /></el-icon>
          <span>报表中心</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header height="60px" class="header">
        <div class="header-left">
          <h2>{{ $route.meta.title }}</h2>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-icon><User /></el-icon>
              操作员
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { 
  Operation, 
  DataBoard, 
  Monitor, 
  MagicStick, 
  TrendCharts, 
  Document, 
  Setting,
  User,
  ArrowDown
} from '@element-plus/icons-vue'
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  padding: 20px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #434a50;
}

.logo .el-icon {
  margin-right: 10px;
}

.sidebar-menu {
  border: none;
  height: calc(100vh - 80px);
}

.header {
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left h2 {
  color: #303133;
  font-size: 20px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.user-info .el-icon {
  margin: 0 5px;
}
</style>
