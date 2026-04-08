export const initialQuestions = [
  {
    id: 'q1',
    title: 'React 的 useEffect 依赖数组应该怎么写才不踩坑？',
    category: '课程答疑',
    author: '小林',
    views: 3421,
    createdAt: '2026-04-07',
    tags: ['React', 'Hooks'],
    answers: [
      { id: 'a1', author: '王同学', content: '先确保依赖写全，再用 useMemo/useCallback 稳定引用。', createdAt: '2026-04-07' },
      { id: 'a2', author: '陈同学', content: '不要为了消除 eslint 警告乱删依赖，改造数据流更重要。', createdAt: '2026-04-08' },
    ],
  },
  {
    id: 'q2',
    title: '高数极限题有哪些常见套路？',
    category: '考研',
    author: '小周',
    views: 2104,
    createdAt: '2026-04-06',
    tags: ['高数', '极限'],
    answers: [{ id: 'a3', author: '李同学', content: '先识别未定式，再考虑等价无穷小/洛必达/泰勒。', createdAt: '2026-04-06' }],
  },
]

