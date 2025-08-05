import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (formData.password.length < 6) {
        toast({
          title: "Error de Validación",
          description: "La contraseña debe tener al menos 6 caracteres",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Obtener usuarios existentes
      const existingUsers = JSON.parse(localStorage.getItem('cryptoherencia_users') || '[]');
      
      // Verificar si el email ya existe
      if (existingUsers.find(u => u.email === formData.email)) {
        toast({
          title: "Error de Registro",
          description: "Este email ya está registrado",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now().toString(),
        email: formData.email,
        password: formData.password,
        referralCode: formData.referralCode,
        approved: false,
        verified: false,
        balance: {
          BTC: 0,
          ETH: 0,
          LTC: 0
        },
        wallet: '',
        createdAt: new Date().toISOString()
      };

      // Guardar usuario
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem('cryptoherencia_users', JSON.stringify(updatedUsers));

      // Hacer login automático pero redirigir a login con mensaje
      toast({
        title: "¡Cuenta Creada!",
        description: "Tu cuenta será aprobada por un administrador",
      });

      // Redirigir a login después de un breve delay
      setTimeout(() => {
        navigate('/login?pending=true');
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al crear la cuenta",
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
              Registrarse
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

              <div className="space-y-2">
                <Input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-slate-800 placeholder:text-slate-500"
                  placeholder="Código de referido (opcional)"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  'Registrarse'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Ya tengo cuenta
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

export default RegisterPage;