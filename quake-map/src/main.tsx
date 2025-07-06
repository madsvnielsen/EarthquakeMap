import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import 'leaflet/dist/leaflet.css';
import './utils/fixLeafletIcons';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { theme } from './theme.ts';
import 'leaflet-draw/dist/leaflet.draw.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
  </StrictMode>,
)
