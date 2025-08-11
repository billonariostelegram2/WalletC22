import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Configuración temporal simplificada hasta resolver el problema de compatibilidad
// El componente WalletConnect funcionará sin la configuración completa por ahora

export function Web3ModalProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export const config = null