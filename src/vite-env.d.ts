/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOG_SLUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
