## 目标

做一个可交互的学习页面，帮助直观理解：

- Flex 布局的主轴（main axis）与侧轴（cross axis），以及常用对齐属性在不同 `flex-direction` 下的表现差异
- Grid 布局的对齐/分布方式，以及与 Flex 在“对齐语义”上的差异
- 常见“垂直居中”方案的适用场景、代码写法差异、以及在页面上可一键切换对比

页面形式要求：

- 页面上有“属性全称”的按钮（例如 `align-items: center`）
- 点击后立刻在客户端预览区生效，并且右侧能看到当前生效的 CSS 代码（可复制）

路由入口：

- 新增路由：`/layout-lab`

---

## 用户体验（UX）与页面布局

采用三栏布局：

1. **左栏：属性面板（可点击按钮）**
   - 分组展示：Flex 容器、Flex 子项、Grid 容器、Grid 子项、间距与尺寸、垂直居中策略
   - 每个按钮显示完整声明：例如 `justify-content: center`
   - 点击行为：
     - **互斥组**：同一类属性（如 `justify-content`）只能同时生效一个值；点新值会替换旧值
     - **可叠加组**：如 `gap`、`padding`、`width/height` 可叠加
     - 再次点击同一个已选按钮：取消该规则
   - 提供 `Reset` 一键清空
   -（可选）提供 `Undo/Redo`，用于学习时回放

2. **中栏：实时预览区（最重要）**
   - 一个固定尺寸的“容器框”（container），内部多个“子元素块”（items）
   - 支持调节：
     - item 数量：3 / 5 / 8
     - item 尺寸模式：等宽等高 / 不等宽不等高（更容易看出对齐差异）
     - container 高度：固定高度（利于观察垂直方向对齐）
   - 主轴/侧轴可视化：
     - 根据当前 `display` 与方向（例如 `flex-direction`）动态标注 main axis / cross axis
     - 当 `flex-direction` 改变时，main/cross 标注自动翻转

3. **右栏：当前生效样式（代码可见、可复制）**
   - 展示当前对 container 与 items 生效的 CSS（按固定顺序输出，便于对比）
   - 展示已启用规则的“列表视图”（和代码同源）
   - 提供 Copy 按钮（复制 CSS 文本）

---

## Flex 学习模块（范围）

### Flex 容器（container）按钮清单

- `display: flex` / `display: inline-flex`
- `flex-direction: row | row-reverse | column | column-reverse`
- `flex-wrap: nowrap | wrap | wrap-reverse`
- `justify-content: flex-start | center | flex-end | space-between | space-around | space-evenly`
- `align-items: stretch | flex-start | center | flex-end | baseline`
- `align-content: stretch | flex-start | center | flex-end | space-between | space-around | space-evenly`（仅在 wrap 多行/多列明显）
- `gap: 0 | 8px | 16px | 24px`

### Flex 子项（items）按钮清单

- `flex: 0 0 auto`（默认对照）
- `flex: 1 1 0`（等分）
- `align-self: auto | flex-start | center | flex-end | stretch | baseline`
- `order: -1 | 0 | 1`

### 主轴/侧轴解释呈现

- 在预览区旁显示两行“实时解释”：
  - main axis：由 `flex-direction` 决定（row=水平，column=垂直）
  - cross axis：与主轴垂直
- 同时用视觉标注（箭头/文字）指向对应方向

---

## Grid 学习模块（范围）

### Grid 容器按钮清单

- `display: grid` / `display: inline-grid`
- `grid-template-columns: repeat(3, 1fr)` / `repeat(4, 1fr)` / `200px 1fr 1fr`
- `grid-auto-rows: 60px`（便于对齐观察）
- `gap: 0 | 8px | 16px | 24px`
- `justify-items: stretch | start | center | end`
- `align-items: stretch | start | center | end`
- `place-items: center`（作为 `align-items + justify-items` 的组合演示）
- `justify-content: start | center | end | space-between | space-around | space-evenly`
- `align-content: start | center | end | space-between | space-around | space-evenly`

### Grid 子项按钮清单

- `justify-self: stretch | start | center | end`
- `align-self: stretch | start | center | end`
- `place-self: center`

---

## 垂直居中策略对比模块（范围）

统一用一个“演示盒子”（outer）和一个“内容块”（inner），按钮切换不同策略，右侧输出对应代码。

要覆盖的策略（最少）：

1. **Flex 居中**
   - outer：`display:flex; align-items:center; justify-content:center;`
2. **Grid 居中**
   - outer：`display:grid; place-items:center;`
3. **绝对定位 + transform**
   - inner：`position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);`
4. **绝对定位 + inset + margin:auto（固定尺寸元素）**
   - inner：`position:absolute; inset:0; margin:auto; width:...; height:...;`
5. **line-height（单行文本）**
   - outer：`line-height: <height>;`（演示其局限性）

每个策略在 UI 上补充一行“适用条件/限制”（作为说明文本，不写进代码注释里）。

---

## 数据结构与实现约束（实现时遵循）

- 用一个统一的“规则模型”表示按钮状态：
  - `target`: `container | item | outer | inner`
  - `prop`: CSS property（如 `alignItems` 或 `align-items` 的标准化形式）
  - `value`: 字符串值
  - `group`: 互斥组 id（如 `justify-content`）
- 由规则模型派生：
  - React `style` 对象（用于实时预览）
  - CSS 文本（用于代码展示/复制）
- 不引入额外状态管理库；只用 React state 即可

---

## 路由与文件落点（预期）

- 新增页面组件：`src/modules/layoutLab/pages/LayoutLabPage.jsx`
-（可选）新增样式：`src/modules/layoutLab/pages/layoutLab.css` 或复用全局 `index.css`
- 在 `src/app/App.jsx` 增加路由：`<Route path="/layout-lab" element={<LayoutLabPage />} />`

---

## 成功标准（验收）

- 点击任意属性按钮，预览区样式立即变化，右侧 CSS 同步更新
- `flex-direction` 改变时，主轴/侧轴标注方向同步变化
- 垂直居中模块能在 5 种策略之间切换，并且每种策略的代码清晰可复制
