import { Toaster as SonnerToaster } from 'sonner'

type AppToasterProps = {
  appName: string
}

export function AppToaster({ appName }: AppToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      toastOptions={{
        duration: 3500,
        className:
          'bg-surface-2 text-foreground border border-surface-4 rounded-2xl shadow-xl shadow-black/10',
        style: {
          minWidth: '280px',
        },
        description: appName,
      }}
      visibleToasts={3}
      expand
      closeButton
      theme="light"
      offset={24}
    />
  )
}
