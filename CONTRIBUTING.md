## 如何提交（新手友好版）

这份文档的目标：让你在项目变大以后，依然能通过 git 记录快速回答：
- **我改了什么？**
- **为什么改？**
- **影响了哪里？**
- **怎么验证？**

> 约定：本项目推荐使用 **Conventional Commits**（约定式提交信息）。

---

## 1) Commit Message 你要怎么写（最重要）

### 1.1 统一格式

```
<type>(<scope>): <subject>

<body 可选：为什么改/怎么改/影响点>
<footer 可选：关联 issue/破坏性变更>
```

你可以把它理解为一句“目录清晰的标题”，可选再补一段“原因与风险说明”。

### 1.2 type 怎么选（什么时候用哪个）
- **feat**：新增功能（用户能感知到的新能力）
- **fix**：修 Bug（让行为变正确）
- **docs**：只改文档（README/PRD/UED/ADR/注释等）
- **refactor**：重构（不改变功能，只改善结构）
- **style**：格式（不改逻辑，例如 prettier/空格/分号）
- **test**：测试相关（新增/修改测试）
- **chore**：杂项（依赖、脚本、配置、CI）

### 1.3 scope 怎么写（新手最容易纠结的点）
scope 就写“你改动所在的模块/领域”，尽量短：
- `courses`、`qa`、`home`、`plan`、`progress`、`profile`
- `shared-api`（公共请求层）
- `app`（应用入口、路由）
- `ui`（通用 UI 组件）

如果不确定，先写模块名：例如你改 `src/modules/courses/**` 就用 `courses`。

---

## 2) 直接可复制的好例子（结合你现在的项目）

### 2.1 课程模块（courses）
- `feat(courses): add course list page`
- `feat(courses): add course detail page`
- `fix(courses): show not-found message for invalid course id`
- `refactor(courses): split api layer from pages`
- `docs(courses): add prd and ued for courses module`

### 2.2 公共请求层（shared/api）
- `refactor(shared-api): wrap mock errors in ApiError`
- `feat(shared-api): add jittered mock delay for realism`

### 2.3 路由与入口（app）
- `feat(app): register courses routes`
- `fix(app): add fallback route to NotFoundPage`

### 2.4 文档与流程
- `docs: add contributing guide and pr template`
- `docs(adr): record decision for mock request layer`
- `chore: update eslint rules`

---

## 3) 坏例子 vs 好例子（请避开这些坑）

### 3.1 “坏例子”（后期很难维护）
- `update`
- `wip`
- `fix bug`
- `changes`

### 3.2 “好例子”（别人一看就懂）
- `fix(courses): avoid state update after unmount on detail page`
- `feat(courses): link course list items to detail route`

---

## 4) 一个功能应该怎么拆提交（示范：课程列表→详情）

推荐拆法（从“最能独立通过/回滚的改动”到“补齐说明”）：
- **提交 A（feat）**：新增页面骨架 + 路由能跑通
  - `feat(app): register courses routes`
- **提交 B（feat/refactor）**：加入数据层与 mock 数据，让页面有内容
  - `feat(courses): add courses api backed by mock data`
- **提交 C（fix）**：补齐边界与状态（loading/not found）
  - `fix(courses): handle missing course in detail page`
- **提交 D（docs）**：把“为什么这样做”写下来（PRD/UED/ADR）
  - `docs(courses): add prd and ued for courses module`

你不需要每次都拆这么细，但“功能 + 边界 + 文档”这三个层次最好都覆盖到。

---

## 5) 提交前自检清单（强烈建议新手照着勾）
- [ ] 我能用一句话解释这次提交的“目的”（为什么改）
- [ ] 我没有把无关格式化混到逻辑改动里（能减少 review 成本）
- [ ] 我跑过 `npm run lint`（至少在你改过代码的当天跑一次）
- [ ] 我手动点过关键路径（例如 `/courses`、`/courses/:id`）
- [ ] 如果我做了关键决策（会影响后续开发），我补了 ADR（见 `docs/adr/`）

