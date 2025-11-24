import React, { useMemo, useRef, useState, useEffect } from 'react'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// GitHub Logo Path
const GITHUB_PATH =
  'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z'

const vertexShader = `
  uniform float uHover;
  uniform float uTime;
  uniform float uPixelRatio;
  
  uniform sampler2D uInitialPosTexture; 
  uniform sampler2D uTargetDataTexture; 

  varying float vHover;
  varying float vIsLogo;
  varying float vAlpha; 

  float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vHover = uHover;
    vec2 textureUV = uv;
    vec3 initialPos = texture2D(uInitialPosTexture, textureUV).rgb;
    vec4 targetData = texture2D(uTargetDataTexture, textureUV);
    vec3 targetPos = targetData.rgb;
    float isLogo = targetData.a; 
    
    vIsLogo = isLogo;
    vAlpha = 1.0; 

    float ease = uHover; 
    vec3 pos = initialPos; 

    if (isLogo > 0.5) {
        // [로고 점] 타겟 위치로 이동 (고정)
        pos = mix(initialPos, targetPos, ease);
    } 
    else {
        // [배경 점] Gravity Well 효과
        float dist = length(initialPos.xy);
        
        // ==================================================================================
        // [설정 A] 쉐이더 쪽 빨려들어가는 범위 (반지름)
        // 이 값보다 가까운 배경 점들만 애니메이션이 작동합니다.
        // JS쪽 GRAVITY_RADIUS와 비슷하게 맞춰주세요.
        // ==================================================================================
        float gravityRadius = 8.0; 

        if (dist < gravityRadius && uHover > 0.01) {
             float rnd = random(initialPos.xy);
             float loop = fract(uTime * 0.8 + rnd * 10.0);
             float t = loop * loop; // 가속도 (점점 빠르게)
             
             vec3 suckedPos = mix(initialPos, targetPos, t);
             pos = mix(initialPos, suckedPos, ease);
             
             // 중심에 가까워질수록 투명해짐
             float fade = 1.0 - smoothstep(0.7, 1.0, loop);
             vAlpha = fade;
             
             // 빨려갈 때 크기 줄어듦
             gl_PointSize *= (1.0 - loop * 0.5);
        }
    }

    // 노이즈 효과 (배경만 흔들림)
    float time = uTime * 0.3; 
    float noiseStrength = mix(0.15, 0.0, ease); 
    if (isLogo < 0.5) {
        pos.y += sin(time + pos.x * 0.5) * noiseStrength;
        pos.x += cos(time * 0.8 + pos.y * 0.5) * noiseStrength;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 점 크기 설정
    float baseSize = 20.0;
    float logoSize = 50.0;
    float size = mix(baseSize, logoSize, ease * isLogo); 
    gl_PointSize = size * (1.0 / -mvPosition.z) * uPixelRatio; 
  }
`

const fragmentShader = `
  varying float vHover;
  varying float vIsLogo;
  varying float vAlpha;

  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;

    vec3 colorBlack = vec3(0.15, 0.15, 0.2);
    vec3 colorSkyBlue = vec3(0.4, 0.7, 1.0);
    
    vec3 finalColor = mix(colorBlack, colorSkyBlue, vHover * vIsLogo);
    float circleAlpha = 1.0 - smoothstep(0.48, 0.5, ll);
    gl_FragColor = vec4(finalColor, circleAlpha * vAlpha);
  }
`

interface ParticlesProps {
  isHovered: boolean
}

