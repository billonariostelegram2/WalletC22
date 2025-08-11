import { createWeb3Modal } from '@web3modal/wagmi/react'
import { http, createConfig } from 'wagmi'
import { sepolia, polygonMumbai } from 'wagmi/chains'
import { walletConnect, injected, coinbaseWallet } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

const queryClient = new QueryClient()

// Project ID de demostración - el usuario debería obtener uno propio en https://cloud.walletconnect.com/
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'demo_project_id_for_educational_use'

const metadata = {
  name: 'CriptoHerencia - Simulador Educativo',
  description: 'Simulador educativo de herencia cripto con WalletConnect',
  url: 'https://criptoherencia.com',
  icons: ['https://criptoherencia.com/logo.png']
}

const config = createConfig({
  chains: [sepolia, polygonMumbai],
  transports: {
    [sepolia.id]: http(),
    [polygonMumbai.id]: http()
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false }),
    injected({ shimDisconnect: true }),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0]
    })
  ]
})

// Crear Web3Modal solo si tenemos un projectId válido
if (projectId && projectId !== 'demo_project_id_for_educational_use') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
    enableOnramp: false,
    themeMode: 'dark',
    themeVariables: {
      '--w3m-color-mix': '#00d4aa',
      '--w3m-color-mix-strength': 20
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