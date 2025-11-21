import { createContext, useContext, type ReactNode } from 'react'

interface EditorContextValue {
  projectId: string
  languageCode: string
}

const EditorContext = createContext<EditorContextValue | null>(null)

interface EditorProviderProps {
  children: ReactNode
  projectId: string
  languageCode: string
}

export function EditorProvider({ children, projectId, languageCode }: EditorProviderProps) {
  return (
    <EditorContext.Provider value={{ projectId, languageCode }}>
      {children}
    </EditorContext.Provider>
  )
}

export function useEditorContext() {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider')
  }
  return context
}
