# 浮屿 Atlas

一个可交互的半透明毛玻璃地图 UI Demo。使用 Vite、原生 JavaScript、Leaflet 和 Lucide。

## 设计与开发规范

- [前端设计规范 v1.1](docs/FRONTEND_SPEC.md)：材质、配色、布局、组件、响应式、侧栏联动、动效、可读性与验收清单，包含可交给后续开发者的任务说明。
- [可复制的设计变量 CSS](docs/reference/atlas-tokens.css)：独立的参考快照，可用于新项目；当前 Demo 不加载该文件。

## 启动

```sh
npm install
npm run dev -- --port 5173
```

访问 http://localhost:5173。生产构建：`npm run build`。

## 交互

- 拖动、缩放地图，点击标记或左侧列表查看地点。
- 搜索 7 个内置上海地点，支持 `⌘K` / `Ctrl+K` 聚焦、回车选择。
- 按类别筛选地点；收藏保存在当前浏览器 localStorage。
- 六种底图外观入口，以及地点、750 米探索圈、漫步示意路线；真实底图需自行配置。
- 玻璃外观提供清透、柔雾、凝霜预设；展开「精细调整」可修改透明度、模糊与增强可读性。
- 测距：点击工具后在地图空白处选择两点，显示球面直线距离；Esc 退出。
- 导出当前地图中心、缩放、底图、收藏及玻璃设置为 JSON。
- 顶部专注模式隐藏两侧面板；窄屏通过左下角「发现地点」和底部图层按钮展开面板。

## 实现说明

底层是 Leaflet 地图，浮层使用透明背景、`backdrop-filter: blur() saturate()`、细白边和柔和阴影。透明度只作用于背景，不影响文字和图标；没有使用整个面板的 `opacity`。CSS 变量统一控制玻璃材质。旧浏览器不支持背景模糊时回退到更实的浅色背景。支持键盘焦点、表单标签与减少动画设置。

公开版本不包含任何内置瓦片服务地址、提供者名称、具体服务名或远程地图缩略图。未配置底图时显示明确标注的抽象界面背景，仍可体验浮层、明暗风格、地点与地图控件；背景本身不代表真实地理信息。地点是静态策划内容；探索圈半径为 750 米；漫步路线为界面展示用折线，不提供真实道路导航、交通、天气或营业状态。测距为直线距离，定位按钮回到演示地点，不请求设备位置。

参考：[Leaflet 文档](https://leafletjs.com/reference)、[MDN backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter)。

## Liquid Glass 外观优化

参考 [Apple iOS 27 设计更新](https://images.apple.com/os/ios/) 和 [Apple Materials 指南](https://developer.apple.com/design/human-interface-guidelines/materials)，采用分层材质：导航及工具为清透的胶囊玻璃，信息面板使用较稳定的雾面衬底。`src/liquid-glass.css` 管理材质、镜面边缘、圆角、控件与浅深色适配；`src/glass.js` 管理局部指针映光和增强可读性。

这是 CSS 对材质的视觉实现，不是 iOS 原生折射渲染器。映光仅在鼠标移动于小面积导航/工具时按帧更新，无常驻动画。遵循减少动态效果、减少透明度及增强对比度的系统偏好；不支持 backdrop-filter 时退回更实的衬底。

## 自行配置底图

复制配置模板：

```sh
cp src/basemaps.example.json src/basemaps.local.json
```

在本地文件中填写有权使用的瓦片模板 `url`、可选缩略图 `preview` 和 `attribution`。`styles` 中的 `id` 对应 `standard`、`english`、`mobile`、`gray`、`blue`、`warm`。按提供者要求设置瓦片大小、层级偏移及最大原生层级，确保其坐标投影与地图一致。没有配置地址的入口仍显示界面演示背景。

`src/basemaps.local.json` 和 `.env*` 已加入 Git 忽略规则；配置模板的地址字段保持为空。**本地配置会被 Vite 打进浏览器构建产物**，因此它只是避免提交到 Git 的方式，不是前端密钥保密机制。分享构建产物或部署前，应确认其中的地址和凭据允许公开；需要保密的凭据应放到服务端。
