export type GoogleCredentialResponse = {
  clientId: string
  credential: string
  select_by: string
}

export type GoogleButtonConfig = {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'small' | 'medium' | 'large'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string
  locale?: string
}

export type GoogleAccountsId = {
  initialize: (options: {
    client_id: string
    callback: (response: GoogleCredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
    context?: 'signin' | 'signup'
  }) => void
  renderButton: (element: HTMLElement, options?: GoogleButtonConfig) => void
  prompt: () => void
}

export type GoogleAccounts = {
  id: GoogleAccountsId
}

export type GoogleAPI = {
  accounts: GoogleAccounts
}
