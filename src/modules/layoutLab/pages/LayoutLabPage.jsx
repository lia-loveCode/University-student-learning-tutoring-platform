import { useMemo, useState } from 'react'
import styles from './LayoutLabPage.module.css'

function cssPropToJs(prop) {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function jsPropToCss(prop) {
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}

function normalizeRule(rule) {
  const cssProp = rule.cssProp ?? jsPropToCss(rule.prop)
  const prop = rule.prop ?? cssPropToJs(cssProp)
  return { ...rule, cssProp, prop }
}

function applyRulesToStyle(rules) {
  const style = {}
  for (const r of rules) style[r.prop] = r.value
  return style
}

function buildCssBlock(selector, rules, propOrder = []) {
  if (!rules.length) return ''

  const orderIndex = new Map(propOrder.map((p, i) => [p, i]))
  const lines = [...rules]
    .sort((a, b) => {
      const ai = orderIndex.has(a.cssProp) ? orderIndex.get(a.cssProp) : 9999
      const bi = orderIndex.has(b.cssProp) ? orderIndex.get(b.cssProp) : 9999
      if (ai !== bi) return ai - bi
      return a.cssProp.localeCompare(b.cssProp)
    })
    .map((r) => `  ${r.cssProp}: ${r.value};`)
  return `${selector} {\n${lines.join('\n')}\n}`
}

function RuleGroup({ title, rules, activeRules, onToggle }) {
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <div className={styles.ruleGrid}>
        {rules.map((rule) => {
          const r = normalizeRule(rule)
          const isActive = activeRules.some(
            (x) => x.target === r.target && x.group === r.group && x.prop === r.prop && x.value === r.value,
          )
          return (
            <button
              key={`${r.target}:${r.group}:${r.prop}:${r.value}`}
              type="button"
              className={isActive ? styles.ruleBtnActive : styles.ruleBtn}
              onClick={() => onToggle(r, !isActive)}
              title={r.hint ?? ''}
            >
              <span className={styles.ruleBtnText}>
                <code>
                  {r.cssProp}: {r.value}
                </code>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 900)
    } catch {
      setCopied(false)
    }
  }

  return (
    <button type="button" className={copied ? styles.copyBtnOk : styles.copyBtn} onClick={handleCopy}>
      {copied ? '已复制' : '复制 CSS'}
    </button>
  )
}

function AxisOverlay({ direction }) {
  const isRow = direction === 'row' || direction === 'row-reverse'
  const mainLabel = isRow ? 'Main axis（主轴）→' : 'Main axis（主轴）↓'
  const crossLabel = isRow ? 'Cross axis（侧轴）↓' : 'Cross axis（侧轴）→'

  return (
    <div className={styles.axisOverlay} aria-hidden="true">
      <div className={isRow ? styles.axisMainLineRow : styles.axisMainLineCol} />
      <div className={isRow ? styles.axisCrossLineRow : styles.axisCrossLineCol} />
      <div className={isRow ? styles.axisMainRow : styles.axisMainCol}>{mainLabel}</div>
      <div className={isRow ? styles.axisCrossRow : styles.axisCrossCol}>{crossLabel}</div>
    </div>
  )
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: 'flex', label: 'Flex 学习' },
    { id: 'grid', label: 'Grid 学习' },
    { id: 'centering', label: '垂直居中对比' },
  ]
  return (
    <div className={styles.tabs} role="tablist" aria-label="Layout lab tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={active === t.id ? styles.tabActive : styles.tab}
          onClick={() => onChange(t.id)}
          role="tab"
          aria-selected={active === t.id}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function CenteringPanel() {
  const strategies = [
    {
      id: 'flex',
      label: 'display:flex + align-items/justify-content',
      note: '最常用；对未知尺寸内容也友好。',
      outer: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
      inner: {},
      css: [
        `.outer {`,
        `  display: flex;`,
        `  align-items: center;`,
        `  justify-content: center;`,
        `}`,
      ].join('\n'),
    },
    {
      id: 'grid',
      label: 'display:grid + place-items:center',
      note: '写法最短；语义清晰。',
      outer: { display: 'grid', placeItems: 'center' },
      inner: {},
      css: [`.outer {`, `  display: grid;`, `  place-items: center;`, `}`].join('\n'),
    },
    {
      id: 'abs-transform',
      label: 'position:absolute + transform',
      note: '经典方案；需要父容器定位，且元素脱离文档流。',
      outer: { position: 'relative' },
      inner: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      },
      css: [
        `.outer {`,
        `  position: relative;`,
        `}`,
        ``,
        `.inner {`,
        `  position: absolute;`,
        `  top: 50%;`,
        `  left: 50%;`,
        `  transform: translate(-50%, -50%);`,
        `}`,
      ].join('\n'),
    },
    {
      id: 'abs-inset-margin',
      label: 'position:absolute + inset:0 + margin:auto（定宽高）',
      note: '需要 inner 有明确宽高；否则无法计算 auto margin。',
      outer: { position: 'relative' },
      inner: {
        position: 'absolute',
        inset: 0,
        margin: 'auto',
        width: 180,
        height: 100,
      },
      css: [
        `.outer {`,
        `  position: relative;`,
        `}`,
        ``,
        `.inner {`,
        `  position: absolute;`,
        `  inset: 0;`,
        `  margin: auto;`,
        `  width: 180px;`,
        `  height: 100px;`,
        `}`,
      ].join('\n'),
    },
    {
      id: 'line-height',
      label: 'line-height（单行文本）',
      note: '只适合单行文本；多行会失败。',
      outer: { lineHeight: '220px', textAlign: 'center' },
      inner: { display: 'inline-block', lineHeight: 'normal' },
      css: [
        `.outer {`,
        `  line-height: 220px;`,
        `  text-align: center;`,
        `}`,
        ``,
        `.inner {`,
        `  display: inline-block;`,
        `  line-height: normal;`,
        `}`,
      ].join('\n'),
    },
  ]

  const [active, setActive] = useState('flex')
  const s = strategies.find((x) => x.id === active) ?? strategies[0]

  return (
    <div className={styles.centeringShell}>
      <div className={styles.centeringLeft}>
        <h2 className={styles.h2}>垂直居中策略</h2>
        <p className={styles.subtle}>
          点按钮切换策略，立即观察效果与代码差异。
        </p>
        <div className={styles.strategyList}>
          {strategies.map((x) => (
            <button
              key={x.id}
              type="button"
              className={x.id === active ? styles.strategyBtnActive : styles.strategyBtn}
              onClick={() => setActive(x.id)}
            >
              <div className={styles.strategyTitle}>
                <code>{x.label}</code>
              </div>
              <div className={styles.strategyNote}>{x.note}</div>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.centeringMid}>
        <h3 className={styles.h3}>预览</h3>
        <div className={styles.centeringOuter} style={s.outer}>
          <div className={styles.centeringInner} style={s.inner}>
            {s.id === 'line-height' ? '单行文字' : 'Inner'}
          </div>
        </div>
        <div className={styles.centeringHint}>
          <span className={styles.badge}>限制</span>
          <span>{s.note}</span>
        </div>
      </div>

      <div className={styles.centeringRight}>
        <div className={styles.codeHeader}>
          <h3 className={styles.h3}>代码</h3>
          <CopyButton text={s.css} />
        </div>
        <pre className={styles.code}>
          <code>{s.css}</code>
        </pre>
      </div>
    </div>
  )
}

export default function LayoutLabPage() {
  const [tab, setTab] = useState('flex')
  const [rules, setRules] = useState(() => [])
  const [itemCount, setItemCount] = useState(5)
  const [sizeMode, setSizeMode] = useState('mixed')

  function clearRules() {
    setRules([])
  }

  function toggleRule(rule, nextOn) {
    setRules((prev) => {
      const normalized = normalizeRule(rule)
      const sameGroup = (x) =>
        x.target === normalized.target && x.group === normalized.group && x.prop === normalized.prop

      if (!nextOn) {
        return prev.filter((x) => !(sameGroup(x) && x.value === normalized.value))
      }

      const filtered = prev.filter((x) => !sameGroup(x))
      return [...filtered, normalized]
    })
  }

  const activeRules = useMemo(() => {
    if (tab === 'flex') return rules.filter((r) => r.scope !== 'grid')
    if (tab === 'grid') return rules.filter((r) => r.scope !== 'flex')
    return []
  }, [rules, tab])

  const containerRules = activeRules.filter((r) => r.target === 'container')
  const itemRules = activeRules.filter((r) => r.target === 'item')

  const containerStyle = useMemo(() => applyRulesToStyle(containerRules), [containerRules])
  const itemStyle = useMemo(() => applyRulesToStyle(itemRules), [itemRules])

  const flexDirection = containerStyle.flexDirection ?? 'row'

  const containerCssOrder = tab === 'flex'
    ? [
        'display',
        'flex-direction',
        'flex-wrap',
        'justify-content',
        'align-items',
        'align-content',
        'gap',
      ]
    : [
        'display',
        'grid-template-columns',
        'grid-auto-rows',
        'place-items',
        'justify-items',
        'align-items',
        'justify-content',
        'align-content',
        'gap',
      ]

  const itemCssOrder = tab === 'flex'
    ? ['order', 'flex', 'align-self']
    : ['grid-column', 'grid-row', 'place-self', 'justify-self', 'align-self']

  const cssText = useMemo(() => {
    if (tab === 'centering') return ''
    const a = buildCssBlock('.container', containerRules, containerCssOrder)
    const b = buildCssBlock('.item', itemRules, itemCssOrder)
    return [a, b].filter(Boolean).join('\n\n')
  }, [containerRules, containerCssOrder, itemRules, itemCssOrder, tab])

  const flexRuleGroups = [
    {
      title: 'Flex 容器（container）',
      rules: [
        { target: 'container', scope: 'flex', group: 'display', cssProp: 'display', value: 'flex' },
        { target: 'container', scope: 'flex', group: 'display', cssProp: 'display', value: 'inline-flex' },
        { target: 'container', scope: 'flex', group: 'flex-direction', cssProp: 'flex-direction', value: 'row' },
        { target: 'container', scope: 'flex', group: 'flex-direction', cssProp: 'flex-direction', value: 'row-reverse' },
        { target: 'container', scope: 'flex', group: 'flex-direction', cssProp: 'flex-direction', value: 'column' },
        { target: 'container', scope: 'flex', group: 'flex-direction', cssProp: 'flex-direction', value: 'column-reverse' },
        { target: 'container', scope: 'flex', group: 'flex-wrap', cssProp: 'flex-wrap', value: 'nowrap' },
        { target: 'container', scope: 'flex', group: 'flex-wrap', cssProp: 'flex-wrap', value: 'wrap' },
        { target: 'container', scope: 'flex', group: 'flex-wrap', cssProp: 'flex-wrap', value: 'wrap-reverse' },
        { target: 'container', scope: 'flex', group: 'justify-content', cssProp: 'justify-content', value: 'flex-start' },
        { target: 'container', scope: 'flex', group: 'justify-content', cssProp: 'justify-content', value: 'center' },
        { target: 'container', scope: 'flex', group: 'justify-content', cssProp: 'justify-content', value: 'flex-end' },
        { target: 'container', scope: 'flex', group: 'justify-content', cssProp: 'justify-content', value: 'space-between' },
        { target: 'container', scope: 'flex', group: 'justify-content', cssProp: 'justify-content', value: 'space-around' },
        { target: 'container', scope: 'flex', group: 'justify-content', cssProp: 'justify-content', value: 'space-evenly' },
        { target: 'container', scope: 'flex', group: 'align-items', cssProp: 'align-items', value: 'stretch' },
        { target: 'container', scope: 'flex', group: 'align-items', cssProp: 'align-items', value: 'flex-start' },
        { target: 'container', scope: 'flex', group: 'align-items', cssProp: 'align-items', value: 'center' },
        { target: 'container', scope: 'flex', group: 'align-items', cssProp: 'align-items', value: 'flex-end' },
        { target: 'container', scope: 'flex', group: 'align-items', cssProp: 'align-items', value: 'baseline' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'stretch' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'flex-start' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'center' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'flex-end' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'space-between' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'space-around' },
        { target: 'container', scope: 'flex', group: 'align-content', cssProp: 'align-content', value: 'space-evenly' },
      ],
    },
    {
      title: '间距（gap）',
      rules: [
        { target: 'container', scope: 'flex', group: 'gap', cssProp: 'gap', value: '0' },
        { target: 'container', scope: 'flex', group: 'gap', cssProp: 'gap', value: '8px' },
        { target: 'container', scope: 'flex', group: 'gap', cssProp: 'gap', value: '16px' },
        { target: 'container', scope: 'flex', group: 'gap', cssProp: 'gap', value: '24px' },
      ],
    },
    {
      title: 'Flex 子项（item）',
      rules: [
        { target: 'item', scope: 'flex', group: 'flex', cssProp: 'flex', value: '0 0 auto' },
        { target: 'item', scope: 'flex', group: 'flex', cssProp: 'flex', value: '1 1 0' },
        { target: 'item', scope: 'flex', group: 'align-self', cssProp: 'align-self', value: 'auto' },
        { target: 'item', scope: 'flex', group: 'align-self', cssProp: 'align-self', value: 'flex-start' },
        { target: 'item', scope: 'flex', group: 'align-self', cssProp: 'align-self', value: 'center' },
        { target: 'item', scope: 'flex', group: 'align-self', cssProp: 'align-self', value: 'flex-end' },
        { target: 'item', scope: 'flex', group: 'align-self', cssProp: 'align-self', value: 'stretch' },
        { target: 'item', scope: 'flex', group: 'align-self', cssProp: 'align-self', value: 'baseline' },
        { target: 'item', scope: 'flex', group: 'order', cssProp: 'order', value: '-1' },
        { target: 'item', scope: 'flex', group: 'order', cssProp: 'order', value: '0' },
        { target: 'item', scope: 'flex', group: 'order', cssProp: 'order', value: '1' },
      ],
    },
  ]

  const gridRuleGroups = [
    {
      title: 'Grid 容器（container）',
      rules: [
        { target: 'container', scope: 'grid', group: 'display', cssProp: 'display', value: 'grid' },
        { target: 'container', scope: 'grid', group: 'display', cssProp: 'display', value: 'inline-grid' },
        { target: 'container', scope: 'grid', group: 'grid-template-columns', cssProp: 'grid-template-columns', value: 'repeat(3, 1fr)' },
        { target: 'container', scope: 'grid', group: 'grid-template-columns', cssProp: 'grid-template-columns', value: 'repeat(4, 1fr)' },
        { target: 'container', scope: 'grid', group: 'grid-template-columns', cssProp: 'grid-template-columns', value: '200px 1fr 1fr' },
        { target: 'container', scope: 'grid', group: 'grid-auto-rows', cssProp: 'grid-auto-rows', value: '60px' },
        { target: 'container', scope: 'grid', group: 'grid-auto-rows', cssProp: 'grid-auto-rows', value: '90px' },
        { target: 'container', scope: 'grid', group: 'justify-items', cssProp: 'justify-items', value: 'stretch' },
        { target: 'container', scope: 'grid', group: 'justify-items', cssProp: 'justify-items', value: 'start' },
        { target: 'container', scope: 'grid', group: 'justify-items', cssProp: 'justify-items', value: 'center' },
        { target: 'container', scope: 'grid', group: 'justify-items', cssProp: 'justify-items', value: 'end' },
        { target: 'container', scope: 'grid', group: 'align-items', cssProp: 'align-items', value: 'stretch' },
        { target: 'container', scope: 'grid', group: 'align-items', cssProp: 'align-items', value: 'start' },
        { target: 'container', scope: 'grid', group: 'align-items', cssProp: 'align-items', value: 'center' },
        { target: 'container', scope: 'grid', group: 'align-items', cssProp: 'align-items', value: 'end' },
        { target: 'container', scope: 'grid', group: 'place-items', cssProp: 'place-items', value: 'center' },
        { target: 'container', scope: 'grid', group: 'justify-content', cssProp: 'justify-content', value: 'start' },
        { target: 'container', scope: 'grid', group: 'justify-content', cssProp: 'justify-content', value: 'center' },
        { target: 'container', scope: 'grid', group: 'justify-content', cssProp: 'justify-content', value: 'end' },
        { target: 'container', scope: 'grid', group: 'justify-content', cssProp: 'justify-content', value: 'space-between' },
        { target: 'container', scope: 'grid', group: 'justify-content', cssProp: 'justify-content', value: 'space-around' },
        { target: 'container', scope: 'grid', group: 'justify-content', cssProp: 'justify-content', value: 'space-evenly' },
        { target: 'container', scope: 'grid', group: 'align-content', cssProp: 'align-content', value: 'start' },
        { target: 'container', scope: 'grid', group: 'align-content', cssProp: 'align-content', value: 'center' },
        { target: 'container', scope: 'grid', group: 'align-content', cssProp: 'align-content', value: 'end' },
        { target: 'container', scope: 'grid', group: 'align-content', cssProp: 'align-content', value: 'space-between' },
        { target: 'container', scope: 'grid', group: 'align-content', cssProp: 'align-content', value: 'space-around' },
        { target: 'container', scope: 'grid', group: 'align-content', cssProp: 'align-content', value: 'space-evenly' },
      ],
    },
    {
      title: '间距（gap）',
      rules: [
        { target: 'container', scope: 'grid', group: 'gap', cssProp: 'gap', value: '0' },
        { target: 'container', scope: 'grid', group: 'gap', cssProp: 'gap', value: '8px' },
        { target: 'container', scope: 'grid', group: 'gap', cssProp: 'gap', value: '16px' },
        { target: 'container', scope: 'grid', group: 'gap', cssProp: 'gap', value: '24px' },
      ],
    },
    {
      title: 'Grid 子项（item）',
      rules: [
        { target: 'item', scope: 'grid', group: 'justify-self', cssProp: 'justify-self', value: 'stretch' },
        { target: 'item', scope: 'grid', group: 'justify-self', cssProp: 'justify-self', value: 'start' },
        { target: 'item', scope: 'grid', group: 'justify-self', cssProp: 'justify-self', value: 'center' },
        { target: 'item', scope: 'grid', group: 'justify-self', cssProp: 'justify-self', value: 'end' },
        { target: 'item', scope: 'grid', group: 'align-self', cssProp: 'align-self', value: 'stretch' },
        { target: 'item', scope: 'grid', group: 'align-self', cssProp: 'align-self', value: 'start' },
        { target: 'item', scope: 'grid', group: 'align-self', cssProp: 'align-self', value: 'center' },
        { target: 'item', scope: 'grid', group: 'align-self', cssProp: 'align-self', value: 'end' },
        { target: 'item', scope: 'grid', group: 'place-self', cssProp: 'place-self', value: 'center' },
      ],
    },
  ]

  const visibleGroups = tab === 'flex' ? flexRuleGroups : tab === 'grid' ? gridRuleGroups : []

  const items = useMemo(() => {
    const base = Array.from({ length: itemCount }, (_, i) => i + 1)
    if (sizeMode === 'equal') return base.map((n) => ({ key: n, w: 80, h: 56 }))
    const sizes = [
      { w: 70, h: 44 },
      { w: 92, h: 66 },
      { w: 64, h: 54 },
      { w: 110, h: 48 },
      { w: 76, h: 78 },
      { w: 88, h: 52 },
      { w: 58, h: 64 },
      { w: 102, h: 58 },
    ]
    return base.map((n, idx) => ({ key: n, ...sizes[idx % sizes.length] }))
  }, [itemCount, sizeMode])

  const defaultDisplayRule =
    tab === 'flex'
      ? { target: 'container', scope: 'flex', group: 'display', cssProp: 'display', value: 'flex' }
      : { target: 'container', scope: 'grid', group: 'display', cssProp: 'display', value: 'grid' }

  const effectiveContainerStyle =
    containerStyle.display ? containerStyle : { ...containerStyle, display: defaultDisplayRule.value }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.h1}>布局实验室（Flex / Grid）</h1>
          <div className={styles.headerActions}>
            {tab !== 'centering' && <CopyButton text={cssText} />}
            <button type="button" className={styles.resetBtn} onClick={clearRules}>
              Reset
            </button>
          </div>
        </div>
        <p className={styles.subtle}>
          点击左侧按钮添加/替换 CSS 规则，观察预览区变化；Flex 会显示主轴/侧轴方向。
        </p>
        <TabBar active={tab} onChange={setTab} />
      </header>

      {tab === 'centering' ? (
        <CenteringPanel />
      ) : (
        <div className={styles.shell}>
          <aside className={styles.left}>
            <div className={styles.controls}>
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>items</span>
                <div className={styles.pills}>
                  {[3, 5, 8].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={itemCount === n ? styles.pillActive : styles.pill}
                      onClick={() => setItemCount(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>尺寸</span>
                <div className={styles.pills}>
                  <button
                    type="button"
                    className={sizeMode === 'mixed' ? styles.pillActive : styles.pill}
                    onClick={() => setSizeMode('mixed')}
                  >
                    不等尺寸
                  </button>
                  <button
                    type="button"
                    className={sizeMode === 'equal' ? styles.pillActive : styles.pill}
                    onClick={() => setSizeMode('equal')}
                  >
                    等尺寸
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.groups}>
              {visibleGroups.map((g) => (
                <RuleGroup
                  key={g.title}
                  title={g.title}
                  rules={g.rules}
                  activeRules={activeRules}
                  onToggle={toggleRule}
                />
              ))}
            </div>
          </aside>

          <section className={styles.mid}>
            <div className={styles.previewHeader}>
              <h2 className={styles.h2}>预览</h2>
              {tab === 'flex' && (
                <div className={styles.axisExplain}>
                  <span className={styles.badge}>main axis</span>
                  <span className={styles.badge2}>cross axis</span>
                  <span className={styles.subtleSmall}>
                    当前 <code>flex-direction</code>：<code>{flexDirection}</code>
                  </span>
                </div>
              )}
            </div>

            <div className={styles.previewStage}>
              <div className={styles.containerWrap}>
                {tab === 'flex' && <AxisOverlay direction={flexDirection} />}
                <div className={styles.container} style={effectiveContainerStyle}>
                  {items.map((it) => (
                    <div
                      key={it.key}
                      className={styles.item}
                      style={{
                        ...itemStyle,
                        width: it.w,
                        height: it.h,
                      }}
                    >
                      {it.key}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <aside className={styles.right}>
            <div className={styles.codeHeader}>
              <h2 className={styles.h2}>当前 CSS</h2>
              <CopyButton text={cssText} />
            </div>
            <pre className={styles.code}>
              <code>
                {cssText || '（暂无规则）\n\n提示：先点一个 display 按钮开始。'}
              </code>
            </pre>
          </aside>
        </div>
      )}
    </div>
  )
}

