import { useEffect, useMemo, useState } from 'react'
import { createQuestion, listQuestions } from '../api/qaApi.js'
import styles from './QAPage.module.css'

export default function QAPage() {
  const [questions, setQuestions] = useState([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('课程答疑')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    let alive = true
    listQuestions().then((data) => {
      if (alive) setQuestions(data)
    })
    return () => {
      alive = false
    }
  }, [])

  const parsedTags = useMemo(() => {
    return tags
      .split(/[,，\s]+/g)
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5)
  }, [tags])

  async function onSubmit(e) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const q = await createQuestion({
      title: trimmedTitle,
      category,
      content: content.trim(),
      tags: parsedTags,
    })
    setQuestions((prev) => [q, ...prev])
    setTitle('')
    setTags('')
    setContent('')
  }

  return (
    <section>
      <h1>提问</h1>
      <p className={styles.subtle}>
        发布问题后会出现在列表顶部（当前为 Mock 接口）。
      </p>

      <form
        onSubmit={onSubmit}
        className={styles.form}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="问题标题（必填）"
          className={styles.input}
        />
        <div className={styles.row}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
          >
            <option value="课程答疑">课程答疑</option>
            <option value="考研">考研</option>
            <option value="考证">考证</option>
            <option value="其他">其他</option>
          </select>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签（用空格或逗号分隔，最多 5 个）"
            className={styles.tagInput}
          />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="问题描述（可选）"
          rows={4}
          className={styles.textarea}
        />
        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.primaryBtn}
          >
            发布问题
          </button>
        </div>
      </form>

      <div className={styles.list}>
        {questions.map((q) => (
          <article
            key={q.id}
            className={styles.card}
          >
            <div className={styles.title}>{q.title}</div>
            <div className={styles.meta}>
              <span className={styles.category}>{q.category}</span>
              <span>提问者：{q.author}</span>
              <span>回答：{q.answers?.length ?? 0}</span>
              <span>浏览：{q.views}</span>
              <span>{q.createdAt}</span>
            </div>
            {q.tags?.length ? (
              <div className={styles.tags}>
                {q.tags.map((t) => (
                  <span
                    key={t}
                    className={styles.tag}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
        {questions.length === 0 ? (
          <div className={styles.subtle}>还没有问题，快来发布第一个问题吧。</div>
        ) : null}
      </div>
    </section>
  )
}

