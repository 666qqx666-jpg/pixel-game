import { gasUrl, passThreshold, questionCount } from '../config'
import type { AnswerPayload, Question, SubmitResult } from '../types'

function assertUrl() {
  if (!gasUrl?.trim()) {
    throw new Error(
      '缺少 GOOGLE_APP_SCRIPT_URL：请把 .env 放在项目根目录（与 vite.config.ts 同层）、填好网址后重启 npm run dev；也可用 VITE_GOOGLE_APP_SCRIPT_URL',
    )
  }
}

export async function fetchQuestions(count: number): Promise<Question[]> {
  assertUrl()
  const res = await fetch(gasUrl, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'getQuestions',
      count,
    }),
  })
  const data = (await res.json()) as {
    ok: boolean
    questions?: Question[]
    error?: string
  }
  if (!data.ok || !data.questions) {
    throw new Error(data.error ?? '获取题目失败')
  }
  return data.questions
}

export async function submitAnswers(
  playerId: string,
  answers: AnswerPayload[],
): Promise<SubmitResult> {
  assertUrl()
  const res = await fetch(gasUrl, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'submit',
      playerId,
      answers,
      passThreshold,
      questionCount,
    }),
  })
  return (await res.json()) as SubmitResult
}
