export type Choice = 'A' | 'B' | 'C' | 'D'

export interface Question {
  questionNo: string
  question: string
  A: string
  B: string
  C: string
  D: string
}

export interface AnswerPayload {
  questionNo: string
  choice: Choice
}

export interface SubmitResult {
  ok: boolean
  correct?: number
  total?: number
  passed?: boolean
  error?: string
  /** 后端若返回行数据可选 */
  summary?: {
    attempts: number
    highScore: number
    firstPassScore: number | null
    attemptsToFirstPass: number | null
    lastPlayed: string
  }
}

export type GamePhase = 'home' | 'loading' | 'quiz' | 'result'
