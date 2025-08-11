import React, { useState } from 'react'
import { Button } from './ui/button'
import { Wallet, AlertTriangle, Zap } from 'lucide-react'

export function WalletConnectButton({ onConnectionSuccess }) {
  const [connectionState, setConnectionState] = useState('disconnected')

  const handleConnect = async () => {
    try {
      setConnectionState('connecting')
      
      // Simulación temporal hasta que se resuelva el problema de compatibilidad
      setTimeout(() => {
        setConnectionState('demo')
        onConnectionSuccess({
          address: '0x1234...5678',
          network: 'Sepolia Testnet',
          balance: '1.2345',
          symbol: 'ETH',
          successful: true,
          message: 'Demostración de WalletConnect completada. Conecta un Project ID real para funcionalidad completa.'
        })
      }, 2000)
      
    } catch (error) {
      console.error('WalletConnect connection failed:', error)
      setConnectionState('error')
      setTimeout(() => setConnectionState('disconnected'), 3000)
    }
  }

  if (connectionState === 'demo') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-center p-3 bg-blue-500/20 border border-blue-400/30 rounded">
          <span className="text-blue-300 font-mono text-sm">🎯 DEMO MODE - Configurar Project ID para funcionalidad completa</span>
        </div>
        
        <Button
          onClick={() => setConnectionState('disconnected')}
          variant="outline"
          className="w-full text-slate-400 hover:text-white font-mono border-slate-600"
        >
          RESETEAR DEMO
        </Button>
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
        {connectionState === 'connecting' ? 'CONECTANDO...' : 'CONECTAR WALLET (DEMO)'}
      </Button>

      {connectionState === 'error' && (
        <div className="flex items-center justify-center text-red-400 font-mono text-xs bg-red-500/10 border border-red-400/20 rounded p-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Error de conexión. Reintentando...
        </div>
      )}

      <div className="text-center">
        <p className="text-slate-500 font-mono text-xs">
          &gt; Modo demostración - Configura Project ID para WalletConnect real
        </p>
      </div>
    </div>
  )
}