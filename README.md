# 炼钢生产管理AI优化系统

一个基于Vue 3 + Element Plus的现代化炼钢生产管理前端系统，集成了AI智能建议、实时监控、数据分析等功能。

## 功能特性

### 🏭 生产总览 (Dashboard)
- **KPI卡片展示**：温度/碳命中率、钢中P波动、石灰/萤石单耗降幅、炉衬寿命指数、能耗、年度累计节约
- **趋势图表**：近7/30天命中率 & P波动双轴折线图
- **分布分析**：未命中炉次占比与主因Top5分析
- **进行中炉次**：实时显示炉次状态、预测信息、溅渣风险指示灯
- **交互功能**：时间范围筛选、图表钻取、炉次详情跳转

### ⚡ 炉次实时 (Furnace Realtime)
- **吹炼时间轴**：可视化显示装料→吹炼→取样→终点全过程
- **实时曲线**：温度、碳含量、渣碱度、FeO、氧流量、枪位等多参数实时监控
- **目标窗口**：T/C目标区间、R/FeO目标区间，当前值定位显示
- **AI建议面板**：智能建议内容、预期效果、置信度与预计收益
- **操作功能**：加料向导、取样/测温快捷按钮、事件注释标记

### 🤖 AI建议队列 (AI Suggestions)
- **建议管理**：炉次/阶段/建议摘要/置信度/预计收益/状态管理
- **批量操作**：批量审批、单条通过/驳回、状态流转
- **事后对账**：预测提升 vs 实际结果对比分析
- **过滤筛选**：按炉次、班次、建议类型、状态、置信度区间筛选

### 📊 炉次复盘 (Analysis)
- **全过程回放**：事件甘特图 + 过程曲线（预测/实测对比）
- **根因分析**：未命中炉次的归因雷达图
- **对比模式**：标杆炉次 vs 方案A vs 方案B对比
- **渣系分析**：ΔP分布、R/FeO散点图、班次控制图
- **经验沉淀**：结构化注释标签，支持检索和复用

### 📈 报表中心 (Reports)
- **汇总报表**：命中率、P波动、单耗、能耗、炉衬寿命、节约金额
- **趋势分析**：KPI时序趋势与班组对比
- **成本瀑布**：原料→能耗→耐材→总成本节约构成分析
- **钻取分析**：按钢种/原料批次/班组维度切片分析
- **布局管理**：保存常用报表布局与共享

### ⚙️ 配置与权限 (Settings)
- **KPI配置**：温度/碳偏差范围、P目标、R/FeO窗口、小数位数
- **成本参数**：石灰/萤石/氧气单价、库存上限设置
- **模型监控**：MAE、命中率、特征漂移、模型版本管理
- **告警规则**：阈值设置、持续时长、抑制策略
- **权限管理**：角色权限配置、参数变更审批流程

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **UI组件库**：Element Plus
- **图表库**：ECharts + Vue-ECharts
- **路由管理**：Vue Router 4
- **状态管理**：Pinia
- **构建工具**：Vite
- **样式预处理**：Sass
- **图标库**：Element Plus Icons

## 项目结构

```
src/
├── components/          # 公共组件
│   └── KpiCard.vue      # KPI卡片组件
├── views/               # 页面组件
│   ├── Layout.vue      # 布局组件
│   ├── Dashboard.vue   # 生产总览
│   ├── FurnaceRealtime.vue  # 炉次实时
│   ├── AISuggestions.vue    # AI建议队列
│   ├── Analysis.vue         # 炉次复盘
│   ├── Reports.vue          # 报表中心
│   └── Settings.vue         # 配置与权限
├── router/             # 路由配置
│   └── index.js
├── styles/             # 样式文件
│   └── responsive.css  # 响应式样式
├── App.vue             # 根组件
└── main.js             # 入口文件
```

## 快速开始

### 在线体验
🌐 **在线演示**: [https://yourusername.github.io/meigangdemo/](https://yourusername.github.io/meigangdemo/)

### 本地开发

#### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

#### 安装依赖
```bash
npm install
# 或
yarn install
```

#### 开发环境运行
```bash
npm run dev
# 或
yarn dev
```

访问 http://localhost:3000 查看应用

#### 生产环境构建
```bash
npm run build
# 或
yarn build
```

#### 预览构建结果
```bash
npm run preview
# 或
yarn preview
```

### GitHub Pages 部署
详见 [DEPLOY.md](./DEPLOY.md) 文件

## 功能演示

### 1. 生产总览
- 查看关键KPI指标和趋势
- 监控进行中的炉次状态
- 分析未命中原因分布

### 2. 炉次实时操作
- 实时监控吹炼过程
- 接收和执行AI建议
- 使用加料向导优化配比

### 3. AI建议管理
- 审批和执行AI建议
- 查看建议执行效果
- 进行事后对账分析

### 4. 炉次复盘分析
- 回放炉次全过程
- 分析根因和优化点
- 沉淀操作经验

### 5. 报表中心
- 生成各类统计报表
- 多维度数据分析
- 成本效益分析

### 6. 系统配置
- 配置KPI参数和告警规则
- 管理用户权限
- 监控AI模型性能

## 响应式设计

系统支持多种屏幕尺寸：
- **大屏幕** (>= 1200px)：完整功能展示
- **中等屏幕** (768px - 1199px)：适配平板设备
- **小屏幕** (576px - 767px)：适配手机横屏
- **超小屏幕** (< 576px)：适配手机竖屏

## 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 开发指南

### 添加新页面
1. 在 `src/views/` 目录下创建新的Vue组件
2. 在 `src/router/index.js` 中添加路由配置
3. 在 `src/views/Layout.vue` 中添加菜单项

### 自定义组件
1. 在 `src/components/` 目录下创建组件
2. 在需要使用的页面中导入和注册
3. 遵循Vue 3 Composition API规范

### 样式定制
1. 使用Element Plus的主题定制功能
2. 在 `src/styles/` 目录下添加自定义样式
3. 遵循响应式设计原则

## 部署说明

### 静态部署
构建完成后，将 `dist` 目录部署到任何静态文件服务器。

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 许可证

MIT License

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱：your-email@example.com
- 项目地址：https://github.com/your-username/steel-production-management
