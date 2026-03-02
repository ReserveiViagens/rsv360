import React, { useState } from 'react';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import { AnimatedCard, AnimatedLoader, PageTransition } from '../components/ui';
import { useAnimations } from '../hooks/useAnimations';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Sparkles, 
  Star,
  Heart,
  Award,
  Trophy,
  Target,
  Rocket,
  Gem
} from 'lucide-react';

export default function AnimationsDemo() {
  const { 
    fadeInUp, 
    fadeInLeft, 
    fadeInRight, 
    scaleIn, 
    slideInDown, 
    slideInUp, 
    rotateIn, 
    bounceIn, 
    flipIn,
    hoverScale,
    hoverLift,
    hoverGlow,
    staggerContainer,
    staggerItem,
    isReducedMotion
  } = useAnimations();

  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState<string>('fadeInUp');
  const [selectedHover, setSelectedHover] = useState<string>('lift');

  const animations = [
    { id: 'fadeInUp', name: 'Fade In Up', icon: Star },
    { id: 'fadeInLeft', name: 'Fade In Left', icon: Heart },
    { id: 'fadeInRight', name: 'Fade In Right', icon: Award },
    { id: 'scaleIn', name: 'Scale In', icon: Target },
    { id: 'slideInDown', name: 'Slide In Down', icon: Rocket },
    { id: 'slideInUp', name: 'Slide In Up', icon: Gem },
    { id: 'rotateIn', name: 'Rotate In', icon: RotateCcw },
    { id: 'bounceIn', name: 'Bounce In', icon: Zap },
    { id: 'flipIn', name: 'Flip In', icon: Sparkles }
  ];

  const hoverEffects = [
    { id: 'scale', name: 'Scale', description: 'Aumenta o tamanho' },
    { id: 'lift', name: 'Lift', description: 'Eleva com sombra' },
    { id: 'glow', name: 'Glow', description: 'Adiciona brilho' },
    { id: 'none', name: 'Nenhum', description: 'Sem efeito' }
  ];

  const loaderTypes = [
    { id: 'spinner', name: 'Spinner' },
    { id: 'pulse', name: 'Pulse' },
    { id: 'bounce', name: 'Bounce' },
    { id: 'dots', name: 'Dots' },
    { id: 'bars', name: 'Bars' },
    { id: 'custom', name: 'Custom' }
  ];

  const demoCards = [
    { title: 'Reserva Confirmada', description: 'Sua viagem foi confirmada com sucesso!', icon: Star, color: 'green' },
    { title: 'Pagamento Recebido', description: 'R$ 1,500 recebido de Maria Santos', icon: Heart, color: 'blue' },
    { title: 'Novo Cliente', description: 'Pedro Oliveira foi adicionado', icon: Award, color: 'purple' },
    { title: 'Viagem Iniciada', description: 'Grupo partiu para Caldas Novas', icon: Rocket, color: 'orange' }
  ];

  return (
    <Layout>
      <PageTransition type="fade" className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🎭 Demonstração de Animações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Explore diferentes tipos de animações e micro-interações
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={isReducedMotion ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}>
              {isReducedMotion ? 'Movimento Reduzido' : 'Animações Ativas'}
            </Badge>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
            </Button>
          </div>
        </div>

        {/* Animation Controls */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Controles de Animação
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animation Type */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipo de Animação
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {animations.map((animation) => (
                  <button
                    key={animation.id}
                    onClick={() => setSelectedAnimation(animation.id)}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                      selectedAnimation === animation.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <animation.icon className="h-4 w-4 mx-auto mb-1" />
                    {animation.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hover Effect */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Efeito de Hover
              </h3>
              <div className="space-y-2">
                {hoverEffects.map((effect) => (
                  <button
                    key={effect.id}
                    onClick={() => setSelectedHover(effect.id)}
                    className={`w-full p-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      selectedHover === effect.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-left">
                      <div className="font-medium">{effect.name}</div>
                      <div className="text-xs opacity-75">{effect.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Animated Cards Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cards Animados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoCards.map((card, index) => (
              <AnimatedCard
                key={index}
                animation={selectedAnimation as any}
                delay={index * 100}
                hover={selectedHover as any}
                className="h-full"
              >
                <div className="p-4 text-center">
                  <div className={`p-3 rounded-full bg-${card.color}-100 dark:bg-${card.color}-900/20 mx-auto mb-3 w-fit`}>
                    <card.icon className={`h-6 w-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.description}
                  </p>
                </div>
              </AnimatedCard>
            ))}
          </div>
        </Card>

        {/* Stagger Animation Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Animação em Sequência (Stagger)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <motion.div
                key={item}
                variants={staggerItem}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center"
              >
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {item}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Item {item}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Loading Animations Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Animações de Loading
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loaderTypes.map((loader) => (
              <div key={loader.id} className="text-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {loader.name}
                </h3>
                <div className="flex justify-center">
                  <AnimatedLoader
                    type={loader.id as any}
                    size="lg"
                    color="blue"
                    text={loader.id === 'custom' ? 'Carregando...' : undefined}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Hover Effects Demo */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Efeitos de Hover
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={hoverScale.whileHover}
              whileTap={hoverScale.whileTap}
              className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center cursor-pointer"
            >
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                Scale Effect
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Passe o mouse para ver o efeito de escala
              </p>
            </motion.div>

            <motion.div
              whileHover={hoverLift.whileHover}
              whileTap={hoverLift.whileTap}
              className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-center cursor-pointer"
            >
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">
                Lift Effect
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Passe o mouse para ver o efeito de elevação
              </p>
            </motion.div>

            <motion.div
              whileHover={hoverGlow.whileHover}
              whileTap={hoverGlow.whileTap}
              className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center cursor-pointer"
            >
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">
                Glow Effect
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Passe o mouse para ver o efeito de brilho
              </p>
            </motion.div>
          </div>
        </Card>

        {/* Performance Info */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações de Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Configurações Atuais
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Movimento Reduzido:</span>
                  <Badge className={isReducedMotion ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}>
                    {isReducedMotion ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Animação Selecionada:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {animations.find(a => a.id === selectedAnimation)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Hover Selecionado:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {hoverEffects.find(h => h.id === selectedHover)?.name}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Dicas de Uso
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>• Use animações sutis para melhorar a experiência</p>
                <p>• Respeite as preferências de movimento reduzido</p>
                <p>• Teste em diferentes dispositivos e conexões</p>
                <p>• Mantenha a consistência visual</p>
              </div>
            </div>
          </div>
        </Card>
      </PageTransition>
    </Layout>
  );
}
