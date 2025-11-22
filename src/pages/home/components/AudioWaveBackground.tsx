'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createNoise3D } from 'simplex-noise'

import { cn } from '@/shared/lib/utils'

type WaveSpeed = 'slow' | 'fast'

interface WavyBackgroundProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: WaveSpeed
  waveOpacity?: number
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  ...props
}: WavyBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number | null>(null)
  const timeRef = useRef(0)
  const dimensionsRef = useRef({ width: 0, height: 0 })

  const noise = useMemo(() => createNoise3D(), [])
  const waveColors = useMemo(
    () => colors ?? ['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee'],
    [colors],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    timeRef.current = 0

    const getSpeed = () => (speed === 'slow' ? 0.001 : 0.002)

    const resize = () => {
      const { innerWidth, innerHeight } = window
      canvas.width = innerWidth
      canvas.height = innerHeight
      dimensionsRef.current = { width: innerWidth, height: innerHeight }
      ctx.filter = `blur(${blur}px)`
    }

    const drawWave = (count: number) => {
      const { width, height } = dimensionsRef.current
      timeRef.current += getSpeed()

      for (let index = 0; index < count; index += 1) {
        ctx.beginPath()
        ctx.lineWidth = waveWidth || 50
        ctx.strokeStyle = waveColors[index % waveColors.length]
        for (let x = 0; x < width; x += 5) {
          const y = noise(x / 800, 0.3 * index, timeRef.current) * 120
          ctx.lineTo(x, y + height * 0.6)
        }
        ctx.stroke()
        ctx.closePath()
      }
    }

    const renderFrame = () => {
      const { width, height } = dimensionsRef.current
      ctx.fillStyle = backgroundFill ?? 'black'
      ctx.globalAlpha = waveOpacity ?? 0.5
      ctx.fillRect(0, 0, width, height)
      drawWave(5)
      animationIdRef.current = requestAnimationFrame(renderFrame)
    }

    resize()
    renderFrame()
    window.addEventListener('resize', resize)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [backgroundFill, blur, noise, speed, waveColors, waveOpacity, waveWidth])

  const [isSafari, setIsSafari] = useState(false)
  useEffect(() => {
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome'),
    )
  }, [])

  return (
    <div
      className={cn(
        'h-screen flex flex-col items-center justify-center',
        containerClassName,
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      ></canvas>
      <div className={cn('relative z-10', className)} {...props}>
        {children}
      </div>
    </div>
  )
}
