## Changelog

本项目的变更记录遵循 [Keep a Changelog](https://keepachangelog.com/) 的结构（Added/Changed/Fixed 等）。

写法建议（新手版）：
- **用户能感知的变化**（新增功能/修复 bug/明显 UI 改动）：记到 Changelog
- **纯重构**：可以不写，或者写到 Changed（看团队要求）
- **每次合并 PR**：如果是“功能级”PR，建议补 1~3 条

---

## [Unreleased]

### Added
- Courses: course list page (`/courses`)
- Courses: course detail page (`/courses/:id`)

### Fixed
- Courses: show fallback message when course is missing

### Changed
- API: use `mockRequest` wrapper for mock calls

