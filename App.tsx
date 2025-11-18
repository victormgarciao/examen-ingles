import React, { useState, useEffect } from 'react';
import { ViewState, UserStats } from './types';
import ReadingQuest from './components/ReadingQuest';
import MiniGames from './components/MiniGames';
import { Trophy, Gamepad2, BookOpen, Star, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    streak: 3,
    badges: [],
  });
  
  // Check for API key only once
  const [apiKeyExists, setApiKeyExists] = useState(true);

  useEffect(() => {
     if (!process.env.API_KEY) {
         setApiKeyExists(false);
     }
  }, []);

  const addXp = (amount: number) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 500) + 1;
      const newBadges = [...prev.badges];
      
      if (newLevel > prev.level) {
        // Level up sound or visual could go here
        alert(`¡SUBIDA DE NIVEL! ¡Ahora eres nivel ${newLevel}!`);
      }
      
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        badges: newBadges
      };
    });
  };

  if (!apiKeyExists) {
      return (
          <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
                  <div className="text-red-500 font-bold text-xl mb-4">Falta Configuración API</div>
                  <p className="text-slate-600">Por favor añade la variable de entorno <code>API_KEY</code> para ejecutar la Misión de Examen.</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top HUD */}
      <header className="bg-slate-900 text-white p-3 sticky top-0 z-50 shadow-lg border-b border-slate-700">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3" onClick={() => setView(ViewState.HOME)} role="button">
            <div className="bg-brand-500 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none game-font text-brand-300">English Explorer</h1>
              <span className="text-xs text-slate-400">Misión de Examen</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-yellow-400">{stats.level}</span>
              <span className="text-xs text-slate-400 uppercase font-bold ml-1">Nvl</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span className="font-bold text-white">{stats.xp}</span>
              <span className="text-xs text-slate-400 uppercase font-bold ml-1">XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative">
        {view === ViewState.HOME && (
          <div className="max-w-4xl mx-auto p-6 mt-8 animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4 game-font">¡Bienvenido, Explorador!</h2>
              <p className="text-slate-600 text-lg">¿Listo para dominar tu examen de Reading y Use of English?</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <button 
                onClick={() => setView(ViewState.READING)}
                className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
              >
                 <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-20 rounded-full group-hover:scale-110 transition-transform"></div>
                 <BookOpen className="w-12 h-12 text-white mb-6" />
                 <h3 className="text-2xl font-bold text-white mb-2 game-font">Misión de Lectura</h3>
                 <p className="text-indigo-100">Historias generadas por IA con traducciones mágicas y preguntas.</p>
              </button>

              <button 
                onClick={() => setView(ViewState.GAMES)}
                className="group relative bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden"
              >
                 <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-20 rounded-full group-hover:scale-110 transition-transform"></div>
                 <Gamepad2 className="w-12 h-12 text-white mb-6" />
                 <h3 className="text-2xl font-bold text-white mb-2 game-font">Juegos Arcade</h3>
                 <p className="text-pink-100">Minijuegos divertidos para dominar Vocabulario, Gramática y Frases.</p>
              </button>
            </div>
            
            <div className="mt-12 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
               <h4 className="font-bold text-slate-700 mb-4">Tu Progreso</h4>
               <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${(stats.xp % 500) / 5}%` }}
                  ></div>
               </div>
               <div className="flex justify-between text-xs text-slate-500 mt-2 font-bold">
                  <span>Nivel {stats.level}</span>
                  <span>Siguiente Nivel: faltan {500 - (stats.xp % 500)} XP</span>
               </div>
            </div>
          </div>
        )}

        {view === ViewState.READING && (
          <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto p-4">
                <button onClick={() => setView(ViewState.HOME)} className="text-slate-500 font-bold flex items-center gap-2 hover:text-brand-600 mb-4">
                    <ArrowLeftIcon className="w-4 h-4" /> Volver al Mapa
                </button>
            </div>
            <ReadingQuest onAddXp={addXp} />
          </div>
        )}

        {view === ViewState.GAMES && (
          <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto p-4">
                <button onClick={() => setView(ViewState.HOME)} className="text-slate-500 font-bold flex items-center gap-2 hover:text-brand-600 mb-4">
                    <ArrowLeftIcon className="w-4 h-4" /> Volver al Mapa
                </button>
            </div>
            <MiniGames onAddXp={addXp} />
          </div>
        )}
      </main>
      
      {/* Simple mobile nav if needed, but HUD handles it */}
    </div>
  );
};

// Helper Icon
const ArrowLeftIcon = ({ className }: { className: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);

export default App;