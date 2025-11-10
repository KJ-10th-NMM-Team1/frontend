import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

export function secondsToTimestamp(seconds: number) {
  const date = new Date(0)
  date.setSeconds(seconds)
  return date.toISOString().substring(14, 19)
}
