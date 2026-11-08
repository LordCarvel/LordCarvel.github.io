import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LangProvider from './context/LangProvider.tsx'
import './index.css'
import Main from './Main.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <Main />
    </LangProvider>
  </StrictMode>,
)
