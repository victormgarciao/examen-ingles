import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Loader2, Heart, Clock, Info, AlertTriangle } from 'lucide-react';
import { generateGameContent } from '../../services/geminiService';

interface SentenceData {
  text: string;
  explanation: string;
}

// Fallback if API fails
const FALLBACK_SENTENCES: SentenceData[] = [
  { text: "I usually get up at seven o'clock.", explanation: "Sujeto (I) + Adverbio (usually) + Verbo (get up)." },
  { text: "He doesn't play football on Mondays.", explanation: "En negativo 3ª persona usamos 'doesn't' antes del verbo." },
  { text: "Do you watch TV in the evening?", explanation: "Para preguntas con 'you' empezamos con el auxiliar 'Do'." },
  { text: "She always walks the dog after school.", explanation: "Recuerda la 's' en 'walks' para la 3ª persona (She)." },
  { text: "We usually make a snack at four pm.", explanation: "El adverbio 'usually' va antes del verbo principal." },
];

interface SentenceScrambleProps {
  onComplete: (xp: number) => void;
  onExit: () => void;
}

const SentenceScramble: React.FC<SentenceScrambleProps> = ({ onComplete, onExit }) => {
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(0);
  const [scrambledWords, setScrambledWords] = useState<{id: number, text: string}[]>([]);
  const [selectedWords, setSelectedWords] = useState<{id: number, text: string}[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // New mechanics state
  const [attempts, setAttempts] = useState(0);
  const [isFailed, setIsFailed] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    const aiSentences = await generateGameContent('SCRAMBLE');
    if (aiSentences && aiSentences.length > 0) {
      setSentences(aiSentences);
    } else {
      setSentences(FALLBACK_SENTENCES);
    }
    setLoading(false);
  };

  // Timer countdown logic
  useEffect(() => {
    let interval: number;
    if (isFailed && timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (isFailed && timer === 0) {
      // Time up, move next
      loadSentence(currentSentenceIdx + 1);
    }
    return () => clearInterval(interval);
  }, [isFailed, timer, currentSentenceIdx]);

  // Watch for when sentences are loaded to set up the first round
  useEffect(() => {
    if (sentences.length > 0 && !loading) {
      loadSentence(0);
    }
  }, [sentences, loading]);

  const loadSentence = (index: number) => {
    if (index >= sentences.length) {
      onComplete(150); // Bonus for finishing all
      return;
    }
    const words = sentences[index].text.split(" ");
    const items = words.map((w, i) => ({ id: i, text: w }));
    
    // Reset state
    setScrambledWords([...items].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setIsCorrect(null);
    setCurrentSentenceIdx(index);
    setAttempts(0);
    setIsFailed(false);
    setTimer(0);
  };

  const handleWordSelect = (word: {id: number, text: string}) => {
    if (isFailed) return; // Lock interaction
    setScrambledWords(prev => prev.filter(w => w.id !== word.id));
    setSelectedWords(prev => [...prev, word]);
    setIsCorrect(null);
  };

  const handleWordRemove = (word: {id: number, text: string}) => {
    if (isFailed) return; // Lock interaction
    setSelectedWords(prev => prev.filter(w => w.id !== word.id));
    setScrambledWords(prev => [...prev, word]);
    setIsCorrect(null);
  };

  const autoSolve = () => {
    setIsFailed(true);
    setTimer(20); // 20 seconds timer
    
    // Move all words to selected in correct order
    const words = sentences[currentSentenceIdx].text.split(" ");
    const solvedItems = words.map((w, i) => ({ id: i, text: w }));
    setSelectedWords(solvedItems);
    setScrambledWords([]);
  };

  const checkAnswer = () => {
    const currentTarget = sentences[currentSentenceIdx].text.replace(/\s+/g, '');
    const attempt = selectedWords.map(w => w.text).join("").replace(/\s+/g, '');
    
    // Case insensitive check
    if (currentTarget.toLowerCase() === attempt.toLowerCase()) {
      setIsCorrect(true);
      setTimeout(() => {
        loadSentence(currentSentenceIdx + 1);
      }, 1500);
    } else {
      setIsCorrect(false);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 3) {
        autoSolve();
      } else {
        // Simple shake or visual feedback wait
        setTimeout(() => {
          setIsCorrect(null);
        }, 1000);
      }
    }
  };

  const skipTimer = () => {
    loadSentence(currentSentenceIdx + 1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-brand-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">La IA está creando tus frases...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-slate-500 font-bold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Salir
        </button>
        <div className="flex items-center gap-6">
          <div className="flex gap-1">
             {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  className={`w-6 h-6 ${i < (3 - attempts) ? 'text-red-500 fill-red-500' : 'text-slate-300'}`} 
                />
             ))}
          </div>
          <div className="text-xl font-bold text-slate-700">
              Frase {currentSentenceIdx + 1} / {sentences.length}
          </div>
        </div>
      </div>

      {/* Auto-fail Feedback Panel */}
      {isFailed && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl mb-6 animate-fade-in">
           <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
              <div className="w-full">
                 <h4 className="font-bold text-orange-800">¡Se acabaron los intentos!</h4>
                 <p className="text-orange-700 mt-1">Así es como se escribe correctamente:</p>
                 <div className="bg-white/50 p-2 rounded mt-2 text-sm font-medium text-orange-900">
                    <Info className="w-4 h-4 inline mr-1" />
                    {sentences[currentSentenceIdx].explanation}
                 </div>
                 
                 <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-700 font-bold">
                       <Clock className="w-5 h-5 animate-pulse" />
                       Siguiente en: {timer}s
                    </div>
                    <button onClick={skipTimer} className="text-sm underline text-orange-600 hover:text-orange-800">
                       Saltar espera
                    </button>
                 </div>
                 {/* Progress bar for timer */}
                 <div className="w-full bg-orange-200 h-1 mt-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-orange-500 h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(timer / 20) * 100}%` }}
                    ></div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Target Area */}
      <div className={`min-h-[120px] bg-white rounded-2xl shadow-inner p-6 flex flex-wrap gap-3 mb-8 transition-colors duration-300 border-2 ${isCorrect === true ? 'border-green-500 bg-green-50' : (isCorrect === false && !isFailed) ? 'border-red-500 bg-red-50' : 'border-slate-200'} ${isFailed ? 'opacity-80' : ''}`}>
        {selectedWords.length === 0 && !isFailed && (
            <span className="text-slate-400 italic select-none">Toca las palabras de abajo para construir la frase...</span>
        )}
        {selectedWords.map((word, index) => (
          <button
            key={`${word.id}-${index}`}
            onClick={() => handleWordRemove(word)}
            disabled={isFailed}
            className={`bg-white border-b-4 border-orange-600 bg-orange-500 text-white px-4 py-2 rounded-lg font-bold shadow-sm ${!isFailed && 'hover:-translate-y-0.5 active:translate-y-0'} transition-all disabled:opacity-100 disabled:cursor-default`}
          >
            {word.text}
          </button>
        ))}
      </div>

      {/* Source Area */}
      {!isFailed && (
        <div className="flex flex-wrap justify-center gap-3 mb-10 min-h-[60px]">
          {scrambledWords.map(word => (
            <button
              key={word.id}
              onClick={() => handleWordSelect(word)}
              className="bg-white border border-slate-300 border-b-4 text-slate-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-slate-50 hover:-translate-y-1 transition-all"
            >
              {word.text}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      {!isFailed && (
        <div className="text-center">
            <button 
              onClick={checkAnswer}
              disabled={scrambledWords.length > 0}
              className="bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-brand-700 transition-colors"
            >
              Comprobar Frase
            </button>
        </div>
      )}
      
      {isCorrect === true && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
              <div className="bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl text-2xl font-bold animate-bounce-slow flex items-center gap-3">
                  <Check className="w-8 h-8" /> ¡Correcto!
              </div>
          </div>
      )}
    </div>
  );
};

export default SentenceScramble;