import React, { useState, useEffect } from 'react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { Button } from './ui/button'
import { Wallet, CheckCircle, AlertTriangle, Zap, X } from 'lucide-react'

export function WalletConnectButton({ onConnectionSuccess }) {
  const { open } = useWeb3Modal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [connectionState, setConnectionState] = useState('disconnected')
  const [showDetails, setShowDetails] = useState(false)

  const { data: balance, isError, isLoading } = useBalance({
    address: address,
    enabled: isConnected,
  })

  useEffect(() => {
    if (isConnected && address) {
      setConnectionState('connected')
    } else {
      setConnectionState('disconnected')
    }
  }, [isConnected, address])

  const handleConnect = async () => {
    try {
      setConnectionState('connecting')
      await open()
    } catch (error) {
      console.error('WalletConnect connection failed:', error)
      setConnectionState('error')
      setTimeout(() => setConnectionState('disconnected'), 3000)
    }
  }

  const handleProcessWithWallet = () => {
    if (isConnected && balance) {
      const balanceInEth = parseFloat(balance.formatted || '0')
      const hasEnoughBalance = balanceInEth > 0
      
      if (hasEnoughBalance) {
        onConnectionSuccess({
          address,
          network: chain?.name || 'Unknown',
          balance: balance.formatted,
          symbol: balance.symbol,
          successful: true,
          message: `Conexión correcta. Su retiro será procesado usando WalletConnect en ${chain?.name || 'testnet'}.`
        })
      } else {
        onConnectionSuccess({
          address,
          network: chain?.name || 'Unknown', 
          balance: '0',
          symbol: balance.symbol,
          successful: false,
          message: `Wallet conectada correctamente pero sin fondos en ${chain?.name || 'testnet'}.`
        })
      }
    }
  }

  if (isConnected && address) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-green-400/30 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            <span className="text-green-400 font-mono text-sm">WALLET CONECTADA</span>
          </div>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 font-mono text-xs h-6"
          >
            {showDetails ? 'OCULTAR' : 'VER'}
          </Button>
        </div>

        {showDetails && (
          <div className="bg-slate-900/80 p-3 rounded border border-slate-600/50">
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">&gt; Dirección:</span>
                <span className="text-green-300">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">&gt; Red:</span>
                <span className="text-blue-300">{chain?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">&gt; Balance:</span>
                <span className="text-green-300">
                  {isLoading ? 'Cargando...' : 
                   isError ? 'Error' : 
                   `${parseFloat(balance?.formatted || '0').toFixed(4)} ${balance?.symbol}`}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button
            onClick={handleProcessWithWallet}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono font-bold py-2"
            disabled={isLoading}
          >
            <Zap className="h-4 w-4 mr-2" />
            PROCESAR RETIRO RÁPIDO
          </Button>
          <Button
            onClick={disconnect}
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
          &gt; Entorno de prueba seguro para aprendizaje
        </p>
      </div>
    </div>
  )
}