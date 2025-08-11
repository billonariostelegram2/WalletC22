import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Configuración simplificada para evitar problemas de compatibilidad con @base-org/account
// El Project ID está configurado correctamente, solo necesitamos una implementación compatible

export function Web3ModalProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

export const config = null