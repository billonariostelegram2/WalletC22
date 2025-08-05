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
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
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
            className={`absolute text-4xl ${crypto.color} opacity-30 animate-bounce`}
            style={{
              left: `${20 + (index * 20)}%`,
              top: `${30 + (index * 15)}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: '3s'
            }}
          >
            {crypto.symbol}
          </div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="text-center py-20">
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-green-400 mb-4">
              {animatedText}
              <span className="animate-blink">|</span>
            </h1>
            
            {showText && (
              <div className="animate-fade-in">
                <p className="text-xl md:text-2xl text-blue-300 mb-6 max-w-4xl mx-auto px-4">
                  Software de fuerza bruta con IA que prueba miles de contraseñas diferentes por segundo, 
                  para acceder a billeteras abandonadas y sin dueño con saldo dentro.
                </p>
                
                <div className="bg-gray-900 border border-green-400 rounded-lg p-4 max-w-3xl mx-auto mb-8">
                  <p className="text-green-300 text-lg">
                    Una vez lo consigue, te envía automáticamente las criptos encontradas a tu billetera... 
                    <span className="text-yellow-400 font-bold"> siempre funciona</span>, pero si no estás satisfecho con tu compra 
                    <span className="text-blue-400"> te devolvemos el dinero dentro de 10 días</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
              ¿Cómo funciona todo?
            </h2>
            <p className="text-xl text-center mb-12 text-blue-300">
              Si quieres ganar dinero y aún no tienes el programa, te explico de forma más sencilla cómo funciona todo...
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-gray-900 border-green-400 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                <CardContent className="p-6">
                  <DollarSign className="h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-xl font-bold text-green-400 mb-3">Billeteras Digitales</h3>
                  <p className="text-gray-300">
                    Una billetera de criptomonedas es una cuenta digital donde almacenas, envías y recibes monedas digitales como Bitcoin.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-green-400 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                <CardContent className="p-6">
                  <Shield className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="text-xl font-bold text-green-400 mb-3">Sin KYC = Sin Dueño</h3>
                  <p className="text-gray-300">
                    Hay millones de billeteras sin "KYC" que son anónimas y no requieren datos personales. Según la ley son billeteras sin dueño.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-green-400 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                <CardContent className="p-6">
                  <Zap className="h-12 w-12 text-yellow-400 mb-4" />
                  <h3 className="text-xl font-bold text-green-400 mb-3">Frases Semilla</h3>
                  <p className="text-gray-300">
                    Las frases iniciales son un tipo de contraseña que sirve para acceder a las billeteras. Nuestro AI las descifra automáticamente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  question: "¿Es legal?",
                  answer: "SÍ... Porque las billeteras sin KYC almacenan criptomonedas de forma anónima, por tanto no tienen dueño y siguen un protocolo descentralizado.",
                  icon: Shield
                },
                {
                  question: "¿Se puede usar en móvil?",
                  answer: "SÍ... El programa se utiliza desde esta web (puedes crear una cuenta gratis) y es compatible con Android, iOS, Windows, Linux y Mac.",
                  icon: Smartphone
                },
                {
                  question: "¿Consume luz?",
                  answer: "NO... Es lo mismo que usar Google, ya que NO ES UN MINADOR, es un software que descifra contraseñas de billeteras sin uso y te envía las criptomonedas.",
                  icon: Zap
                },
                {
                  question: "¿Cuánto se gana al día?",
                  answer: "Depende, basado en estadísticas al usar el programa durante 3 horas puedes ganar entre 1200€ - 2400€.",
                  icon: DollarSign
                },
                {
                  question: "¿Qué recibo al comprar?",
                  answer: "Se te dará acceso al programa, con VPN y VPS integrado... Se te dará una guía de uso y soporte de chat por Telegram.",
                  icon: Gift
                }
              ].map((faq, index) => (
                <Card key={index} className="bg-gray-900 border-green-400 hover:border-blue-400 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <faq.icon className="h-8 w-8 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">{faq.question}</h3>
                        <p className="text-gray-300">{faq.answer}</p>
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
            <h2 className="text-4xl font-bold text-center mb-12 text-green-400">
              Testimonios Reales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockReviews.map((review, index) => (
                <Card key={index} className="bg-gray-900 border-green-400 hover:border-blue-400 transition-all duration-300 hover:shadow-lg hover:shadow-green-400/20">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{review.text}"</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="border-green-400 text-green-400">
                        {review.name}
                      </Badge>
                      <span className="text-sm text-blue-400">{review.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-green-400 rounded-lg p-8 mb-8">
              <h2 className="text-4xl font-bold text-green-400 mb-4">
                ¿Listo para empezar a ganar?
              </h2>
              <p className="text-xl text-blue-300 mb-8">
                Únete a miles de usuarios que ya están ganando dinero con CriptoHerencia IA
              </p>
              
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                <Button 
                  onClick={() => navigate('/registro')}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-black font-bold text-lg px-8 py-4 w-full sm:w-auto"
                >
                  CREAR CUENTA GRATIS
                </Button>
                
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-bold text-lg px-8 py-4 w-full sm:w-auto"
                >
                  INICIAR SESIÓN
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-gray-400">
              * Simulador educativo con fines de demostración. No proporciona acceso real a billeteras de criptomonedas.
            </p>
          </div>
        </section>
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
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;