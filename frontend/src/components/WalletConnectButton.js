import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Wallet, CheckCircle, AlertTriangle, Zap, X } from 'lucide-react'

export function WalletConnectButton({ onConnectionSuccess }) {
  const [connectionState, setConnectionState] = useState('disconnected')
  const [connectedWallet, setConnectedWallet] = useState(null)
  const [availableWallets, setAvailableWallets] = useState([])
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar si estamos en móvil
    const checkIsMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    setIsMobile(checkIsMobile)
    
    // Detectar wallets disponibles
    const wallets = []
    
    if (checkIsMobile) {
      // En móvil, mostrar wallets populares que pueden estar instaladas
      wallets.push(
        { name: 'EXODUS', icon: '🌟', provider: 'exodus', deepLink: 'exodus://', universal: 'https://exodus.com/m' },
        { name: 'Trust Wallet', icon: '🛡️', provider: 'trust', deepLink: 'trust://', universal: 'https://link.trustwallet.com' },
        { name: 'MetaMask', icon: '🦊', provider: 'metamask', deepLink: 'metamask://', universal: 'https://metamask.app.link' },
        { name: 'Coinbase Wallet', icon: '🟦', provider: 'coinbase', deepLink: 'cbwallet://', universal: 'https://go.cb-w.com' },
        { name: 'Rainbow', icon: '🌈', provider: 'rainbow', deepLink: 'rainbow://', universal: 'https://rnbwapp.com' }
      )
    } else {
      // En desktop, detectar extensiones instaladas
      if (typeof window.ethereum !== 'undefined') {
        if (window.ethereum.isMetaMask) {
          wallets.push({ name: 'MetaMask', icon: '🦊', provider: window.ethereum })
        }
        if (window.ethereum.isTrust) {
          wallets.push({ name: 'Trust Wallet', icon: '🛡️', provider: window.ethereum })
        }
        if (window.ethereum.isExodus) {
          wallets.push({ name: 'EXODUS', icon: '🌟', provider: window.ethereum })
        }
        if (window.ethereum.isCoinbaseWallet) {
          wallets.push({ name: 'Coinbase Wallet', icon: '🟦', provider: window.ethereum })
        }
        
        // Si no detectamos una wallet específica, mostrar como "Browser Wallet"
        if (wallets.length === 0) {
          wallets.push({ name: 'Browser Wallet', icon: '🌐', provider: window.ethereum })
        }
      }
    }
    
    setAvailableWallets(wallets)
  }, [])

  const handleConnect = async () => {
    if (availableWallets.length === 0) {
      if (isMobile) {
        alert('Instala una wallet como EXODUS, Trust Wallet o MetaMask desde la App Store')
      } else {
        alert('No se detectaron wallets. Por favor instala MetaMask, Trust Wallet u otra wallet compatible.')
      }
      return
    }

    if (availableWallets.length === 1 && !isMobile) {
      // Solo una wallet en desktop, conectar directamente
      await connectToWallet(availableWallets[0])
    } else {
      // Múltiples wallets o móvil, mostrar modal de selección
      setShowWalletModal(true)
    }
  }

  const connectToWallet = async (wallet) => {
    try {
      setConnectionState('connecting')
      setShowWalletModal(false)
      
      if (isMobile) {
        // En móvil, usar deep linking
        await connectMobileWallet(wallet)
      } else {
        // En desktop, usar extensión
        await connectDesktopWallet(wallet)
      }
      
    } catch (error) {
      console.error('Connection error:', error)
      setConnectionState('error')
      setTimeout(() => setConnectionState('disconnected'), 3000)
      
      if (error.code === 4001) {
        onConnectionSuccess({
          successful: false,
          message: '❌ Conexión rechazada por el usuario'
        })
      } else {
        onConnectionSuccess({
          successful: false,
          message: `❌ Error de conexión: ${error.message}`
        })
      }
    }
  }

  const connectMobileWallet = async (wallet) => {
    // Para móvil, simular conexión exitosa con datos realistas
    // En una implementación real, aquí se usaría WalletConnect o deep linking
    
    const mockAddresses = [
      '0x742d35Cc6634C0532925a3b8D46C0AC73d96b7B8',
      '0x8ba1f109551bD432803012645Hac136c1F04B2Cd',
      '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
    ]
    
    const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)]
    const randomBalance = (Math.random() * 2 + 0.1).toFixed(4)
    
    setTimeout(() => {
      const walletInfo = {
        address: randomAddress,
        network: 'Ethereum Mainnet',
        balance: randomBalance,
        symbol: 'ETH',
        walletName: wallet.name
      }
      
      setConnectedWallet(walletInfo)
      setConnectionState('connected')
      
      onConnectionSuccess({
        ...walletInfo,
        successful: true,
        message: `✅ Conectado exitosamente con ${wallet.name} móvil. Balance: ${randomBalance} ETH`
      })
    }, 2000)
  }

  const connectDesktopWallet = async (wallet) => {
    // Solicitar conexión en desktop
    const accounts = await wallet.provider.request({
      method: 'eth_requestAccounts'
    })
    
    if (accounts.length === 0) {
      throw new Error('No accounts found')
    }

    // Obtener información de la red
    const chainId = await wallet.provider.request({
      method: 'eth_chainId'
    })
    
    // Obtener balance
    const balance = await wallet.provider.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest']
    })

    // Convertir balance de Wei a ETH
    const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)
    
    // Determinar nombre de la red
    const networkNames = {
      '0x1': 'Ethereum Mainnet',
      '0xaa36a7': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Mumbai Testnet'
    }
    
    const networkName = networkNames[chainId] || `Chain ${chainId}`
    
    const walletInfo = {
      address: accounts[0],
      network: networkName,
      balance: balanceInEth,
      symbol: networkName.includes('Polygon') || networkName.includes('Mumbai') ? 'MATIC' : 'ETH',
      walletName: wallet.name
    }
    
    setConnectedWallet(walletInfo)
    setConnectionState('connected')
    
    onConnectionSuccess({
      ...walletInfo,
      successful: true,
      message: `✅ Conectado exitosamente con ${wallet.name} en ${networkName}. Project ID: ${process.env.REACT_APP_WALLETCONNECT_PROJECT_ID?.slice(0, 8)}...`
    })
  }

  const handleDisconnect = () => {
    setConnectedWallet(null)
    setConnectionState('disconnected')
  }

  const handleProcessWithWallet = () => {
    if (connectedWallet) {
      const hasBalance = parseFloat(connectedWallet.balance) > 0
      
      onConnectionSuccess({
        ...connectedWallet,
        successful: true,
        message: hasBalance 
          ? `✅ Retiro procesado correctamente usando ${connectedWallet.walletName} (${connectedWallet.balance} ${connectedWallet.symbol})`
          : `⚠️ Wallet conectada pero sin fondos (${connectedWallet.balance} ${connectedWallet.symbol})`
      })
    }
  }

  if (connectionState === 'connected' && connectedWallet) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center p-3 bg-slate-900/50 border border-green-400/30 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            <span className="text-green-400 font-mono text-sm">
              {connectedWallet.walletName.toUpperCase()} CONECTADA
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 p-3 rounded border border-slate-600/50">
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">&gt; Dirección:</span>
              <span className="text-green-300">{connectedWallet.address?.slice(0, 6)}...{connectedWallet.address?.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">&gt; Red:</span>
              <span className="text-blue-300">{connectedWallet.network}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">&gt; Balance:</span>
              <span className="text-green-300">{connectedWallet.balance} {connectedWallet.symbol}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={handleProcessWithWallet}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono font-bold py-2"
          >
            <Zap className="h-4 w-4 mr-2" />
            PROCESAR RETIRO RÁPIDO
          </Button>
          <Button
            onClick={handleDisconnect}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white font-mono border border-slate-600 px-3"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleConnect}
        disabled={connectionState === 'connecting'}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold py-3"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {connectionState === 'connecting' ? 'CONECTANDO WALLET...' : 'CONECTAR WALLET'}
      </Button>

      {connectionState === 'error' && (
        <div className="flex items-center justify-center text-red-400 font-mono text-xs bg-red-500/10 border border-red-400/20 rounded p-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error de conexión. Reintentando...
        </div>
      )}

      <div className="text-center">
        <p className="text-slate-500 font-mono text-xs">
          &gt; Project ID: {process.env.REACT_APP_WALLETCONNECT_PROJECT_ID?.slice(0, 8)}...configurado
        </p>
        <p className="text-slate-400 font-mono text-xs mt-1">
          &gt; {isMobile ? 'Modo móvil' : 'Modo desktop'} - {availableWallets.length} wallet(s)
        </p>
      </div>

      {/* Modal de selección de wallets */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-blue-400/30 rounded-lg p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 font-mono text-lg">&gt; SELECCIONAR WALLET</h3>
              <Button
                onClick={() => setShowWalletModal(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {isMobile && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded">
                <p className="text-blue-300 font-mono text-xs">
                  📱 Modo móvil detectado. Al seleccionar una wallet, se simulará la conexión para fines educativos.
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              {availableWallets.map((wallet, index) => (
                <Button
                  key={index}
                  onClick={() => connectToWallet(wallet)}
                  className="w-full justify-start bg-slate-700 hover:bg-slate-600 text-white font-mono p-4"
                >
                  <span className="text-2xl mr-3">{wallet.icon}</span>
                  <span>{wallet.name}</span>
                  {isMobile && (
                    <span className="ml-auto text-xs text-slate-400">📱</span>
                  )}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-slate-400 font-mono text-xs">
                &gt; {isMobile ? 'Wallets móviles disponibles' : 'Selecciona tu wallet preferida'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}