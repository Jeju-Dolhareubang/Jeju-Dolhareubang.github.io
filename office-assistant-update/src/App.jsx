import { useEffect, useRef, useState } from 'react'
import './App.css'
import OfficeMascot from './components/OfficeMascot'
import './components/OfficeMascot.css'

const helpTopics = [
  { keywords: ['프로젝트', '작업', '포트폴리오'], target: 'projects', message: '프로젝트를 보여드릴게요.' },
  { keywords: ['경력', '회사', '이력'], target: 'career', message: '경력으로 이동할게요.' },
  { keywords: ['툴', '도구', '스킬', '기술'], target: 'skills', message: '사용 툴을 보여드릴게요.' },
  { keywords: ['연락', '연락처', '메일', '이메일'], target: 'contact', message: '연락처로 이동할게요.' },
]

function OfficeAssistant() {
  const [presence, setPresence] = useState('entering')
  const [open, setOpen] = useState(false)
  const [openOnArrival, setOpenOnArrival] = useState(false)
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('무엇을 도와 드릴까요?')
  const [optionsOpen, setOptionsOpen] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [previewRequest, setPreviewRequest] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (presence !== 'entering' && presence !== 'exiting') return undefined
    const duration = presence === 'entering' ? 1650 : 1450
    const timer = window.setTimeout(() => {
      if (presence === 'entering') {
        setPresence('visible')
        if (openOnArrival) {
          setOpen(true)
          setOpenOnArrival(false)
        }
      } else setPresence('hidden')
    }, duration)
    return () => window.clearTimeout(timer)
  }, [presence, openOnArrival])

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  const search = () => {
    const text = query.trim().toLowerCase()
    if (!text) return setMessage('찾고 싶은 내용을 입력해주세요.')
    const topic = helpTopics.find(({ keywords }) => keywords.some((keyword) => text.includes(keyword)))
    if (!topic) return setMessage(`'${query}'에 대한 도움말을 찾지 못했습니다.`)
    setMessage(topic.message)
    document.getElementById(topic.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const showAssistant = () => {
    setOpenOnArrival(true)
    setPresence('entering')
  }
  const hideAssistant = () => {
    setOpen(false)
    setOptionsOpen(false)
    setPresence('exiting')
  }
  if (presence === 'hidden') return <button className="help-menu" onClick={showAssistant}>도움말(H) <span>▾</span><small>Office 길잡이 표시</small></button>
  return <aside className="office-assistant" aria-label="Office 길잡이">
    {open && <div className="assistant-dialog" role="dialog" aria-label="Office 길잡이 도움말" onKeyDown={(event) => { if (event.key === 'Escape') setOpen(false) }}>
      <button className="dialog-close" onClick={() => setOpen(false)} aria-label="닫기">×</button>
      <p className="assistant-message">{message}</p>
      <label htmlFor="assistant-search">궁금한 내용을 입력하세요.</label>
      <div className="search-row"><input ref={inputRef} id="assistant-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') search(); if (event.key === 'Escape') setOpen(false) }} placeholder="예: 프로젝트, 경력" /><button onClick={search}>찾기(S)</button></div>
      <button className="options-button" aria-expanded={optionsOpen} aria-controls="assistant-options" onClick={() => setOptionsOpen((value) => !value)}>옵션(O)</button>
      {optionsOpen && <div className="assistant-options" id="assistant-options">
        <label><input type="checkbox" checked={animationsEnabled} onChange={(event) => setAnimationsEnabled(event.target.checked)} />랜덤 동작 자동 재생</label>
        <p>검색 중에는 쉬고, 말풍선을 닫으면 다시 움직여요.</p>
        <button onClick={() => { setOptionsOpen(false); setOpen(false); setPreviewRequest((value) => value + 1) }}>다른 동작 보기</button>
      </div>}
    </div>}
    <button className="mascot-button" disabled={presence !== 'visible'} onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Office 길잡이 열기 또는 닫기"><OfficeMascot paused={open || presence !== 'visible'} enabled={animationsEnabled} previewRequest={previewRequest} appearance={presence} /></button>
    <button className="hide-button" disabled={presence !== 'visible'} onClick={hideAssistant}>{presence === 'exiting' ? '집으로 돌아가는 중…' : '길잡이 숨기기'}</button>
  </aside>
}

function App() {
  return <><header className="topbar"><a href="#home" className="brand">J. KIM</a><nav><a href="#projects">프로젝트</a><a href="#career">경력</a><a href="#skills">사용 툴</a><a href="#contact">연락처</a></nav></header><main>
    <section id="home" className="hero-section"><p className="eyebrow">DIGITAL PRODUCT DESIGNER</p><h1>명확한 경험을<br />만드는 사람입니다.</h1><p className="intro">디자인과 개발 사이를 연결하며, 오래 기억되는 디지털 경험을 만듭니다.</p></section>
    <section id="projects"><p className="eyebrow">SELECTED WORK</p><h2>프로젝트</h2><div className="project-grid"><article><span>01</span><h3>금융 서비스 리디자인</h3><p>복잡한 정보를 더 빠르게 이해하도록 바꾼 모바일 경험.</p></article><article><span>02</span><h3>브랜드 커머스 플랫폼</h3><p>취향과 구매 순간을 자연스럽게 연결한 온라인 스토어.</p></article></div></section>
    <section id="career" className="split"><div><p className="eyebrow">CAREER</p><h2>경력</h2></div><div className="timeline"><p><b>2023 — 현재</b> Product Designer · Studio One</p><p><b>2020 — 2023</b> UX Designer · Digital Works</p></div></section>
    <section id="skills"><p className="eyebrow">TOOLKIT</p><h2>사용 툴</h2><div className="chips"><span>Figma</span><span>React</span><span>JavaScript</span><span>Framer</span><span>Notion</span></div></section>
    <section id="contact" className="contact"><p className="eyebrow">LET'S TALK</p><h2>새로운 이야기를<br />기다리고 있습니다.</h2><a href="mailto:hello@example.com">hello@example.com ↗</a></section>
  </main><OfficeAssistant /></>
}
export default App
