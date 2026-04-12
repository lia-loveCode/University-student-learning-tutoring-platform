## Use mockRequest as module API boundary

- **状态**：Accepted
- **日期**：2026-04-09
- **范围**：`shared-api` + 各业务模块 `modules/*/api`

## 背景（Context）
当前项目使用本地 mock 数据来快速搭建页面。但如果 UI 组件直接 import mock 数据：
- 未来接真实后端时，需要在多个页面里到处替换数据来源
- UI 层会知道“数据存在哪里/怎么请求”，耦合变强
- 难以统一模拟网络延迟、错误处理、返回 Promise 的异步行为

## 目标（Goals）
- UI 层只关心“拿到数据后怎么展示”，不关心“数据怎么来的”
- mock 阶段就保持与真实请求一致的 Promise 形态
- 统一延迟抖动、错误封装，便于后续替换为 HTTP

## 非目标（Non-goals）
- 不在本次决策里引入真实 HTTP 客户端（fetch/axios）
- 不规定各模块内部如何组织 mock 数据（文件名可自定）

## 可选方案（Options）
### 方案 A：页面直接 import mock 数据
- **描述**：`CoursesPage.jsx` 等页面直接 `import { courses } from ...`
- **优点**：最少代码、最快出页面
- **缺点**：
  - 后续换接口需要改 UI 多处
  - 无法统一模拟网络延迟/错误
  - UI 与存储细节强耦合

### 方案 B：模块提供 API（Promise），内部用 mockRequest 包装（选择）
- **描述**：页面只调用 `listCourses()` / `getCourseById()`；模块 API 内部通过 `mockRequest` 返回 Promise
- **优点**：
  - UI 与数据源解耦，后续切换真实 HTTP 改动集中在 `modules/*/api`
  - mock 阶段就能覆盖“加载态/竞态/错误态”这类真实场景
  - 错误封装可统一为 `ApiError`
- **缺点**：多一层文件与调用，但长期维护成本更低

## 决策（Decision）
我们选择：**方案 B**。

## 原因（Rationale）
项目会逐步变大，最常见的痛点是“到处散落的数据获取方式”。把“请求”收敛在模块 `api` 层，能显著降低未来接后端与维护的成本，并且符合 `shared/api/request.js` 的约束：**模块 api 返回 Promise，且不暴露存储细节给 UI**。

## 后果（Consequences）
- **正面**：
  - 页面更干净，只做展示与交互
  - 未来替换真实接口时，改动范围更可控
- **负面/代价**：
  - 开发初期文件数量稍多，需要遵守分层

## 影响范围（Impact）
- 新增模块 API 文件时，统一按 `src/modules/<name>/api/*Api.js` 组织
- 页面只 import 模块 API，不直接 import mock 数据