const Particles = ({ isHovered }: ParticlesProps) => {
  const mesh = useRef<THREE.Points>(null)
  const { gl } = useThree()

  const textureSize = 64 // 64x64 = 4096 particles
  const count = textureSize * textureSize

  const uniforms = useMemo(
    () => ({
      uHover: { value: 0 },
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uInitialPosTexture: { value: null as THREE.DataTexture | null },
      uTargetDataTexture: { value: null as THREE.DataTexture | null },
    }),
    [],
  )

  const currentHoverValue = useRef(0)

  const { initialPosTexture, targetDataTexture, geometry } = useMemo(() => {
    // ==================================================================================
    // [설정 B] 자바스크립트(CPU) 쪽 핵심 변수들
    // 여기서 값을 조절하면 로고 크기나 범위가 바뀝니다.
    // ==================================================================================

    // 1. 로고 크기 (World Scale)
    // - 이 값을 키우면 로고가 커지고, 줄이면 작아집니다.
    // - 추천: 6.0 ~ 12.0
    const LOGO_WORLD_SIZE = 10.0

    // 2. 테두리 형성 거리 (Recruit Distance)
    // - 테두리 선에서 이 거리 안에 있는 점들은 '강제로' 테두리가 되어 고정됩니다.
    // - 너무 작으면(0.5) 로고가 끊겨 보이고, 너무 크면(2.0) 로고가 뚱뚱해집니다.
    // - 추천: 0.8 ~ 1.5
    const LOGO_FORM_DIST = 3.0

    // 3. 빨려 들어가는 범위 (Gravity Radius)
    // - 로고 중심에서 이 반경 안에 있는 배경 점들만 '타겟'을 배정받습니다.
    // - 이 값이 쉐이더의 gravityRadius(설정 A)와 비슷해야 자연스럽습니다.
    // - 값: 쉐이더 값(12.0)의 제곱 = 144.0 (거리 제곱 계산용)
    const GRAVITY_RADIUS_SQ = 8.0 * 8.0
    // ==================================================================================

    const initialPosData = new Float32Array(count * 4)
    const targetData = new Float32Array(count * 4)
    const positions = new Float32Array(count * 3)
    const uvs = new Float32Array(count * 2)

    const cols = 80
    const rows = 50
    const width = 24
    const height = 13

    // SVG(0~16) <-> World 변환 비율 (자동 계산)
    const SVG_TO_WORLD_SCALE = LOGO_WORLD_SIZE / 2 / 8

    // ----------------------------------------------------------
    // [1] 테두리 좌석 수집 (SVG 벡터)
    // ----------------------------------------------------------
    const borderSeats: { x: number; y: number }[] = []
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathEl.setAttribute('d', GITHUB_PATH)
    const totalLength = pathEl.getTotalLength()
    const numBorderPoints = 2000

    for (let i = 0; i < numBorderPoints; i++) {
      const point = pathEl.getPointAtLength((i / numBorderPoints) * totalLength)
      const wx = (point.x - 8) * SVG_TO_WORLD_SCALE
      const wy = -(point.y - 8) * SVG_TO_WORLD_SCALE
      borderSeats.push({ x: wx, y: wy })
    }
    // 셔플
    for (let i = borderSeats.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[borderSeats[i], borderSeats[j]] = [borderSeats[j], borderSeats[i]]
    }

    // ----------------------------------------------------------
    // [2] 초기 위치 생성
    // ----------------------------------------------------------
    const tempInitialPositions: { x: number; y: number; z: number }[] = []
    for (let i = 0; i < count; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = (col / cols - 0.5) * width + (Math.random() - 0.5) * 0.2
      const y = (row / rows - 0.5) * height + (Math.random() - 0.5) * 0.2
      const z = (Math.random() - 0.5) * 0.5
      tempInitialPositions.push({ x, y, z })

      initialPosData[i * 4 + 0] = x
      initialPosData[i * 4 + 1] = y
      initialPosData[i * 4 + 2] = z
      initialPosData[i * 4 + 3] = 1.0

      targetData[i * 4 + 0] = x
      targetData[i * 4 + 1] = y
      targetData[i * 4 + 2] = z
      targetData[i * 4 + 3] = 0.0

      const texX = (i % textureSize) / textureSize + 0.5 / textureSize
      const texY = Math.floor(i / textureSize) / textureSize + 0.5 / textureSize
      uvs[i * 2 + 0] = texX
      uvs[i * 2 + 1] = texY
      positions[i * 3] = 0
    }

    // ----------------------------------------------------------
    // [3] 내부 판별용 캔버스
    // ----------------------------------------------------------
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const logoPath = new Path2D(GITHUB_PATH)

    // ----------------------------------------------------------
    // [4] 타겟 할당
    // ----------------------------------------------------------
    const usedIndices = new Set<number>()

    // (A) 내부 점 고정
    if (ctx) {
      for (let i = 0; i < count; i++) {
        const { x, y } = tempInitialPositions[i]
        const svgX = x / SVG_TO_WORLD_SCALE + 8
        const svgY = -y / SVG_TO_WORLD_SCALE + 8

        if (svgX >= 0 && svgX <= 16 && svgY >= 0 && svgY <= 16) {
          if (ctx.isPointInPath(logoPath, svgX, svgY)) {
            targetData[i * 4 + 3] = 1.0 // isLogo = 1
            usedIndices.add(i)
          }
        }
      }
    }

    // (B) 테두리 1:1 배정 (LOGO_FORM_DIST 사용)
    const LOGO_FORM_DIST_SQ = LOGO_FORM_DIST * LOGO_FORM_DIST

    borderSeats.forEach((seat) => {
      let bestIdx = -1
      let minDistSq = Infinity
      for (let i = 0; i < count; i++) {
        if (usedIndices.has(i)) continue
        const dx = tempInitialPositions[i].x - seat.x
        const dy = tempInitialPositions[i].y - seat.y

        // 바운딩 박스 최적화
        if (Math.abs(dx) > LOGO_FORM_DIST || Math.abs(dy) > LOGO_FORM_DIST) continue

        const dSq = dx * dx + dy * dy
        if (dSq < minDistSq) {
          minDistSq = dSq
          bestIdx = i
        }
      }
      if (bestIdx !== -1 && minDistSq < LOGO_FORM_DIST_SQ) {
        const jitter = 0.08
        targetData[bestIdx * 4 + 0] = seat.x + (Math.random() - 0.5) * jitter
        targetData[bestIdx * 4 + 1] = seat.y + (Math.random() - 0.5) * jitter
        targetData[bestIdx * 4 + 2] = 0.0
        targetData[bestIdx * 4 + 3] = 1.0
        usedIndices.add(bestIdx)
      }
    })

    // (C) 배경 점 Gravity Well 타겟팅 (GRAVITY_RADIUS_SQ 사용)
    for (let i = 0; i < count; i++) {
      if (usedIndices.has(i)) continue
      const px = tempInitialPositions[i].x
      const py = tempInitialPositions[i].y

      // 중력 우물 범위 체크
      if (px * px + py * py < GRAVITY_RADIUS_SQ) {
        let minDistSq = Infinity
        let bestSeat = null
        // 대충 찾기 (step 10)
        for (let b = 0; b < borderSeats.length; b += 10) {
          const seat = borderSeats[b]
          const dx = px - seat.x
          const dy = py - seat.y
          const dSq = dx * dx + dy * dy
          if (dSq < minDistSq) {
            minDistSq = dSq
            bestSeat = seat
          }
        }
        if (bestSeat) {
          targetData[i * 4 + 0] = bestSeat.x
          targetData[i * 4 + 1] = bestSeat.y
          targetData[i * 4 + 2] = 0.0
        }
      }
    }

    const initTex = new THREE.DataTexture(
      initialPosData,
      textureSize,
      textureSize,
      THREE.RGBAFormat,
      THREE.FloatType,
    )
    initTex.needsUpdate = true
    const targetTex = new THREE.DataTexture(
      targetData,
      textureSize,
      textureSize,
      THREE.RGBAFormat,
      THREE.FloatType,
    )
    targetTex.needsUpdate = true

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))

    return { initialPosTexture: initTex, targetDataTexture: targetTex, geometry: geo }
  }, [count])

  useMemo(() => {
    uniforms.uInitialPosTexture.value = initialPosTexture
    uniforms.uTargetDataTexture.value = targetDataTexture
  }, [initialPosTexture, targetDataTexture, uniforms])

  useFrame((state) => {
    const { clock } = state
    const targetHover = isHovered ? 1 : 0
    currentHoverValue.current = THREE.MathUtils.lerp(currentHoverValue.current, targetHover, 0.15)
    uniforms.uHover.value = currentHoverValue.current
    uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <points ref={mesh} geometry={geometry}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
      />
    </points>
  )
}

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
        setHasLoaded(true)
        observer.disconnect()
      }
    }, options)
    observer.observe(ref.current)
    return () => {
      observer.disconnect()
    }
  }, [options])

  return { ref, shouldRender: hasLoaded || isInView }
}

export function MorphingBackground({ isHovered }: { isHovered: boolean }) {
  const { ref, shouldRender } = useInView({ rootMargin: '200px' })

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-0 h-full w-full">
      {shouldRender && (
        <Canvas
          camera={{ position: [0, 0, 14], fov: 50 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <Particles isHovered={isHovered} />
        </Canvas>
      )}
    </div>
  )
}
