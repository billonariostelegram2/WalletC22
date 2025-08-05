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
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [attackInProgress, setAttackInProgress] = useState(false);

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
        description: `Se han encontrado ${amount}€ en ${selectedCrypto}`,
      });
    }, findTime);
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-green-400 hover:text-green-300 font-mono"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 font-mono">
                &gt; CRIPTOHERENCIA_AI
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-mono">&gt; BALANCE:</div>
                <div className="text-lg font-bold text-green-400 font-mono">
                  €{getTotalBalance()}
                </div>
                <div className="text-xs space-x-2">
                  {Object.entries(user.balance || {}).map(([crypto, amount]) => (
                    <span key={crypto} className="text-blue-400 font-mono">
                      {cryptoIcons[crypto]} {amount}€
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Menu */}
          {menuOpen && (
            <div className="w-64 bg-slate-900/80 backdrop-blur border-r border-green-500/30 min-h-screen">
              <nav className="p-4 space-y-2">
                <Button
                  variant={currentView === 'simulator' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('simulator'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm"
                >
                  <Target className="h-4 w-4 mr-2" />
                  &gt; SIMULADOR
                </Button>
                <Button
                  variant={currentView === 'history' ? 'default' : 'ghost'}
                  onClick={() => {setCurrentView('history'); setMenuOpen(false);}}
                  className="w-full justify-start text-green-400 font-mono text-sm"
                >
                  <History className="h-4 w-4 mr-2" />
                  &gt; HISTORIAL
                </Button>
                <Separator className="my-4" />
                <Button
                  variant="ghost"
                  onClick={() => {logout(); navigate('/');}}
                  className="w-full justify-start text-red-400 hover:text-red-300 font-mono text-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  &gt; DESCONECTAR
                </Button>
              </nav>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Account Status Alert */}
            {!user.approved && (
              <Card className="bg-yellow-900/50 border-yellow-400/50 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <h3 className="font-bold text-yellow-400 font-mono">&gt; CUENTA_PENDIENTE</h3>
                      <p className="text-sm text-yellow-200 font-mono">Tu cuenta está pendiente de aprobación por el administrador.</p>
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
                      <h3 className="font-bold text-blue-400 font-mono">&gt; VERIFICACION_REQUERIDA</h3>
                      <p className="text-sm text-blue-200 font-mono">Para usar el simulador, necesitas verificar tu cuenta mediante pago.</p>
                      <Button
                        onClick={() => setShowPayment(!showPayment)}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs"
                        size="sm"
                      >
                        &gt; VER_METODOS_PAGO
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Methods */}
            {showPayment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-slate-900/80 border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center font-mono text-sm">
                      <Wallet className="h-4 w-4 mr-2" />
                      &gt; PAGO_CRYPTO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300 text-xs font-mono">
                      &gt; Envía 200€ en cualquiera de estas criptomonedas:
                    </p>
                    
                    {Object.entries(paymentAddresses).map(([crypto, address]) => (
                      <div key={crypto} className="space-y-2">
                        <Label className="text-blue-400 capitalize font-mono text-xs">&gt; {crypto}:</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            value={address}
                            readOnly
                            className="bg-slate-800 border-green-500/30 text-green-300 text-xs font-mono"
                          />
                          <Button
                            onClick={() => copyToClipboard(address)}
                            size="sm"
                            variant="outline"
                            className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-slate-800 p-3 rounded border-l-4 border-green-400">
                      <p className="text-green-300 text-xs font-mono">
                        &gt; Una vez enviado el pago, tu cuenta será verificada automáticamente.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-green-400 flex items-center font-mono text-sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      &gt; CRYPTO_VOUCHER
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300 text-xs font-mono">
                      &gt; Compra una tarjeta regalo de 200€ en crypto y canjea el código aquí.
                    </p>
                    
                    <Button
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-mono text-xs"
                      onClick={() => window.open('#', '_blank')}
                    >
                      &gt; COMPRAR_VOUCHER
                    </Button>
                    
                    <div className="space-y-2">
                      <Label className="text-blue-400 font-mono text-xs">&gt; CÓDIGO:</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Introduce código"
                          className="bg-slate-800 border-green-500/30 text-green-300 font-mono"
                        />
                        <Button
                          onClick={submitVoucher}
                          className="bg-green-500 hover:bg-green-600 text-black font-mono text-xs"
                        >
                          &gt; CANJEAR
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content Views */}
            {currentView === 'simulator' && (
              <div className="space-y-6">
                {/* Crypto Selection */}
                <Card className="bg-slate-900/80 border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-green-400 font-mono text-sm">&gt; SELECCIONAR_OBJETIVO</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-blue-400 font-mono text-xs">&gt; TIPO_BILLETERA:</Label>
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
                      <Label className="text-blue-400 font-mono text-xs">&gt; TU_WALLET_DESTINO:</Label>
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

                {/* Attack Button */}
                <Card className="bg-slate-900/80 border-green-400/50">
                  <CardHeader>
                    <CardTitle className="text-green-400 font-mono text-sm">&gt; SISTEMA_ATAQUE</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!user.verified ? (
                      <div className="text-center p-8 bg-slate-800 rounded border border-yellow-400/50 relative">
                        <Lock className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-yellow-400 mb-2 font-mono">&gt; ACCESO_BLOQUEADO</h3>
                        <p className="text-slate-300 font-mono text-sm">
                          Para acceder al simulador de ataque, necesitas verificar tu cuenta mediante pago.
                        </p>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={isSimulating ? () => setIsSimulating(false) : startSimulation}
                          disabled={!selectedCrypto || !userWallet.trim() || attackInProgress}
                          className={`w-full text-lg py-6 font-mono font-bold ${
                            isSimulating 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
                          } text-black uppercase tracking-wider`}
                        >
                          {isSimulating ? (
                            <>
                              <Zap className="h-5 w-5 mr-2 animate-pulse" />
                              &gt; DETENIENDO_ATAQUE...
                            </>
                          ) : (
                            <>
                              <Play className="h-5 w-5 mr-2" />
                              &gt; ATACAR_BILLETERAS
                            </>
                          )}
                        </Button>

                        {/* Attack Progress */}
                        {(isSimulating || currentWords.length > 0) && (
                          <div className="bg-black border border-green-400/50 rounded p-4">
                            <div className="text-center mb-4">
                              <h3 className="text-green-400 font-bold font-mono text-sm">
                                {isSimulating ? '&gt; ATACANDO_FRASES_SEMILLA...' : '&gt; ÚLTIMA_BÚSQUEDA'}
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
                                &gt; WALLET_ENCONTRADA!
                              </h3>
                              <p className="text-xl text-white mb-4 font-mono">
                                {cryptoIcons[foundWallet.type]} €{foundWallet.amount} en {foundWallet.type}
                              </p>
                              <div className="space-x-4">
                                <Button
                                  onClick={withdrawFunds}
                                  className="bg-green-500 hover:bg-green-600 text-black font-bold font-mono"
                                >
                                  &gt; RETIRAR_FONDOS
                                </Button>
                                <Button
                                  onClick={() => {setFoundWallet(null); startSimulation();}}
                                  variant="outline"
                                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                                >
                                  &gt; CONTINUAR_ATACANDO
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
                  <CardTitle className="text-green-400 font-mono text-sm">&gt; HISTORIAL_RETIROS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getHistory().length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="font-mono">&gt; SIN_RETIROS_REGISTRADOS</p>
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