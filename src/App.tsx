import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EditorProvider from './context/EditorProvider.tsx'
import LangProvider from './context/LangProvider.tsx'
import './index.css'
import Main from './Main.tsx'
import { HOME, registry } from './pages/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <EditorProvider registry={registry} home={HOME}>
        <Main />
      </EditorProvider>
    </LangProvider>
  </StrictMode>,
)
