import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Authprovider } from './AuthContext.tsx'
import React from 'react'
import './i18n';
import { ThemeProvider } from './ThemeContent.tsx'



createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Authprovider>
        <App/>
      
    </Authprovider>
  </React.StrictMode>
)
