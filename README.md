# 年度词云 (Yearly WordCloud)

> 一个基于 React 的 3D 球形词云可视化应用，支持自定义词条、多语言、配色切换和高清截图导出。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff.svg)

## ✨ 功能特性

### 🎨 视觉效果
- **3D 球形词云** - 使用数学算法将词条分布在 3D 球面上
- **动态旋转动画** - 平滑的自动旋转效果
- **渐变配色方案** - 3 种精心设计的配色主题
- **背景氛围渲染** - 径向渐变营造深度感
- **粒子纹理** - 60 个装饰性粒子增强视觉效果
![Demo Vedio](/src/assets/vedio.mp4)
![Demo Page](/src/assets/demo.jpg)

### 📝 词条管理
- **添加词条** - 输入自定义词条并添加到词云
- **删除词条** - 点击删除按钮移除不需要的词条
- **权重系统** - 不同词条有不同大小权重
- **本地缓存** - 使用 localStorage 自动保存词条数据
- **重置功能** - 一键清除缓存恢复默认设置

### 🌍 多语言支持
- 中文界面
- 英文界面
- 一键切换
- 完整的本地化翻译

### 🎮 交互功能
- **年份切换** - 支持查看不同年份的词云
- **生肖图标** - 根据年份自动显示对应生肖
- **旋转控制** - 播放/暂停自动旋转
- **配色切换** - 切换不同配色主题
- **鼠标悬停** - 词条悬停高亮效果

### 📸 导出功能
- **高清截图** - 使用 html2canvas 导出 PNG 图片
- **2倍分辨率** - 导出高清大图
- **自动优化** - 截图时自动优化样式

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 📦 技术栈

- **React 19.2.0** - UI 框架
- **Vite 7.2.4** - 构建工具
- **Tailwind CSS** - 样式框架（通过 CDN）
- **html2canvas** - 截图功能
- **内联 SVG 图标** - 无需外部图标库

## 📁 项目结构

```
annual-word-cloud/
├── src/
│   ├── components/
│   │   └── Icons.jsx          # SVG 图标组件
│   ├── App.jsx                 # 主应用组件
│   ├── main.jsx                # 应用入口
│   └── index.css               # 全局样式
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── vite.config.js              # Vite 配置
└── README.md                   # 项目文档
```

## 🎯 使用说明

### 添加词条
1. 在输入框中输入词条文本
2. 点击加号按钮或按回车键
3. 词条将自动保存到本地缓存

### 删除词条
- 点击词条旁的 ❌ 按钮删除

### 切换配色
- 点击调色板图标 🎨 切换配色方案

### 导出截图
1. 调整到满意的角度和状态
2. 点击"保存截图"按钮
3. 高清 PNG 图片将自动下载

### 清除缓存
- 点击底部的"清除缓存"按钮
- 确认后恢复默认设置

## 💾 数据存储

应用使用浏览器的 `localStorage` 存储以下数据：

- `wordcloud_words` - 词条列表
- `wordcloud_language` - 语言设置
- `wordcloud_paletteIndex` - 配色方案索引

## 🎨 默认词条

应用预设了以下默认词条：

- AI, AI应用元年, AI Agent
- 特朗普 2.0, Vibe Coding, DeepSeek
- Manus, Web3, Solana
- WaytoAGI, OpenAI, Gemini
- MeMe, 区块链, 数字游民
- 远程工作, 求索, 还债

## 🔧 自定义配置

### 修改默认词条
编辑 `src/App.jsx` 中的 `defaultWords` 数组：

```javascript
const defaultWords = [
  { text: '你的词条', weight: 1.0 },
  // 添加更多词条...
];
```

### 修改配色方案
编辑 `src/App.jsx` 中的 `palettes` 数组：

```javascript
const palettes = [
  {
    colors: ['#color1', '#color2', ...],
    tone: 'rgba(r, g, b, alpha)'
  },
  // 添加更多配色...
];
```

### 修改词云大小
编辑 `spherePoints` 计算逻辑中的 `sphereRadius` 系数：

```javascript
const sphereRadius = sphereRef.current
  ? Math.min(sphereRef.current.offsetWidth, sphereRef.current.offsetHeight) * 0.38
  : 140; // 调整这个数值
```

## 🌐 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 Issue 联系。

---

**享受你的年度词云！** 🎉
