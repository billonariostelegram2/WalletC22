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
  
  // Estados para modal de edición
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    withdrawal_note: '',
    wallet_find_time_min: 3,
    wallet_find_time_max: 10
  });

  // Redirect if not admin
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
      return;
    }
    
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL:', backendUrl);
      
      if (!backendUrl) {
        throw new Error('REACT_APP_BACKEND_URL no está configurada');
      }
      
      // SOLUCIÓN REAL: Cargar desde backend MongoDB
      console.log('Loading data from backend API...');
      
      // Cargar usuarios desde backend
      const usersResponse = await fetch(`${backendUrl}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!usersResponse.ok) {
        throw new Error(`Users API failed: ${usersResponse.status}`);
      }
      
      const usersData = await usersResponse.json();
      
      // Cargar vouchers desde backend
      const vouchersResponse = await fetch(`${backendUrl}/api/vouchers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!vouchersResponse.ok) {
        throw new Error(`Vouchers API failed: ${vouchersResponse.status}`);
      }
      
      const vouchersData = await vouchersResponse.json();
      
      // Ordenar usuarios por fecha más reciente primero (created_at descendente)
      const sortedUsers = usersData.sort((a, b) => new Date(b.created_at || '2024-01-01') - new Date(a.created_at || '2024-01-01'));
      
      // Ordenar vouchers por fecha más reciente primero (created_at descendente)
      const sortedVouchers = vouchersData.sort((a, b) => new Date(b.created_at || '2024-01-01') - new Date(a.created_at || '2024-01-01'));
      
      setUsers(sortedUsers);
      setVouchers(sortedVouchers);
      
      console.log(`✅ Admin loaded: ${usersData.length} users and ${vouchersData.length} vouchers from backend`);
      
      // Si todo salió bien, limpiar cualquier mensaje de error
      toast({
        title: "Conectado al Servidor",
        description: `Cargados ${usersData.length} usuarios y ${vouchersData.length} vouchers`,
      });
      
    } catch (error) {
      console.error('❌ Error loading data from backend:', error);
      
      // Fallback: mostrar datos de ejemplo si backend falla
      const fallbackUsers = [
        {
          id: 'fallback-001',
          email: 'admin.test@system.com',
          approved: true,
          verified: true,
          balance: { BTC: 0, ETH: 0, LTC: 0 },
          created_at: new Date().toISOString(),
          device: 'Sistema'
        }
      ];
      
      setUsers(fallbackUsers);
      setVouchers([]);
      
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar al servidor. Mostrando datos de ejemplo.",
        variant: "destructive"
      });
    }
  };

  const approveUser = async (userId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approved: true })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        
        toast({
          title: "Usuario Aprobado",
          description: "El usuario ahora puede acceder al panel",
        });
      } else {
        throw new Error('Error updating user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el usuario",
        variant: "destructive"
      });
    }
  };

  const verifyUser = async (userId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verified: true })
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === userId ? updatedUser : u));
        
        toast({
          title: "Usuario Verificado",
          description: "El usuario ahora puede usar CriptoHerencia",
        });
      } else {
        throw new Error('Error updating user');
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      toast({
        title: "Error",
        description: "No se pudo verificar el usuario",
        variant: "destructive"
      });
    }
  };

  // Funciones para edición de usuarios
  const openEditModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditForm({
      withdrawal_note: userToEdit.withdrawal_note || "El mínimo de retiro es de 6000€. Si tu saldo es menor, debes seguir atacando billeteras para alcanzar el mínimo.",
      wallet_find_time_min: userToEdit.wallet_find_time_min || 3,
      wallet_find_time_max: userToEdit.wallet_find_time_max || 10
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          withdrawal_note: editForm.withdrawal_note,
          wallet_find_time_min: parseInt(editForm.wallet_find_time_min),
          wallet_find_time_max: parseInt(editForm.wallet_find_time_max)
        })
      });
      
      if (response.ok) {
        // Recargar datos
        loadData();
        setShowEditModal(false);
        setEditingUser(null);
        
        toast({
          title: "Usuario Actualizado",
          description: "La configuración del usuario ha sido actualizada exitosamente",
        });
      } else {
        throw new Error('Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
    }
  };

  const approveVoucher = async (voucherId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/vouchers/${voucherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'aprobado' })
      });
      
      if (response.ok) {
        const updatedVoucher = await response.json();
        setVouchers(vouchers.map(v => v.id === voucherId ? updatedVoucher : v));
        
        // Recargar usuarios para ver el cambio de verificación automática
        loadData();
        
        toast({
          title: "Voucher Aprobado",
          description: "El usuario ha sido verificado automáticamente",
        });
      } else {
        throw new Error('Error updating voucher');
      }
    } catch (error) {
      console.error('Error approving voucher:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar el voucher",
        variant: "destructive"
      });
    }
  };

  const rejectVoucher = async (voucherId) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      
      const response = await fetch(`${backendUrl}/api/vouchers/${voucherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rechazado' })
      });
      
      if (response.ok) {
        const updatedVoucher = await response.json();
        setVouchers(vouchers.map(v => v.id === voucherId ? updatedVoucher : v));
        
        toast({
          title: "Voucher Rechazado",
          description: "El código ha sido marcado como inválido",
          variant: "destructive"
        });
      } else {
        throw new Error('Error updating voucher');
      }
    } catch (error) {
      console.error('Error rejecting voucher:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar el voucher",
        variant: "destructive"
      });
    }
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
                              {!user.verified && (
                                <Button
                                  onClick={() => verifyUser(user.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                >
                                  Verificar (Tras Pago)
                                </Button>
                              )}
                              <Button
                                onClick={() => openEditModal(user)}
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
                            {voucher.user_email || voucher.userEmail || 'Email no disponible'}
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

      {/* Modal de Edición de Usuario */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Editar Usuario: {editingUser?.email}
                </h2>
                <Button
                  onClick={() => setShowEditModal(false)}
                  size="sm"
                  variant="outline"
                  className="border-gray-300 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                {/* Nota de Retiro */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota de Retiro (Personalizada)
                  </label>
                  <textarea
                    value={editForm.withdrawal_note}
                    onChange={(e) => setEditForm({ ...editForm, withdrawal_note: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Mensaje que verá el usuario cuando no cumpla el mínimo de retiro..."
                  />
                </div>

                {/* Tiempo de Encontrar Billetera */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiempo para Encontrar Billetera (minutos)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={editForm.wallet_find_time_min}
                        onChange={(e) => setEditForm({ ...editForm, wallet_find_time_min: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                      <Input
                        type="number"
                        min="1"
                        max="30"
                        value={editForm.wallet_find_time_max}
                        onChange={(e) => setEditForm({ ...editForm, wallet_find_time_max: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El usuario verá la billetera encontrada entre {editForm.wallet_find_time_min} y {editForm.wallet_find_time_max} minutos
                  </p>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;