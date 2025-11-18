import React, { useState } from 'react';
import { GameType } from '../types';
import { Puzzle, Move, Type } from 'lucide-react';
import MemoryMatch from './games/MemoryMatch';
import SentenceScramble from './games/SentenceScramble';
import GrammarGapFill from './games/GrammarGapFill';

interface MiniGamesProps {
  onAddXp: (amount: number) => void;
}

const MiniGames: React.FC<MiniGamesProps> = ({ onAddXp }) => {
  const [activeGame, setActiveGame] = useState<GameType>(GameType.NONE);

  const renderGame = () => {
    switch (activeGame) {
      case GameType.MEMORY:
        return <MemoryMatch onComplete={(xp) => { onAddXp(xp); setActiveGame(GameType.NONE); }} onExit={() => setActiveGame(GameType.NONE)} />;
      case GameType.SCRAMBLE:
        return <SentenceScramble onComplete={(xp) => { onAddXp(xp); setActiveGame(GameType.NONE); }} onExit={() => setActiveGame(GameType.NONE)} />;
      case GameType.GAPFILL:
        return <GrammarGapFill onComplete={(xp) => { onAddXp(xp); setActiveGame(GameType.NONE); }} onExit={() => setActiveGame(GameType.NONE)} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10 px-4">
            <GameCard 
              title="Parejas de Vocabulario" 
              description="Une los verbos con sus sustantivos. Ej: 'Walk' + 'the dog'."
              icon={<Puzzle className="w-12 h-12 text-white" />}
              color="bg-pink-500"
              onClick={() => setActiveGame(GameType.MEMORY)}
            />
            <GameCard 
              title="Constructor de Frases" 
              description="Ordena las palabras para formar frases correctas."
              icon={<Move className="w-12 h-12 text-white" />}
              color="bg-orange-500"
              onClick={() => setActiveGame(GameType.SCRAMBLE)}
            />
            <GameCard 
              title="Maestro de Gramática" 
              description="Rellena los huecos con verbos en Present Simple."
              icon={<Type className="w-12 h-12 text-white" />}
              color="bg-emerald-500"
              onClick={() => setActiveGame(GameType.GAPFILL)}
            />
          </div>
        );
    }
  };

  return (
    <div className="pb-20">
      {activeGame === GameType.NONE && (
        <div className="text-center py-10">
          <h2 className="text-4xl font-bold text-slate-800 mb-4 game-font">Sala de Juegos: Use of English</h2>
          <p className="text-slate-600 text-xl">¡Elige un reto para ganar XP e insignias!</p>
        </div>
      )}
      {renderGame()}
    </div>
  );
};

const GameCard: React.FC<{ title: string, description: string, icon: React.ReactNode, color: string, onClick: () => void }> = ({ title, description, icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 text-left group relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transform group-hover:scale-150 transition-transform duration-500"></div>
    <div className="relative z-10">
      <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-white mb-2 game-font">{title}</h3>
      <p className="text-white/90 font-medium">{description}</p>
      <div className="mt-6 inline-flex items-center text-white font-bold bg-black/20 px-4 py-2 rounded-full text-sm">
        Jugar Ahora →
      </div>
    </div>
  </button>
);

export default MiniGames;