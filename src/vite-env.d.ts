/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly GOOGLE_APP_SCRIPT_URL: string
  readonly PASS_THRESHOLD: number
  readonly QUESTION_COUNT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
