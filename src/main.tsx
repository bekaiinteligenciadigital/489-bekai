/* Main entry point for the application - renders the root React component */
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { firebaseAnalyticsPromise } from '@/lib/firebase/client'
import './main.css'

void firebaseAnalyticsPromise

// @skip-protected: Do not remove. Required for React rendering.
createRoot(document.getElementById('root')!).render(<App />)
