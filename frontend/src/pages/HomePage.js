import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, Shield, Smartphone, Zap, DollarSign, Gift, Menu, X } from 'lucide-react';
import { mockReviews } from '../components/mock';

const HomePage = () => {
  const navigate = useNavigate();
  const [animatedText, setAnimatedText] = useState('');
  const [showText, setShowText] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const title = 'CriptoHerencia IA';
    let index = 0;
    
    const typeWriter = () => {
      if (index < title.length) {
        setAnimatedText(prev => prev + title.charAt(index));
        index++;
        setTimeout(typeWriter, 100);
      } else {
        setShowText(true);
      }
    };
    
    const timer = setTimeout(() => {
      typeWriter();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const cryptoLogos = [
    { symbol: '₿', name: 'Bitcoin', color: 'text-orange-400' },
    { symbol: 'Ξ', name: 'Ethereum', color: 'text-blue-400' },
    { symbol: 'X', name: 'XRP', color: 'text-blue-300' },
    { symbol: 'Ł', name: 'Litecoin', color: 'text-gray-300' }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse text-green-400 text-xs"
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
      </div>

      {/* Floating crypto logos */}
      <div className="absolute inset-0 pointer-events-none">
        {cryptoLogos.map((crypto, index) => (
          <div
            key={crypto.name}
            className={`absolute text-2xl ${crypto.color} opacity-20 animate-bounce`}
            style={{
              left: `${15 + (index * 18)}%`,
              top: `${25 + (index * 12)}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: '4s'
            }}
          >
            {crypto.symbol}
          </div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Header with hamburger menu */}
        <header className="flex justify-between items-center p-6 relative z-20">
          <div className="w-8"></div> {/* Spacer */}
          
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-green-400 hover:text-green-300 p-2"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            {menuOpen && (
              <div className="absolute right-0 top-12 bg-gray-900 border border-green-400 rounded-lg shadow-2xl shadow-green-400/20 overflow-hidden">
                <Button
                  onClick={() => {navigate('/login'); setMenuOpen(false);}}
                  variant="ghost"
                  className="w-full text-left px-6 py-3 text-green-400 hover:bg-green-400 hover:text-black border-b border-gray-800"
                >
                  INICIAR SESIÓN
                </Button>
                <Button
                  onClick={() => {navigate('/registro'); setMenuOpen(false);}}
                  variant="ghost"
                  className="w-full text-left px-6 py-3 text-blue-400 hover:bg-blue-400 hover:text-black"
                >
                  CREAR CUENTA
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="text-center py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-green-400 mb-6 leading-tight">
              {animatedText}
              <span className="animate-blink">|</span>
            </h1>
            
            {showText && (
              <div className="animate-fade-in space-y-6">
                <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                  Software de fuerza bruta con IA que prueba miles de contraseñas diferentes por segundo, 
                  para acceder a billeteras abandonadas y sin dueño con saldo dentro.
                </p>
                
                <div className="bg-gray-900/80 backdrop-blur border border-green-400/30 rounded-xl p-6 max-w-3xl mx-auto">
                  <p className="text-green-300 text-base leading-relaxed">
                    Una vez lo consigue, te envía automáticamente las criptos encontradas a tu billetera... 
                    <span className="text-yellow-400 font-semibold"> siempre funciona</span>, pero si no estás satisfecho con tu compra 
                    <span className="text-blue-400"> te devolvemos el dinero dentro de 10 días</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Buttons Section */}
        {showText && (
          <section className="py-12 px-4 animate-fade-in">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur border border-green-400/50 rounded-2xl p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 mb-4">
                  ¿Listo para empezar a ganar?
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  Únete a miles de usuarios que ya están generando ingresos con nuestra tecnología avanzada
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                  <Button 
                    onClick={() => navigate('/registro')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-black font-bold text-base px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25"
                  >
                    CREAR CUENTA GRATIS
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black font-bold text-base px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    INICIAR SESIÓN
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* How it works Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-green-400 mb-4">
                ¿Cómo funciona todo?
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Si quieres generar ingresos y aún no tienes el programa, te explicamos de forma sencilla cómo funciona
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-gray-900/80 backdrop-blur border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20 group">
                <CardContent className="p-6">
                  <DollarSign className="h-10 w-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-green-400 mb-3">Billeteras Digitales</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Una billetera de criptomonedas es una cuenta digital donde almacenas, envías y recibes monedas digitales como Bitcoin.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur border-blue-400/30 hover:border-blue-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/20 group">
                <CardContent className="p-6">
                  <Shield className="h-10 w-10 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-green-400 mb-3">Sin KYC = Sin Dueño</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Millones de billeteras sin "KYC" son anónimas y no requieren datos personales. Según la ley son billeteras sin dueño.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur border-yellow-400/30 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/20 group">
                <CardContent className="p-6">
                  <Zap className="h-10 w-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-green-400 mb-3">Frases Semilla</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Las frases iniciales son contraseñas que permiten acceso a billeteras. Nuestra IA las descifra automáticamente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-400">
              Preguntas Frecuentes
            </h2>
            <div className="space-y-6">
              {[
                {
                  question: "¿Es legal?",
                  answer: "SÍ. Las billeteras sin KYC almacenan criptomonedas de forma anónima, por tanto no tienen dueño y siguen un protocolo descentralizado.",
                  icon: Shield
                },
                {
                  question: "¿Se puede usar en móvil?",
                  answer: "SÍ. El programa funciona desde esta web (cuenta gratis) y es compatible con Android, iOS, Windows, Linux y Mac.",
                  icon: Smartphone
                },
                {
                  question: "¿Consume luz?",
                  answer: "NO. Como usar Google. NO ES MINADO, es software que descifra contraseñas de billeteras sin uso y envía las criptomonedas.",
                  icon: Zap
                },
                {
                  question: "¿Cuánto se gana al día?",
                  answer: "Según estadísticas, usando el programa 3 horas diarias puedes generar entre 1200€ - 2400€.",
                  icon: DollarSign
                },
                {
                  question: "¿Qué incluye la compra?",
                  answer: "Acceso completo al programa con VPN y VPS integrado, guía de uso detallada y soporte por Telegram.",
                  icon: Gift
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-gray-900/80 backdrop-blur border-green-400/30 hover:border-green-400/60 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <faq.icon className="h-6 w-6 text-green-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="text-lg font-bold text-green-400 mb-2">{faq.question}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-green-400">
              Testimonios de Usuarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockReviews.map((review, index) => (
                <Card key={index} className="bg-gray-900/80 backdrop-blur border-green-400/30 hover:border-green-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 text-sm italic leading-relaxed">"{review.text}"</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                        {review.name}
                      </Badge>
                      <span className="text-xs text-blue-400">{review.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer disclaimer */}
        <footer className="py-8 px-4 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xs text-gray-500">
              * Simulador educativo con fines de demostración. No proporciona acceso real a billeteras de criptomonedas.
            </p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-blink {
          animation: blink 1s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;