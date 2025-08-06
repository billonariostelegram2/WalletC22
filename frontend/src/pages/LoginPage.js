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
        // CRÍTICO: Buscar en base de datos central primero
        let users = [];
        
        // Cargar de DB central
        const centralData = localStorage.getItem('cryptoherencia_central_db');
        if (centralData) {
          try {
            const parsed = JSON.parse(centralData);
            users = parsed.users || [];
          } catch (e) {
            console.log('Central DB parse error:', e);
          }
        }
        
        // Si no está en central, buscar en local como respaldo
        if (users.length === 0) {
          users = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
        }
        
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center relative overflow-hidden p-4">
      {/* Subtle Matrix background */}
      <div className="absolute inset-0 opacity-2">
        {[...Array(20)].map((_, i) => (
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

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-white/95 backdrop-blur border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Iniciar Sesión
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-slate-800 placeholder:text-slate-500"
                  placeholder="Email"
                />
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-slate-800 placeholder:text-slate-500 pr-12"
                    placeholder="Contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/registro"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Registrarse
              </Link>
            </div>
          </CardContent>
        </Card>
        
        {/* Back button */}
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;