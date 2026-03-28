import type { SubmitResult } from '../types'
import { passThreshold } from '../config'

interface Props {
  playerId: string
  outcome: SubmitResult
  onRetry: () => void
  onHome: () => void
}

export function ResultScreen({ playerId, outcome, onRetry, onHome }: Props) {
  const ok = outcome.ok
  const correct = outcome.correct ?? 0
  const total = outcome.total ?? 0
  const passed = outcome.passed ?? false

  return (
    <>
      <p className="subtitle">玩家：{playerId}</p>
      {!ok && (
        <div className="banner fail">服务器错误：{outcome.error ?? '未知'}</div>
      )}
      {ok && (
        <>
          <div className={`banner ${passed ? 'pass' : 'fail'}`}>
            {passed ? '通关！' : '未达门槛'}
          </div>
          <p className="subtitle" style={{ marginTop: 8 }}>
            成绩：{correct} / {total}（需 {passThreshold} 题通关）
          </p>
          {outcome.summary && (
            <div className="hint">
              累计场次：{outcome.summary.attempts} · 最高分：{outcome.summary.highScore}
              {outcome.summary.firstPassScore != null && (
                <>
                  {' '}
                  · 首次通关分：{outcome.summary.firstPassScore}
                </>
              )}
              {outcome.summary.attemptsToFirstPass != null && (
                <>
                  {' '}
                  · 首次通关场次：{outcome.summary.attemptsToFirstPass}
                </>
              )}
            </div>
          )}
        </>
      )}
      <div className="row" style={{ marginTop: 24 }}>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          再来一局
        </button>
        <button type="button" className="btn btn-secondary" onClick={onHome}>
          回首页
        </button>
      </div>
    </>
  )
}
