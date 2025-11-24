import { useEffect, useRef } from 'react'

import anime from 'animejs/lib/anime.es.js'

import { cn } from '@/shared/lib/utils'

interface TextRevealProps {
  text: string | React.ReactNode
  className?: string
  delay?: number
  duration?: number
  threshold?: number // Intersection Observer threshold
  mode?: 'char' | 'word' | 'line'
  direction?: 'up' | 'down' | 'left' | 'right'
  staggerMode?: 'linear' | 'center' | 'random' | 'oddEven'
  staggerDuration?: number
  repeat?: boolean
  trigger?: boolean
  rootMargin?: string
}

export function TextReveal({ 
  text, 
  className, 
  delay = 0, 
  duration = 800,
  threshold = 0.1,
  mode = 'word',
  direction = 'up',
  staggerMode = 'linear',
  staggerDuration,
  repeat = false,
  trigger,
  rootMargin = '0px'
}: TextRevealProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  // Default stagger duration based on mode if not provided
  const finalStaggerDuration = staggerDuration ?? (mode === 'word' ? 100 : mode === 'line' ? 200 : 30)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const targetSelector = mode === 'word' ? '.word' : mode === 'line' ? '.line' : '.letter'
    
    // Animation configuration based on direction
    let initialTranslateY: number | number[] = 0
    let initialTranslateX: number | number[] = 0

    // Exit targets (to return to hidden state)
    let exitTranslateY: number = 0
    let exitTranslateX: number = 0

    switch (direction) {
      case 'up':
        initialTranslateY = [20, 0]
        exitTranslateY = 20
        break
      case 'down':
        initialTranslateY = [-20, 0]
        exitTranslateY = -20
        break
      case 'left':
        initialTranslateX = [20, 0]
        exitTranslateX = 20
        break
      case 'right':
        initialTranslateX = [-20, 0]
        exitTranslateX = -20
        break
    }

    // Calculate delay based on staggerMode
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let delayValue: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let exitDelayValue: any

    switch (staggerMode) {
      case 'center':
        delayValue = anime.stagger(finalStaggerDuration, { start: delay, from: 'center' })
        exitDelayValue = anime.stagger(finalStaggerDuration * 0.5, { start: 0, from: 'center' })
        break
      case 'random':
        delayValue = () => delay + Math.random() * (finalStaggerDuration * 5)
        exitDelayValue = () => Math.random() * (finalStaggerDuration * 5)
        break
      case 'oddEven':
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delayValue = (_el: any, i: number) => delay + (i % 2) * finalStaggerDuration * 2
        // Reverse oddEven: Odds disappear first (0 delay), Evens later
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exitDelayValue = (_el: any, i: number) => ((i + 1) % 2) * finalStaggerDuration * 2
        break
      case 'linear':
      default:
        delayValue = anime.stagger(finalStaggerDuration, { start: delay })
        exitDelayValue = anime.stagger(finalStaggerDuration * 0.5, { start: 0, from: 'last' })
        break
    }

    const playEnter = () => {
      if (!hasAnimated.current || repeat) {
        hasAnimated.current = true
        anime.remove(container.querySelectorAll(targetSelector))
        anime({
          targets: container.querySelectorAll(targetSelector),
          translateY: initialTranslateY,
          translateX: initialTranslateX,
          translateZ: 0,
          opacity: [0, 1],
          scale: 1,
          easing: 'easeOutExpo',
          duration: duration,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          delay: delayValue,
        })
      }
    }

    const playExit = () => {
      if (repeat && hasAnimated.current) {
        anime.remove(container.querySelectorAll(targetSelector))
        anime({
          targets: container.querySelectorAll(targetSelector),
          translateY: exitTranslateY,
          translateX: exitTranslateX,
          translateZ: 0,
          opacity: 0,
          scale: 0.9,
          easing: 'easeInQuad',
          duration: duration * 0.6,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          delay: exitDelayValue,
        })
      }
    }

    // External Trigger Mode
    if (typeof trigger === 'boolean') {
      if (trigger) {
        playEnter()
      } else {
        playExit()
      }
      return // Skip observer setup
    }

    // Intersection Observer Mode
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            playEnter()
          } else {
            playExit()
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      anime.remove(container.querySelectorAll(targetSelector))
    }
  }, [text, delay, duration, threshold, mode, direction, staggerMode, repeat, trigger, finalStaggerDuration, rootMargin])

  // 텍스트가 문자열이 아닌 경우 (예: ReactNode) 안전하게 렌더링
  if (typeof text !== 'string') {
    return <div className={cn('inline-block', className)}>{text}</div>
  }

  // 렌더링 로직 분기
  let content
  if (mode === 'word') {
    const lines = text.split('\n')
    content = lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        {line.split(' ').map((word, wordIndex) => (
          <span key={`${lineIndex}-${wordIndex}`} className="word inline-block opacity-0 mr-[0.3em]">
            {word}
          </span>
        ))}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ))
  } else if (mode === 'line') {
    const lines = text.split('\n')
    content = lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        <span className="line inline-block opacity-0">
          {line}
        </span>
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ))
  } else {
    // char mode
    const lines = text.split('\n')
    content = lines.map((line, lineIndex) => (
      <span key={lineIndex}>
        {line.split('').map((char, charIndex) => (
          <span key={`${lineIndex}-${charIndex}`} className="letter inline-block opacity-0" style={{ minWidth: char === ' ' ? '0.25em' : 'auto' }}>
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div ref={containerRef} className={cn('inline-block', className)}>
      {content}
    </div>
  )
}
