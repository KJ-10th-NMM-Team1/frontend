import { useEffect, useRef } from 'react'

import type { MotionValue } from 'framer-motion'

interface EditorFeaturesBackgroundProps {
  scrollYProgress: MotionValue<number>
}

export function EditorFeaturesBackground({ scrollYProgress }: EditorFeaturesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>()
  const prevScrollRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    // Constants
    const STAR_COLOR = '#fff'
    const STAR_SIZE = 3
    const STAR_MIN_SCALE = 0.2
    const OVERFLOW_THRESHOLD = 50
    const STAR_COUNT = (window.innerWidth + window.innerHeight) / 8

    let scale = 1
    let width = window.innerWidth
    let height = window.innerHeight

    const stars: { x: number; y: number; z: number }[] = []

    // Velocity state
    const velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 }

    // Initialize
    const generate = () => {
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: 0,
          y: 0,
          z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
        })
      }
    }

    const placeStar = (star: { x: number; y: number; z: number }) => {
      star.x = Math.random() * width
      star.y = Math.random() * height
    }

    const recycleStar = (star: { x: number; y: number; z: number }) => {
      let direction = 'z'
      const vx = Math.abs(velocity.x)
      const vy = Math.abs(velocity.y)

      if (vx > 1 || vy > 1) {
        let axis
        if (vx > vy) {
          axis = Math.random() < vx / (vx + vy) ? 'h' : 'v'
        } else {
          axis = Math.random() < vy / (vx + vy) ? 'v' : 'h'
        }

        if (axis === 'h') {
          direction = velocity.x > 0 ? 'l' : 'r'
        } else {
          direction = velocity.y > 0 ? 't' : 'b'
        }
      }

      star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE)

      if (direction === 'z') {
        star.z = 0.1
        star.x = Math.random() * width
        star.y = Math.random() * height
      } else if (direction === 'l') {
        star.x = -OVERFLOW_THRESHOLD
        star.y = height * Math.random()
      } else if (direction === 'r') {
        star.x = width + OVERFLOW_THRESHOLD
        star.y = height * Math.random()
      } else if (direction === 't') {
        star.x = width * Math.random()
        star.y = -OVERFLOW_THRESHOLD
      } else if (direction === 'b') {
        star.x = width * Math.random()
        star.y = height + OVERFLOW_THRESHOLD
      }
    }

    const resize = () => {
      scale = window.devicePixelRatio || 1
      width = window.innerWidth * scale
      height = window.innerHeight * scale

      canvas.width = width
      canvas.height = height

      stars.forEach(placeStar)
    }

    const update = () => {
      // 1. Mouse/Touch Velocity Decay
      velocity.tx *= 0.96
      velocity.ty *= 0.96
      velocity.x += (velocity.tx - velocity.x) * 0.8
      velocity.y += (velocity.ty - velocity.y) * 0.8

      // 2. Scroll Velocity Integration
      const currentScroll = scrollYProgress.get()
      const scrollDelta = currentScroll - prevScrollRef.current
      prevScrollRef.current = currentScroll

      // Dynamic Sensitivity
      // 초반(0.2 미만)에는 잔잔하게(100), 그 이후 영상 전환 시점부터는 폭발적으로(500)
      const sensitivity = currentScroll < 0.2 ? 100 : 300

      // 스크롤 속도에 따라 Y축(위아래)으로 가속
      // scrollDelta가 양수(내림)면 위로 올라가는 효과(별들이 위로 지나감)를 위해 -Y 방향 가속
      const scrollSpeed = scrollDelta * sensitivity

      // Apply scroll speed to velocity.ty (Target Velocity) for inertia
      // velocity.y가 아니라 velocity.ty에 더해줌으로써 0.96 감쇠 효과를 적용받아 더 부드럽고 길게 유지됨
      velocity.ty -= scrollSpeed

      stars.forEach((star) => {
        star.x += velocity.x * star.z
        star.y += velocity.y * star.z

        star.x += (star.x - width / 2) * velocity.z * star.z
        star.y += (star.y - height / 2) * velocity.z * star.z
        star.z += velocity.z

        // recycle when out of bounds
        if (
          star.x < -OVERFLOW_THRESHOLD ||
          star.x > width + OVERFLOW_THRESHOLD ||
          star.y < -OVERFLOW_THRESHOLD ||
          star.y > height + OVERFLOW_THRESHOLD
        ) {
          recycleStar(star)
        }
      })
    }

    const render = () => {
      context.clearRect(0, 0, width, height)

      stars.forEach((star) => {
        context.beginPath()
        context.lineCap = 'round'
        context.lineWidth = STAR_SIZE * star.z * scale
        context.globalAlpha = 0.5 + 0.5 * Math.random()
        context.strokeStyle = STAR_COLOR

        context.beginPath()
        context.moveTo(star.x, star.y)

        let tailX = velocity.x * 2
        let tailY = velocity.y * 3 // 잔상 길이 가중치 증가

        // stroke() wont work on an invisible line
        if (Math.abs(tailX) < 0.1) tailX = 0.5
        if (Math.abs(tailY) < 0.1) tailY = 0.5

        context.lineTo(star.x + tailX, star.y + tailY)
        context.stroke()
      })
    }

    const step = () => {
      update()
      render()
      requestRef.current = requestAnimationFrame(step)
    }

    // Initial Setup
    generate()
    resize()
    step()

    // Event Listeners
    window.addEventListener('resize', resize)

    // Mouse Interaction (Optional, kept from snippet)
    let pointerX: number | null = null
    let pointerY: number | null = null
    let touchInput = false

    const movePointer = (x: number, y: number) => {
      if (typeof pointerX === 'number' && typeof pointerY === 'number') {
        const ox = x - pointerX
        const oy = y - pointerY
        velocity.tx = velocity.tx + (ox / 8) * scale * (touchInput ? 1 : -1)
        velocity.ty = velocity.ty + (oy / 8) * scale * (touchInput ? 1 : -1)
      }
      pointerX = x
      pointerY = y
    }

    const onMouseMove = (event: MouseEvent) => {
      touchInput = false
      movePointer(event.clientX, event.clientY)
    }

    const onTouchMove = (event: TouchEvent) => {
      touchInput = true
      movePointer(event.touches[0].clientX, event.touches[0].clientY)
      event.preventDefault()
    }

    const onMouseLeave = () => {
      pointerX = null
      pointerY = null
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('touchmove', onTouchMove)
    canvas.addEventListener('touchend', onMouseLeave)
    document.addEventListener('mouseleave', onMouseLeave)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onMouseLeave)
      document.removeEventListener('mouseleave', onMouseLeave)
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [scrollYProgress])

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        // backgroundColor: '#000', // Removed to allow parent background to show
        backgroundImage: `
                radial-gradient(circle at top right, rgba(121, 68, 154, 0.13), transparent),
                radial-gradient(circle at 20% 80%, rgba(41, 196, 255, 0.13), transparent)
            `,
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute left-0 top-0 h-full w-full" // Changed from fixed to absolute
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
