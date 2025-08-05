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
    confirmPassword: '',
    referralCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error de Validación",
          description: "Las contraseñas no coinciden",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

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

      // Hacer login automático
      login(newUser);

      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta está pendiente de aprobación por el administrador",
      });

      navigate('/panel');
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
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center relative overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse text-green-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              fontSize: `${12 + Math.random() * 8}px`
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
            
            <div className="text-center">
              <Shield className="h-16 w-16 text-green-400 mx-auto mb-4 animate-pulse" />
              <CardTitle className="text-3xl text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                Crear Cuenta
              </CardTitle>
              <p className="text-gray-400 mt-2">
                Únete a CriptoHerencia IA
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-400">Email *</Label>
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
                <Label htmlFor="password" className="text-green-400">Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-green-400 pr-10"
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-green-400">Confirmar Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-gray-800 border-gray-700 text-white focus:border-green-400 pr-10"
                    placeholder="Repite tu contraseña"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-green-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode" className="text-green-400">Código de Referido (Opcional)</Label>
                <Input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="bg-gray-800 border-gray-700 text-white focus:border-green-400"
                  placeholder="Código opcional"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold text-lg py-3 mt-6"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    Creando Cuenta...
                  </div>
                ) : (
                  'CREAR CUENTA'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-gray-400">¿Ya tienes una cuenta?</p>
              <Link
                to="/login"
                className="text-green-400 hover:text-green-300 underline font-medium"
              >
                Iniciar sesión aquí
              </Link>
            </div>

            {/* Information Panel */}
            <div className="mt-6 p-4 bg-gray-800 border border-blue-400 rounded-lg">
              <div className="text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-blue-400 font-bold mb-2">Proceso de Aprobación</h3>
                <p className="text-sm text-gray-300">
                  Después del registro, tu cuenta estará pendiente de aprobación por el administrador. 
                  Una vez aprobada, tendrás acceso completo al simulador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;