export function trackEvent(event: string, payload?: Record<string, unknown>) {
  if (import.meta.env.DEV) {
    console.info(`[track] ${event}`, payload ?? {})
  }
}
