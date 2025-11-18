import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Star, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { generateGameContent } from '../../services/geminiService';

// Fallback
const FALLBACK_QUESTIONS = [
  { 
    text: "She ______ (play) tennis on Fridays.", 
    answer: "plays", 
    options: ["play", "plays", "playing"],
    explanation: "Al ser 3ª persona del singular (She), añadimos '-s' al verbo en afirmativo."
  },
  { 
    text: "I ______ (not / go) to school by bus.", 
    answer: "don't go", 
    options: ["doesn't go", "not go", "don't go"],
    explanation: "Con 'I', 'you', 'we', 'they' usamos el auxiliar 'don't' para negar."
  },
  { 
    text: "______ (do) you like chocolate?", 
    answer: "Do", 
    options: ["Does", "Do", "Is"],
    explanation: "Para preguntas con 'you', usamos el auxiliar 'Do' al principio."
  }
];

interface GrammarGapFillProps {
  onComplete: (xp: number) => void;
  onExit: () => void;
}

const GrammarGapFill: React.FC<GrammarGapFillProps> = ({ onComplete, onExit }) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    const aiQuestions = await generateGameContent('GAPFILL');
    if (aiQuestions && aiQuestions.length > 0) {
      setQuestions(aiQuestions);
    } else {
      setQuestions(FALLBACK_QUESTIONS);
    }
    setLoading(false);
  };

  const handleOptionClick = (option: string) => {
    if (status !== 'playing') return;
    setSelectedOption(option);

    const isCorrect = option === questions[currentIdx].answer;

    if (isCorrect) {
      setStatus('correct');
      scoreRef.current += 1;
      // Auto advance after delay
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    } else {
      setStatus('wrong');
      // Wait for user to read explanation and click continue
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
      setStatus('playing');
      setSelectedOption(null);
    } else {
      // Game Completed
      // 20 XP per correct answer
      onComplete(scoreRef.current * 20);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-brand-600">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold">La IA está preparando tus preguntas...</p>
      </div>
    );
  }

  const q = questions[currentIdx];
  const parts = q.text.split("______");

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl mt-10">
      <button onClick={onExit} className="text-slate-400 hover:text-slate-600 mb-6 flex items-center gap-2 font-bold">
        <ArrowLeft className="w-4 h-4" /> Salir del Juego
      </button>

      <div className="flex justify-between items-center mb-8 text-slate-400 font-bold text-sm uppercase tracking-wider">
        <span>Reto de Gramática</span>
        <span>{currentIdx + 1} / {questions.length}</span>
      </div>

      <div className="text-center mb-8 min-h-[120px] flex flex-col justify-center items-center">
        <div className="text-3xl font-bold text-slate-800 leading-relaxed">
          {parts[0]}
          
          {/* Gap styling */}
          {status === 'playing' ? (
             <span className="inline-block min-w-[100px] border-b-4 border-slate-300 text-slate-300 mx-2">_____</span>
          ) : status === 'correct' ? (
             <span className="inline-block border-b-4 border-green-500 text-green-600 mx-2 animate-bounce">{q.answer}</span>
          ) : (
             // Wrong state: Show wrong answer crossed out, then correct answer
             <span className="mx-2 whitespace-nowrap">
                <span className="inline-block text-red-400 line-through decoration-4 decoration-red-400 mr-2">{selectedOption}</span>
                <span className="inline-block text-green-600 font-bold border-b-4 border-green-500">{q.answer}</span>
             </span>
          )}
          
          {parts[1]}
        </div>
      </div>

      {/* Feedback / Explanation Section for Error */}
      {status === 'wrong' && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-left animate-fade-in">
              <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                      <h4 className="font-bold text-red-800 mb-1">¡Vaya! No es correcto.</h4>
                      <p className="text-red-700">{q.explanation}</p>
                  </div>
              </div>
              <button 
                onClick={() => nextQuestion()}
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                  Entendido, siguiente <ArrowRight className="w-4 h-4" />
              </button>
          </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-4">
        {q.options.map((opt: string) => {
           // Determine style based on state
           let btnClass = "text-xl font-bold py-4 rounded-xl transition-all border-b-4 ";
           
           if (status === 'playing') {
               btnClass += "bg-slate-50 border-slate-200 text-slate-700 hover:border-brand-400 hover:bg-brand-50 hover:-translate-y-1 active:translate-y-0";
           } else if (status === 'correct') {
               if (opt === q.answer) {
                   btnClass += "bg-green-100 border-green-500 text-green-700 scale-105";
               } else {
                   btnClass += "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
               }
           } else { // Wrong
                if (opt === selectedOption) {
                    btnClass += "bg-red-100 border-red-400 text-red-700 opacity-50";
                } else if (opt === q.answer) {
                    btnClass += "bg-green-50 border-green-500 text-green-700";
                } else {
                    btnClass += "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
                }
           }

           return (
            <button
                key={opt}
                onClick={() => handleOptionClick(opt)}
                disabled={status !== 'playing'}
                className={btnClass}
            >
                {opt}
            </button>
           );
        })}
      </div>

      {status === 'correct' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <Star className="w-48 h-48 text-yellow-400 fill-yellow-400 animate-spin-slow drop-shadow-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-4xl shadow-black drop-shadow-lg">
                +20 XP
            </div>
        </div>
      )}
    </div>
  );
};

export default GrammarGapFill;