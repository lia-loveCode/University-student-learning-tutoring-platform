import { useEffect, useMemo, useState } from 'react'
import { listCourses } from '../api/coursesApi.js'
import FilterControls from '../../../shared/ui/FilterControls/FilterControls.jsx'
import CourseCard from '../ui/CourseCard/CourseCard.jsx'
import styles from './CoursesPage.module.css'

const INLINE_THRESHOLD = 3

function uniq(arr) {
  return Array.from(new Set(arr))
}

function includesIgnoreCase(haystack, needle) {
  if (!needle) return true
  return String(haystack ?? '').toLowerCase().includes(String(needle).toLowerCase())
}

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState({ category: '', level: '' })

  useEffect(() => {
    let alive = true
    listCourses().then((data) => {
      if (alive) setCourses(data)
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setKeyword(keywordInput.trim()), 180)
    return () => clearTimeout(t)
  }, [keywordInput])

  const categoryOptions = useMemo(() => {
    const opts = uniq(courses.map((c) => c.category)).filter(Boolean)
    return [{ value: '', label: '全部' }, ...opts.map((v) => ({ value: v, label: v }))]
  }, [courses])

  const levelOptions = useMemo(() => {
    const opts = uniq(courses.map((c) => c.level)).filter(Boolean)
    return [{ value: '', label: '全部' }, ...opts.map((v) => ({ value: v, label: v }))]
  }, [courses])

  const filterDefs = useMemo(
    () => [
      { key: 'category', label: '分类', options: categoryOptions },
      { key: 'level', label: '难度', options: levelOptions },
    ],
    [categoryOptions, levelOptions],
  )

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (filters.category && c.category !== filters.category) return false
      if (filters.level && c.level !== filters.level) return false
      if (!keyword) return true
      return (
        includesIgnoreCase(c.title, keyword) ||
        includesIgnoreCase(c.author, keyword) ||
        includesIgnoreCase(c.category, keyword)
      )
    })
  }, [courses, filters.category, filters.level, keyword])

  const variant = filteredCourses.length <= INLINE_THRESHOLD ? 'inline' : 'panel'

  function onFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function resetAll() {
    setKeywordInput('')
    setKeyword('')
    setFilters({ category: '', level: '' })
  }

  return (
    <section className={styles.page}>
      <FilterControls
        title="课程列表"
        hint="支持搜索与筛选；当前使用本地 Mock 数据。"
        keyword={keywordInput}
        onKeywordChange={setKeywordInput}
        keywordPlaceholder="搜索课程标题 / 作者 / 分类…"
        filters={filters}
        filterDefs={filterDefs}
        onFilterChange={onFilterChange}
        onReset={resetAll}
        resultCount={filteredCourses.length}
        variant={variant}
        defaultPanelOpen={false}
      />

      {filteredCourses.length === 0 ? (
        <div className={styles.empty} role="status">
          <strong>没有匹配的课程</strong>
          <div>试试调整关键词，或清空筛选条件。</div>
          <div className={styles.emptyActions}>
            <button type="button" className={styles.resetBtn} onClick={resetAll}>
              重置
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.list} aria-label="课程列表">
          {filteredCourses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </section>
  )
}

