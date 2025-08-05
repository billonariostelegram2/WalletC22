import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center relative overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse text-green-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      <div className="w-full max-w-md mx-auto p-6 relative z-10">
        <Card className="bg-gray-900 border-green-400 shadow-2xl shadow-green-400/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-green-400 hover:text-green-300 p-0"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Volver
              </Button>
            </div>
            
            <CardTitle className="text-3xl text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Iniciar Sesión
            </CardTitle>
            <p className="text-center text-gray-400">
              Accede a tu panel de control
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-400">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-800 border-gray-700 text-white focus:border-green-400"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-400">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-green-400 pr-10"
                    placeholder="Tu contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-green-400"
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
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold text-lg py-3"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Accediendo...
                  </div>
                ) : (
                  'ACCEDER AL SISTEMA'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-400">¿No tienes cuenta?</p>
              <Link
                to="/registro"
                className="text-green-400 hover:text-green-300 underline font-medium"
              >
                Crear cuenta gratis aquí
              </Link>
            </div>

            <div className="mt-8 p-4 bg-gray-800 border border-blue-400 rounded-lg">
              <p className="text-sm text-blue-300 text-center">
                <strong>Acceso Admin:</strong><br />
                Email: criptoherencia@admin.com<br />
                Contraseña: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;