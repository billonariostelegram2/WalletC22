import React, { useState, useEffect } from 'react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect, useBalance } from 'wagmi'
import { Button } from './ui/button'
import { Wallet, CheckCircle, AlertTriangle, Zap } from 'lucide-react'

export function WalletConnectButton({ withdrawAmount, onConnectionSuccess }) {
  const { open } = useWeb3Modal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [connectionState, setConnectionState] = useState('disconnected')
  const [showConnectionDetails, setShowConnectionDetails] = useState(false)

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
          message: `Conexión correcta con ${chain?.name || 'testnet'}. Su retiro será procesado usando WalletConnect.`
        })
      } else {
        onConnectionSuccess({
          address,
          network: chain?.name || 'Unknown', 
          balance: '0',
          symbol: balance.symbol,
          successful: false,
          message: `Wallet conectada pero sin fondos suficientes en ${chain?.name || 'testnet'}.`
        })
      }
    }
  }

  const shouldShowFastMethod = withdrawAmount && parseFloat(withdrawAmount) >= 6000

  if (isConnected && address) {
    return (
      <div className="mt-4 p-4 bg-slate-800/50 border border-blue-400/30 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
            <span className="text-green-400 font-mono text-sm">WALLET CONECTADA</span>
          </div>
          <Button
            onClick={() => setShowConnectionDetails(!showConnectionDetails)}
            variant="ghost"
            size="sm"
            className="text-blue-400 hover:text-blue-300 font-mono text-xs"
          >
            {showConnectionDetails ? 'OCULTAR' : 'DETALLES'}
          </Button>
        </div>

        {showConnectionDetails && (
          <div className="bg-slate-900/80 p-3 rounded border border-slate-600 mb-3">
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
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-mono font-bold"
            disabled={isLoading}
          >
            <Zap className="h-4 w-4 mr-2" />
            PROCESAR CON WALLET
          </Button>
          <Button
            onClick={disconnect}
            variant="outline"
            size="sm"
            className="text-slate-400 hover:text-white font-mono border-slate-600"
          >
            DESCONECTAR
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Wallet className="h-4 w-4 text-blue-400 mr-2" />
          <span className="text-blue-400 font-mono text-sm">MÉTODO ALTERNATIVO</span>
        </div>
        {shouldShowFastMethod && (
          <div className="flex items-center bg-blue-500/20 px-2 py-1 rounded">
            <Zap className="h-3 w-3 text-blue-400 mr-1" />
            <span className="text-blue-300 font-mono text-xs">MÉTODO RÁPIDO</span>
          </div>
        )}
      </div>

      {shouldShowFastMethod && (
        <div className="bg-blue-500/10 border border-blue-400/30 rounded p-3 mb-3">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-4 w-4 text-blue-400 mr-2" />
            <span className="text-blue-300 font-mono text-sm">Conexión segura</span>
          </div>
          <p className="text-slate-300 font-mono text-xs">
            &gt; Este método es más rápido y no requiere pasos adicionales
          </p>
          <p className="text-slate-400 font-mono text-xs mt-1">
            &gt; Método rápido verificado para importes superiores a 6,000 USDT
          </p>
        </div>
      )}

      <Button
        onClick={handleConnect}
        disabled={connectionState === 'connecting'}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-mono font-bold py-3"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {connectionState === 'connecting' ? 'CONECTANDO...' : 'CONECTAR BILLETERA'}
      </Button>

      {connectionState === 'error' && (
        <div className="mt-2 flex items-center text-red-400 font-mono text-xs">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error de conexión. Inténtalo de nuevo.
        </div>
      )}

      <div className="mt-2 text-center">
        <p className="text-slate-400 font-mono text-xs">
          &gt; Testnet seguro para aprendizaje
        </p>
      </div>
    </div>
  )
}