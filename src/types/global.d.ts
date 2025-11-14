import type { GoogleAPI } from './google'

export {}

declare global {
  interface Window {
    google?: GoogleAPI
  }
}
