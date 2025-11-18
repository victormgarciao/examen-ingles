import React, { useState, useEffect } from 'react';
import { Card } from '../../types';
import { ArrowLeft, RotateCcw } from 'lucide-react';

// Combined Vocabulary from Textbook Images
const FULL_VOCABULARY_POOL = [
  // Routines
  { verb: 'Get', comp: 'up' },
  { verb: 'Get', comp: 'dressed' },
  { verb: 'Have', comp: 'breakfast' },
  { verb: 'Walk', comp: 'the dog' },
  { verb: 'Go', comp: 'to school' },
  { verb: 'Have', comp: 'lunch' },
  { verb: 'Make', comp: 'a snack' },
  { verb: 'Do', comp: 'homework' },
  { verb: 'Have', comp: 'a shower' },
  { verb: 'Go', comp: 'to bed' },
  { verb: 'Brush', comp: 'my teeth' },
  // Hobbies / Free Time
  { verb: 'Play', comp: 'football' },
  { verb: 'Play', comp: 'computer games' },
  { verb: 'Listen', comp: 'to music' },
  { verb: 'Watch', comp: 'TV' },
  { verb: 'Chat', comp: 'online' },
  { verb: 'Ride', comp: 'a bike' },
  { verb: 'Go', comp: 'to the cinema' },
  { verb: 'Read', comp: 'a book' },
  { verb: 'Meet', comp: 'friends' }
];

interface MemoryMatchProps {
  onComplete: (xp: number) => void;
  onExit: () => void;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ onComplete, onExit }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [targetPairs, setTargetPairs] = useState(8); // Number of pairs to play with

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // 1. Shuffle full pool
    const shuffledPool = [...FULL_VOCABULARY_POOL].sort(() => Math.random() - 0.5);
    
    // 2. Select top 8 pairs
    const selectedPairs = shuffledPool.slice(0, targetPairs);

    // 3. Create cards
    const deck: Card[] = [];
    selectedPairs.forEach((pair, index) => {
      deck.push({ id: index * 2, content: pair.verb, type: 'verb', matchId: index, isFlipped: false, isMatched: false });
      deck.push({ id: index * 2 + 1, content: pair.comp, type: 'complement', matchId: index, isFlipped: false, isMatched: false });
    });

    // 4. Shuffle deck
    deck.sort(() => Math.random() - 0.5);
    
    setCards(deck);
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
  };

  const handleCardClick = (clickedCard: Card) => {
    if (clickedCard.isFlipped || clickedCard.isMatched || flippedCards.length >= 2) return;

    const newCards = cards.map(card => 
      card.id === clickedCard.id ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);
    
    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlipped, newCards);
    }
  };

  const checkForMatch = (flipped: Card[], currentCards: Card[]) => {
    const [first, second] = flipped;
    if (first.matchId === second.matchId) {
      // Match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.id === first.id || card.id === second.id 
            ? { ...card, isMatched: true, isFlipped: true } 
            : card
        ));
        setFlippedCards([]);
        setMatches(m => {
          const newM = m + 1;
          if (newM === targetPairs) {
            setTimeout(() => onComplete(100), 1000);
          }
          return newM;
        });
      }, 500);
    } else {
      // No match
      setTimeout(() => {
        setCards(prev => prev.map(card => 
          card.id === first.id || card.id === second.id 
            ? { ...card, isFlipped: false } 
            : card
        ));
        setFlippedCards([]);
      }, 1000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 font-bold">
          <ArrowLeft className="w-5 h-5" /> Salir
        </button>
        <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-lg shadow text-brand-600 font-bold">Parejas: {matches}/{targetPairs}</div>
            <button onClick={initializeGame} className="bg-slate-200 p-2 rounded-full hover:bg-slate-300" title="Reiniciar con nuevas palabras">
                <RotateCcw className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {cards.map(card => (
          <div 
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`aspect-[4/3] cursor-pointer rounded-xl shadow-md transition-all duration-500 transform perspective-1000 ${
              card.isFlipped || card.isMatched ? 'rotate-y-180' : 'hover:-translate-y-1'
            }`}
          >
            <div className={`w-full h-full relative transition-all duration-500 transform-style-3d ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}`}>
               {/* Front (Hidden) */}
               {(!card.isFlipped && !card.isMatched) && (
                 <div className="absolute inset-0 bg-brand-500 rounded-xl flex items-center justify-center border-b-4 border-brand-700">
                    <span className="text-4xl text-white opacity-50">?</span>
                 </div>
               )}
               {/* Back (Visible) */}
               {(card.isFlipped || card.isMatched) && (
                 <div className={`absolute inset-0 ${card.isMatched ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-brand-200 text-slate-800'} border-2 rounded-xl flex items-center justify-center p-2 text-center font-bold text-lg select-none`}>
                   {card.content}
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-center mt-4 text-slate-400 text-sm">Reinicia para jugar con vocabulario diferente (Rutinas o Hobbies).</p>
    </div>
  );
};

export default MemoryMatch;