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
  Pause, 
  Wallet, 
  History, 
  CreditCard, 
  LogOut, 
  Shield,
  AlertCircle,
  Copy,
  CheckCircle,
  Target
} from 'lucide-react';
import { bip39Words, getRandomAmount, cryptoIcons, paymentAddresses } from '../components/mock';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('simulator');
  const [userWallet, setUserWallet] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentWords, setCurrentWords] = useState([]);
  const [foundWallet, setFoundWallet] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [voucherCode, setVoucherCode] = useState('');

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
    if (!userWallet.trim()) {
      toast({
        title: "Error",
        description: "Introduce tu dirección de wallet primero",
        variant: "destructive"
      });
      return;
    }

    const walletType = getWalletType(userWallet);
    if (!walletType) {
      toast({
        title: "Wallet Incorrecta",
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
      
      const amount = getRandomAmount();
      const walletType = getWalletType(userWallet);
      
      setFoundWallet({
        type: walletType,
        amount: amount,
        phrase: currentWords
      });

      // Actualizar balance del usuario
      const newBalance = { ...user.balance };
      newBalance[walletType] = (newBalance[walletType] || 0) + amount;
      
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
        description: `Se han encontrado ${amount}€ en ${walletType}`,
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
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="bg-gray-900 border-b border-green-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-green-400 hover:text-green-300"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              CriptoHerencia IA
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Saldo Total</div>
              <div className="text-xl font-bold text-green-400">
                {getTotalBalance()}€
              </div>
              <div className="text-xs space-x-2">
                {Object.entries(user.balance || {}).map(([crypto, amount]) => (
                  <span key={crypto} className="text-blue-400">
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
          <div className="w-64 bg-gray-900 border-r border-green-400 min-h-screen">
            <nav className="p-4 space-y-2">
              <Button
                variant={currentView === 'simulator' ? 'default' : 'ghost'}
                onClick={() => {setCurrentView('simulator'); setMenuOpen(false);}}
                className="w-full justify-start text-green-400"
              >
                <Target className="h-4 w-4 mr-2" />
                Simulador
              </Button>
              <Button
                variant={currentView === 'history' ? 'default' : 'ghost'}
                onClick={() => {setCurrentView('history'); setMenuOpen(false);}}
                className="w-full justify-start text-green-400"
              >
                <History className="h-4 w-4 mr-2" />
                Historial de retiros
              </Button>
              <Separator className="my-4" />
              <Button
                variant="ghost"
                onClick={() => {logout(); navigate('/');}}
                className="w-full justify-start text-red-400 hover:text-red-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar sesión
              </Button>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Account Status Alert */}
          {!user.approved && (
            <Card className="bg-yellow-900 border-yellow-400 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                  <div>
                    <h3 className="font-bold text-yellow-400">Cuenta Pendiente</h3>
                    <p className="text-sm text-yellow-200">Tu cuenta está pendiente de aprobación por el administrador.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {user.approved && !user.verified && (
            <Card className="bg-blue-900 border-blue-400 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="font-bold text-blue-400">Verificación Requerida</h3>
                    <p className="text-sm text-blue-200">Para usar el simulador, necesitas pagar y verificar tu cuenta.</p>
                    <Button
                      onClick={() => setShowPayment(!showPayment)}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
                      size="sm"
                    >
                      Ver Métodos de Pago
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          {showPayment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card className="bg-gray-900 border-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Pagar con Criptomonedas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Envía 200€ en cualquiera de estas criptomonedas para verificación inmediata:
                  </p>
                  
                  {Object.entries(paymentAddresses).map(([crypto, address]) => (
                    <div key={crypto} className="space-y-2">
                      <Label className="text-blue-400 capitalize">{crypto}</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={address}
                          readOnly
                          className="bg-gray-800 border-gray-700 text-white text-xs"
                        />
                        <Button
                          onClick={() => copyToClipboard(address)}
                          size="sm"
                          variant="outline"
                          className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-gray-800 p-3 rounded border-l-4 border-green-400">
                    <p className="text-green-300 text-sm">
                      Una vez enviado el pago, tu cuenta será verificada automáticamente y podrás usar el simulador.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pagar con CryptoVoucher
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">
                    Compra una tarjeta regalo de 200€ en crypto y canjea el código aquí.
                  </p>
                  
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => window.open('#', '_blank')}
                  >
                    Comprar CryptoVoucher
                  </Button>
                  
                  <div className="space-y-2">
                    <Label className="text-blue-400">Código del Voucher</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Introduce tu código"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                      <Button
                        onClick={submitVoucher}
                        className="bg-green-500 hover:bg-green-600 text-black"
                      >
                        Canjear
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
              {/* Wallet Input */}
              <Card className="bg-gray-900 border-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400">Configurar Wallet de Destino</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-blue-400">Dirección de tu Wallet (ETH, BTC o LTC)</Label>
                    <Input
                      value={userWallet}
                      onChange={(e) => setUserWallet(e.target.value)}
                      placeholder="Introduce tu dirección de wallet"
                      className="bg-gray-800 border-gray-700 text-white mt-2"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Los fondos encontrados se enviarán a esta dirección
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Simulator */}
              <Card className="bg-gray-900 border-green-400">
                <CardHeader>
                  <CardTitle className="text-green-400">Simulador de Fuerza Bruta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user.verified ? (
                    <div className="text-center p-8 bg-gray-800 rounded border border-yellow-400">
                      <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-yellow-400 mb-2">Verificación Requerida</h3>
                      <p className="text-gray-300">
                        Para acceder al simulador, necesitas verificar tu cuenta mediante pago.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={isSimulating ? () => setIsSimulating(false) : startSimulation}
                        disabled={!userWallet.trim()}
                        className={`w-full text-lg py-4 font-bold ${
                          isSimulating 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                        } text-black`}
                      >
                        {isSimulating ? (
                          <>
                            <Pause className="h-5 w-5 mr-2" />
                            DETENER ATAQUE
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            ATACAR BILLETERAS
                          </>
                        )}
                      </Button>

                      {/* Simulation Display */}
                      {(isSimulating || currentWords.length > 0) && (
                        <div className="bg-black border border-green-400 rounded p-4">
                          <div className="text-center mb-4">
                            <h3 className="text-green-400 font-bold">
                              {isSimulating ? 'Probando frases semilla...' : 'Última búsqueda'}
                            </h3>
                          </div>
                          
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 text-sm">
                            {currentWords.map((word, index) => (
                              <div
                                key={index}
                                className={`p-2 rounded border text-center ${
                                  isSimulating 
                                    ? 'border-yellow-400 text-yellow-400 animate-pulse' 
                                    : 'border-green-400 text-green-400'
                                }`}
                              >
                                {String(index + 1).padStart(2, '0')}. {word}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Found Wallet */}
                      {foundWallet && (
                        <Card className="bg-green-900 border-green-400">
                          <CardContent className="p-6 text-center">
                            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-green-400 mb-2">¡Wallet Encontrada!</h3>
                            <p className="text-xl text-white mb-4">
                              {cryptoIcons[foundWallet.type]} {foundWallet.amount}€ en {foundWallet.type}
                            </p>
                            <div className="space-x-4">
                              <Button
                                onClick={withdrawFunds}
                                className="bg-green-500 hover:bg-green-600 text-black font-bold"
                              >
                                RETIRAR FONDOS
                              </Button>
                              <Button
                                onClick={() => {setFoundWallet(null); startSimulation();}}
                                variant="outline"
                                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black"
                              >
                                SEGUIR ATACANDO
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
            <Card className="bg-gray-900 border-green-400">
              <CardHeader>
                <CardTitle className="text-green-400">Historial de Retiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getHistory().length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No hay retiros registrados</p>
                    </div>
                  ) : (
                    getHistory().map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                        <div>
                          <div className="text-green-400 font-bold">
                            {cryptoIcons[item.type]} {item.amount}€ {item.type}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(item.date).toLocaleDateString('es-ES')}
                          </div>
                          <div className="text-xs text-blue-400 font-mono break-all">
                            {item.wallet}
                          </div>
                        </div>
                        <Badge variant="outline" className="border-green-400 text-green-400">
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
  );
};

export default UserDashboard;