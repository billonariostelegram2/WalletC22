import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Star, Shield, Smartphone, Zap, DollarSign, Gift, Menu, X, HelpCircle } from 'lucide-react';
import { mockReviews } from '../components/mock';

const HomePage = () => {
  const navigate = useNavigate();
  const [animatedText, setAnimatedText] = useState('');
  const [showText, setShowText] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const title = 'CriptoHerencia IA';
    setAnimatedText(''); // Clear any existing text
    let index = 0;
    
    const typeWriter = () => {
      if (index < title.length) {
        setAnimatedText(title.substring(0, index + 1));
        index++;
        setTimeout(typeWriter, 100);
      }
    };
    
    // Start typing immediately and show content right away
    setShowText(true);
    typeWriter();
  }, []);

  const cryptoLogos = [
    { symbol: '₿', name: 'Bitcoin', color: 'text-orange-400' },
    { symbol: 'Ξ', name: 'Ethereum', color: 'text-blue-400' },
    { symbol: 'X', name: 'XRP', color: 'text-blue-300' },
    { symbol: 'Ł', name: 'Litecoin', color: 'text-gray-300' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800 font-sans relative overflow-hidden">
      {/* Subtle Matrix Numbers Only */}
      <div className="absolute inset-0 opacity-2 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={`matrix-${i}`}
            className="absolute text-green-500 text-xs font-mono animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          >
            {Math.random() > 0.5 ? '1' : '0'}
          </div>
        ))}
      </div>

      {/* Floating crypto logos */}
      <div className="absolute inset-0 pointer-events-none">
        {cryptoLogos.map((crypto, index) => (
          <div
            key={crypto.name}
            className={`absolute text-xl text-blue-400/15 animate-bounce`}
            style={{
              left: `${15 + (index * 18)}%`,
              top: `${25 + (index * 12)}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: '8s'
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
              className="text-slate-600 hover:text-blue-600 p-2 hover:bg-white/50 rounded-lg transition-all"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            
            {menuOpen && (
              <div className="absolute right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                <Button
                  onClick={() => {navigate('/login'); setMenuOpen(false);}}
                  variant="ghost"
                  className="w-full text-left px-6 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 border-b border-slate-100 rounded-none"
                >
                  INICIAR SESIÓN
                </Button>
                <Button
                  onClick={() => {navigate('/registro'); setMenuOpen(false);}}
                  variant="ghost"
                  className="w-full text-left px-6 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-none"
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 mb-6 leading-tight">
              {animatedText}
              <span className="animate-blink">|</span>
            </h1>
            
            {showText && (
              <div className="space-y-6">
                <p className="text-lg md:text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                  Software de fuerza bruta con IA que prueba miles de contraseñas diferentes por segundo, 
                  para acceder a billeteras abandonadas y sin dueño con saldo dentro.
                </p>
                
                <div className="bg-slate-800/90 backdrop-blur border border-blue-500/30 rounded-xl p-6 max-w-3xl mx-auto">
                  <p className="text-slate-200 text-base leading-relaxed">
                    Una vez lo consigue, te envía automáticamente las criptos encontradas a tu billetera... 
                    <span className="text-emerald-400 font-semibold"> siempre funciona</span>, pero si no estás satisfecho con tu compra 
                    <span className="text-blue-400"> te devolvemos el dinero</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CTA Buttons Section */}
        {showText && (
          <section className="py-12 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl md:text-3xl font-bold text-blue-600 mb-4">
                  ¿Listo para ganar dinero?
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Únete a cientos de usuarios que ya están generando ingresos con nuestra tecnología avanzada
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                  <Button 
                    onClick={() => navigate('/registro')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    CREAR CUENTA GRATIS
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-base px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
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
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                ¿Cómo funciona todo?
              </h2>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                Si quieres generar ingresos y aún no tienes el programa, te explicamos de forma sencilla cómo funciona
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-white/80 backdrop-blur border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
                <CardContent className="p-6">
                  <DollarSign className="h-10 w-10 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Billeteras Digitales</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Una billetera de criptomonedas es una cuenta digital donde almacenas, envías y recibes monedas digitales como Bitcoin.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
                <CardContent className="p-6">
                  <Shield className="h-10 w-10 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Sin KYC = Sin Dueño</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Millones de billeteras sin "KYC" son anónimas y no requieren datos personales. Según la ley son billeteras sin dueño.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl group">
                <CardContent className="p-6">
                  <Zap className="h-10 w-10 text-amber-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-slate-800 mb-3">Frases Semilla</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Las frases iniciales son contraseñas que permiten acceso a billeteras. Nuestra IA las descifra automáticamente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-white/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800">
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
                <Card key={index} className="bg-white/80 backdrop-blur border-slate-200 hover:border-blue-300 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <faq.icon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{faq.question}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800">
              Testimonios de Usuarios
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockReviews.map((review, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4 text-sm italic leading-relaxed">"{review.text}"</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="border-blue-600 text-blue-600 text-xs">
                        {review.name}
                      </Badge>
                      <span className="text-xs text-slate-500">{review.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Footer with Telegram support */}
        <footer className="py-8 px-4 border-t border-slate-200 bg-white/50">
          <div className="max-w-4xl mx-auto text-center">
            <a 
              href="https://t.me/criptoherencia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300"
            >
              Soporte por Telegram @criptoherencia
            </a>
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
        
        @keyframes matrixRain {
          0% { 
            transform: translateY(-100vh); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(100vh); 
            opacity: 0; 
          }
        }
        
        @keyframes moneyFall {
          0% { 
            transform: translateY(-50px) rotate(0deg); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
          }
          90% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(calc(100vh + 50px)) rotate(360deg); 
            opacity: 0; 
          }
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