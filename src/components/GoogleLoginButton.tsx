import { useCallback, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

type GoogleLoginButtonProps = {
  onToken: (token: string) => void
  onError?: (message: string) => void
  disabled?: boolean
  className?: string
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            element: HTMLElement,
            options: {
              type?: string
              theme?: string
              size?: string
              text?: string
              shape?: string
              width?: string | number
            }
          ) => void
          prompt: () => void
        }
      }
    }
  }
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client'

export function GoogleLoginButton({
  onToken,
  onError,
  disabled,
  className,
}: GoogleLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [initialised, setInitialised] = useState(false)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  const reportError = useCallback(
    (message: string) => {
      console.error(message)
      onError?.(message)
    },
    [onError]
  )

  const handleCredentialResponse = useCallback(
    (response: { credential?: string }) => {
      if (response?.credential) {
        onToken(response.credential)
      } else {
        reportError('구글 인증 토큰을 받지 못했습니다.')
      }
    },
    [onToken, reportError]
  )

  useEffect(() => {
    if (!googleClientId) {
      reportError('VITE_GOOGLE_CLIENT_ID 환경 변수가 설정되지 않았습니다.')
      return
    }

    if (window.google?.accounts?.id) {
      setScriptReady(true)
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_SCRIPT_SRC}"]`
    )

    if (existingScript) {
      const handleExistingLoad = () => setScriptReady(true)
      const handleExistingError = () =>
        reportError('구글 로그인 스크립트를 불러오는 데 실패했습니다.')
      existingScript.addEventListener('load', handleExistingLoad)
      existingScript.addEventListener('error', handleExistingError)

      return () => {
        existingScript.removeEventListener('load', handleExistingLoad)
        existingScript.removeEventListener('error', handleExistingError)
      }
    }

    const script = document.createElement('script')
    script.src = GOOGLE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.onload = () => setScriptReady(true)
    script.onerror = () => reportError('구글 로그인 스크립트를 불러오는 데 실패했습니다.')
    document.head.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [googleClientId, reportError])

  useEffect(() => {
    if (
      !googleClientId ||
      !scriptReady ||
      !containerRef.current ||
      !window.google?.accounts?.id ||
      initialised
    ) {
      return
    }

    containerRef.current.innerHTML = ''

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
    })

    window.google.accounts.id.renderButton(containerRef.current, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 320,
    })

    window.google.accounts.id.prompt()
    setInitialised(true)
  }, [googleClientId, handleCredentialResponse, initialised, scriptReady])

  useEffect(() => {
    if (!containerRef.current) {
      return
    }
    containerRef.current.style.pointerEvents = disabled ? 'none' : 'auto'
    containerRef.current.style.opacity = disabled ? '0.6' : '1'
  }, [disabled])

  return <div ref={containerRef} className={clsx('w-full flex justify-center', className)} />
}
