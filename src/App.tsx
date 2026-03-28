import { useCallback, useRef, useState } from 'react'
import { fetchQuestions, submitAnswers } from './api/gas'
import { questionCount } from './config'
import type { AnswerPayload, Choice, GamePhase, Question, SubmitResult } from './types'
import { HomeScreen } from './components/HomeScreen'
import { QuizScreen } from './components/QuizScreen'
import { ResultScreen } from './components/ResultScreen'

function emptyResult(): SubmitResult {
  return { ok: false }
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('home')
  const [playerId, setPlayerId] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [qi, setQi] = useState(0)
  const [answers, setAnswers] = useState<AnswerPayload[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SubmitResult>(emptyResult)
  const submitLock = useRef(false)

  const startGame = useCallback(async () => {
    const id = playerId.trim()
    if (!id) return
    setLoading(true)
    setResult(emptyResult())
    try {
      const list = await fetchQuestions(questionCount)
      if (list.length === 0) throw new Error('没有题目')
      setQuestions(list)
      setQi(0)
      setAnswers([])
      setPhase('quiz')
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      })
      setPhase('result')
    } finally {
      setLoading(false)
    }
  }, [playerId])

  const pick = useCallback(
    (choice: Choice) => {
      const q = questions[qi]
      if (!q) return
      const next = [...answers, { questionNo: q.questionNo, choice }]
      if (qi + 1 >= questions.length) {
        if (submitLock.current) return
        submitLock.current = true
        setLoading(true)
        void (async () => {
          try {
            const res = await submitAnswers(playerId.trim(), next)
            setResult(res)
          } catch (e) {
            setResult({
              ok: false,
              error: e instanceof Error ? e.message : String(e),
            })
          } finally {
            setLoading(false)
            submitLock.current = false
            setPhase('result')
          }
        })()
        return
      }
      setAnswers(next)
      setQi((i) => i + 1)
    },
    [answers, playerId, qi, questions],
  )

  return (
    <div className="arcade-shell">
      <div className="crt-bezel">
        <div className="crt-inner">
          <h1 className="title-pixel">PIXEL QUIZ<br />像素闯关</h1>

          {phase === 'home' && (
            <HomeScreen
              playerId={playerId}
              onIdChange={setPlayerId}
              onStart={startGame}
              loading={loading}
            />
          )}

          {phase === 'quiz' && questions[qi] && (
            <QuizScreen
              index={qi}
              total={questions.length}
              current={questions[qi]}
              onPick={pick}
            />
          )}

          {loading && phase === 'quiz' && (
            <div className="loading-curtain">提交成绩中…</div>
          )}

          {phase === 'result' && (
            <ResultScreen
              playerId={playerId.trim() || playerId}
              outcome={result}
              onRetry={() => {
                setPhase('home')
                setResult(emptyResult())
              }}
              onHome={() => {
                setPhase('home')
                setPlayerId('')
                setResult(emptyResult())
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
