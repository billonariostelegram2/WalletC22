import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Users, 
  CreditCard, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock,
  Shield,
  Settings
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

  const loadData = () => {
    // Load users
    const savedUsers = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
    setUsers(savedUsers);
    
    // Load vouchers
    const savedVouchers = JSON.parse(localStorage.getItem('cryptovouchers') || '[]');
    setVouchers(savedVouchers);
  };

  const approveUser = (userId) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, approved: true } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('cryptoherencia_users', JSON.stringify(updatedUsers));
    
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
    localStorage.setItem('cryptoherencia_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuario Verificado",
      description: "El usuario ahora puede usar el simulador",
    });
  };

  const approveVoucher = (voucherId) => {
    const updatedVouchers = vouchers.map(v => 
      v.id === voucherId ? { ...v, status: 'aprobado' } : v
    );
    setVouchers(updatedVouchers);
    localStorage.setItem('cryptovouchers', JSON.stringify(updatedVouchers));
    
    // Find and verify the user
    const voucher = vouchers.find(v => v.id === voucherId);
    if (voucher) {
      const updatedUsers = users.map(u => 
        u.email === voucher.userEmail ? { ...u, verified: true, approved: true } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('cryptoherencia_users', JSON.stringify(updatedUsers));
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
    localStorage.setItem('cryptovouchers', JSON.stringify(updatedVouchers));
    
    toast({
      title: "Voucher Rechazado",
      description: "El código ha sido marcado como inválido",
      variant: "destructive"
    });
  };

  if (!user || !user.isAdmin) return null;

  const pendingUsers = users.filter(u => !u.approved);
  const pendingVouchers = vouchers.filter(v => v.status === 'pendiente');

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* Header */}
      <header className="bg-gray-900 border-b border-green-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-green-400" />
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Panel de Administrador
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="border-blue-400 text-blue-400">
              {user.email}
            </Badge>
            <Button
              variant="ghost"
              onClick={() => {logout(); navigate('/');}}
              className="text-red-400 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={currentView === 'users' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('users')}
            className="text-green-400"
          >
            <Users className="h-4 w-4 mr-2" />
            Usuarios ({pendingUsers.length})
          </Button>
          <Button
            variant={currentView === 'vouchers' ? 'default' : 'ghost'}
            onClick={() => setCurrentView('vouchers')}
            className="text-green-400"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            CryptoVouchers ({pendingVouchers.length})
          </Button>
        </div>

        {/* Users View */}
        {currentView === 'users' && (
          <div className="space-y-6">
            <Card className="bg-gray-900 border-green-400">
              <CardHeader>
                <CardTitle className="text-green-400">Usuarios Pendientes de Aprobación</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No hay usuarios pendientes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                        <div>
                          <div className="text-green-400 font-bold">{user.email}</div>
                          <div className="text-sm text-gray-400">
                            Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                          </div>
                          {user.referralCode && (
                            <div className="text-xs text-blue-400">
                              Código referido: {user.referralCode}
                            </div>
                          )}
                          <div className="flex space-x-2 mt-2">
                            <Badge variant="outline" className={user.approved ? "border-green-400 text-green-400" : "border-yellow-400 text-yellow-400"}>
                              {user.approved ? "Aprobado" : "Pendiente"}
                            </Badge>
                            <Badge variant="outline" className={user.verified ? "border-blue-400 text-blue-400" : "border-red-400 text-red-400"}>
                              {user.verified ? "Verificado" : "Sin Verificar"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-x-2">
                          {!user.approved && (
                            <Button
                              onClick={() => approveUser(user.id)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-black"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                          )}
                          {user.approved && !user.verified && (
                            <Button
                              onClick={() => verifyUser(user.id)}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Verificar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Users Overview */}
            <Card className="bg-gray-900 border-green-400">
              <CardHeader>
                <CardTitle className="text-green-400">Todos los Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No hay usuarios registrados</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                        <div>
                          <div className="text-green-400 font-bold">{user.email}</div>
                          <div className="text-sm text-gray-400">
                            Balance total: {Object.values(user.balance || {}).reduce((sum, val) => sum + val, 0)}€
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant="outline" className={user.approved ? "border-green-400 text-green-400" : "border-yellow-400 text-yellow-400"}>
                              {user.approved ? "Aprobado" : "Pendiente"}
                            </Badge>
                            <Badge variant="outline" className={user.verified ? "border-blue-400 text-blue-400" : "border-red-400 text-red-400"}>
                              {user.verified ? "Verificado" : "Sin Verificar"}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-x-2">
                          {!user.approved && (
                            <Button
                              onClick={() => approveUser(user.id)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-black"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                          )}
                          {user.approved && !user.verified && (
                            <Button
                              onClick={() => verifyUser(user.id)}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Verificar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vouchers View */}
        {currentView === 'vouchers' && (
          <Card className="bg-gray-900 border-green-400">
            <CardHeader>
              <CardTitle className="text-green-400">CryptoVouchers Recibidos</CardTitle>
            </CardHeader>
            <CardContent>
              {vouchers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No hay vouchers recibidos</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {vouchers.map((voucher) => (
                    <div key={voucher.id} className="flex items-center justify-between p-4 bg-gray-800 rounded border border-gray-700">
                      <div>
                        <div className="text-green-400 font-bold">{voucher.userEmail}</div>
                        <div className="text-blue-400 font-mono">{voucher.code}</div>
                        <div className="text-sm text-gray-400">
                          Enviado: {new Date(voucher.date).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={
                            voucher.status === 'aprobado' ? "border-green-400 text-green-400" :
                            voucher.status === 'rechazado' ? "border-red-400 text-red-400" :
                            "border-yellow-400 text-yellow-400"
                          }
                        >
                          {voucher.status === 'aprobado' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {voucher.status === 'rechazado' && <XCircle className="h-3 w-3 mr-1" />}
                          {voucher.status === 'pendiente' && <Clock className="h-3 w-3 mr-1" />}
                          {voucher.status.toUpperCase()}
                        </Badge>
                        
                        {voucher.status === 'pendiente' && (
                          <div className="space-x-2">
                            <Button
                              onClick={() => approveVoucher(voucher.id)}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-black"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => rejectVoucher(voucher.id)}
                              size="sm"
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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