import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, Lock } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Show pending approval message if redirected from register
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('pending') === 'true') {
      toast({
        title: "Cuenta Pendiente",
        description: "Tu cuenta debe ser aprobada por el administrador antes de poder acceder",
        duration: 5000
      });
    }
  }, [location, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular login
      if (formData.email === 'criptoherencia@admin.com' && formData.password === 'admin123') {
        const adminUser = {
          id: 'admin',
          email: formData.email,
          isAdmin: true,
          approved: true,
          verified: true
        };
        login(adminUser);
        toast({
          title: "Acceso Concedido",
          description: "Bienvenido, Administrador",
        });
        navigate('/admin');
      } else {
        // Simular usuarios regulares
        const users = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
        const user = users.find(u => u.email === formData.email && u.password === formData.password);
        
        if (user) {
          login(user);
          toast({
            title: "Acceso Concedido",
            description: user.approved 
              ? "Bienvenido al panel de control" 
              : "Tu cuenta está pendiente de aprobación",
          });
          navigate('/panel');
        } else {
          toast({
            title: "Error de Acceso",
            description: "Email o contraseña incorrectos",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al intentar iniciar sesión",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-green-400 font-mono flex items-center justify-center relative overflow-hidden">
      {/* Subtle Matrix background */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse text-green-500 text-xs font-mono"
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

      <div className="w-full max-w-md mx-auto p-6 relative z-10">
        <Card className="bg-slate-900/80 backdrop-blur border-green-500/30 shadow-2xl shadow-green-500/10">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-green-400 hover:text-green-300 p-0 font-mono"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                VOLVER
              </Button>
            </div>
            
            <div className="text-center">
              <Lock className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <CardTitle className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 font-mono">
                ACCESO AL SISTEMA
              </CardTitle>
              <p className="text-slate-400 mt-2 font-mono text-sm">
                &gt; Introduce tus credenciales_
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-400 font-mono text-sm">&gt; EMAIL:</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-slate-800 border-green-500/30 text-green-300 focus:border-green-400 font-mono placeholder:text-slate-500"
                  placeholder="usuario@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-400 font-mono text-sm">&gt; PASSWORD:</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-slate-800 border-green-500/30 text-green-300 focus:border-green-400 font-mono placeholder:text-slate-500 pr-10"
                    placeholder="••••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-green-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-black font-mono font-bold text-sm py-3 uppercase tracking-wider"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    VERIFICANDO...
                  </div>
                ) : (
                  '&gt; INICIAR SESIÓN'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-slate-400 font-mono text-xs">&gt; ¿Sin acceso?</p>
              <Link
                to="/registro"
                className="text-green-400 hover:text-green-300 underline font-mono text-sm"
              >
                CREAR_CUENTA.exe
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;