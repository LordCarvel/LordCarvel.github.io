import { useContext } from 'react'
import { EditorContext, type EditorContextValue } from '../context/editorContext'

export function useEditor(): EditorContextValue {
  const value = useContext(EditorContext)
  if (!value) throw new Error('useEditor() precisa estar dentro de <EditorProvider>')
  return value
}
