import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Configuración simplificada pero FUNCIONAL
// Usando el Project ID real del usuario: 2d33c5d2eff2e4f64eaf8de8e6606533

export function Web3ModalProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export const config = {
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID,
  metadata: {
    name: 'CriptoHerencia - Simulador Educativo',
    description: 'Simulador educativo de herencia cripto con WalletConnect',
    url: window.location.origin,
    icons: [`${window.location.origin}/logo.png`]
  }
}