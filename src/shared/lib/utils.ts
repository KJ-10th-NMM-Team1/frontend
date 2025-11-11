import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { env } from '@/shared/config/env'


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

type PresignedResponse = { url: string }

export async function resolvePresignedUrl(key: string): Promise<string> {
  const response = await fetch(`${env.apiBaseUrl}/api/storage/media/${key}`)
  if (!response.ok) {
    throw new Error('Failed to resolve media URL')
  }
  const data = (await response.json()) as PresignedResponse
  return data.url
}