import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** 与 vite.config.ts 同目录加载 .env，避免在错误 cwd 下运行时读不到变量 */
const envDir = path.dirname(fileURLToPath(import.meta.url))

function normalizeBase(raw: string | undefined): string {
  const s = String(raw ?? '').trim()
  if (!s || s === '/') return '/'
  const withSlash = s.startsWith('/') ? s : `/${s}`
  return withSlash.endsWith('/') ? withSlash : `${withSlash}/`
}

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, envDir, '')
  /** CI（如 GitHub Actions）用环境变量注入，不依赖仓库里的 .env */
  const scriptUrl = String(
    process.env.GOOGLE_APP_SCRIPT_URL ??
      process.env.VITE_GOOGLE_APP_SCRIPT_URL ??
      fileEnv.GOOGLE_APP_SCRIPT_URL ??
      fileEnv.VITE_GOOGLE_APP_SCRIPT_URL ??
      '',
  ).trim()
  const passRaw =
    process.env.PASS_THRESHOLD ??
    process.env.VITE_PASS_THRESHOLD ??
    fileEnv.PASS_THRESHOLD ??
    fileEnv.VITE_PASS_THRESHOLD ??
    '3'
  const countRaw =
    process.env.QUESTION_COUNT ??
    process.env.VITE_QUESTION_COUNT ??
    fileEnv.QUESTION_COUNT ??
    fileEnv.VITE_QUESTION_COUNT ??
    '5'
  const passThreshold = Number(passRaw)
  const questionCount = Number(countRaw)
  /** Pages 项目站：https://用户.github.io/仓库名/ → base 为 /仓库名/ */
  const base = normalizeBase(
    process.env.BASE_PATH ??
      process.env.VITE_BASE_PATH ??
      fileEnv.BASE_PATH ??
      fileEnv.VITE_BASE_PATH ??
      'pixel-game',
  )

  return {
    base,
    plugins: [react()],
    define: {
      'import.meta.env.GOOGLE_APP_SCRIPT_URL': JSON.stringify(scriptUrl),
      'import.meta.env.PASS_THRESHOLD': JSON.stringify(
        Number.isFinite(passThreshold) ? passThreshold : 3,
      ),
      'import.meta.env.QUESTION_COUNT': JSON.stringify(
        Number.isFinite(questionCount) ? questionCount : 5,
      ),
    },
  }
})
