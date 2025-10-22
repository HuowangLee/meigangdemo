# GitHub Pages 部署说明

## 部署步骤

### 1. 准备GitHub仓库
1. 在GitHub上创建一个新仓库，命名为 `meigangdemo`
2. 将代码推送到仓库的 `main` 分支

### 2. 启用GitHub Pages
1. 进入仓库的 Settings 页面
2. 找到 "Pages" 选项
3. 在 "Source" 中选择 "GitHub Actions"
4. 保存设置

### 3. 自动部署
- 每次推送到 `main` 分支时，GitHub Actions 会自动构建并部署
- 部署完成后，网站将在 `https://yourusername.github.io/meigangdemo/` 访问

### 4. 手动部署（可选）
如果需要手动部署，可以运行：
```bash
npm install
npm run build
npm run deploy
```

## 配置说明

### Vite配置
- `base: '/meigangdemo/'` - 设置基础路径为仓库名
- 优化了构建配置，分离了vendor、element-plus和echarts的chunks

### GitHub Actions
- 使用 Node.js 18
- 自动安装依赖
- 构建项目
- 部署到 GitHub Pages

## 注意事项

1. 确保仓库名为 `meigangdemo`，否则需要修改 `vite.config.js` 中的 `base` 路径
2. 首次部署可能需要几分钟时间
3. 部署成功后，可以通过 GitHub 仓库的 "Actions" 标签页查看部署状态

## 访问地址
部署成功后，网站地址为：
`https://yourusername.github.io/meigangdemo/`

请将 `yourusername` 替换为您的GitHub用户名。
