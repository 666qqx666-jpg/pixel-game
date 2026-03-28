import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** 与 vite.config.ts 同目录加载 .env，避免在错误 cwd 下运行时读不到变量 */
const envDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const fileEnv = loadEnv(mode, envDir, '')
  const scriptUrl = String(
    fileEnv.GOOGLE_APP_SCRIPT_URL ??
      fileEnv.VITE_GOOGLE_APP_SCRIPT_URL ??
      '',
  ).trim()
  const passRaw =
    fileEnv.PASS_THRESHOLD ?? fileEnv.VITE_PASS_THRESHOLD ?? '3'
  const countRaw =
    fileEnv.QUESTION_COUNT ?? fileEnv.VITE_QUESTION_COUNT ?? '5'
  const passThreshold = Number(passRaw)
  const questionCount = Number(countRaw)

  return {
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
