import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EditorProvider from './context/EditorProvider.tsx'
import LangProvider from './context/LangProvider.tsx'
import TerminalProvider from './context/TerminalProvider.tsx'
import ThemeProvider from './context/ThemeProvider.tsx'
import './index.css'
import Main from './Main.tsx'
import { HOME, registry } from './pages/index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <ThemeProvider>
        <EditorProvider registry={registry} home={HOME}>
          <TerminalProvider>
            <Main />
          </TerminalProvider>
        </EditorProvider>
      </ThemeProvider>
    </LangProvider>
  </StrictMode>,
)
