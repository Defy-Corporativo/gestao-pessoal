import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@iadefysolutions/design-system/styles'
import './styles/global.css'
import { registerGlobalErrorHandlers } from './utils/logger'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

registerGlobalErrorHandlers()
