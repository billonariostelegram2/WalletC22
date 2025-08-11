import { createWeb3Modal } from '@web3modal/wagmi/react'
import { http, createConfig } from 'wagmi'
import { sepolia, polygonMumbai } from 'wagmi/chains'
import { walletConnect, injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

// Project ID real del usuario
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID

const metadata = {
  name: 'CriptoHerencia - Simulador Educativo',
  description: 'Simulador educativo de herencia cripto con WalletConnect',
  url: window.location.origin,
  icons: [`${window.location.origin}/logo.png`]
}

// Configuración de Wagmi
const config = createConfig({
  chains: [sepolia, polygonMumbai],
  transports: {
    [sepolia.id]: http(),
    [polygonMumbai.id]: http()
  },
  connectors: [
    walletConnect({ 
      projectId, 
      metadata, 
      showQrModal: false // Usaremos el modal personalizado
    }),
    injected({ shimDisconnect: true })
  ]
})

// Crear Web3Modal con configuración completa
if (projectId) {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
    enableOnramp: false,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-color-mix': '#00d4aa',
      '--w3m-color-mix-strength': 20,
      '--w3m-font-family': 'monospace',
      '--w3m-border-radius-master': '4px'
    }
  })
}

export function Web3ModalProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export { config }