import React, { useState } from 'react';
import { BookOpen, Sparkles, HelpCircle, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { generateStoryAndQuiz } from '../services/geminiService';
import { StoryData } from '../types';

interface ReadingQuestProps {
  onAddXp: (amount: number) => void;
}

const ReadingQuest: React.FC<ReadingQuestProps> = ({ onAddXp }) => {
  const [story, setStory] = useState<StoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerateStory = async () => {
    setLoading(true);
    setStory(null);
    setAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    
    const data = await generateStoryAndQuiz();
    if (data) {
      setStory(data);
    }
    setLoading(false);
  };

  const handleAnswerSelect = (qId: number, option: string) => {
    if (quizSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const submitQuiz = () => {
    if (!story) return;
    let newScore = 0;
    story.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        newScore++;
      }
    });
    setScore(newScore);
    setQuizSubmitted(true);
    if (newScore > 0) {
      onAddXp(newScore * 20);
    }
  };

  const renderHighlightedContent = () => {
    if (!story) return null;

    // Basic render if not submitted
    if (!quizSubmitted) {
        return <p className="whitespace-pre-wrap">{story.content}</p>;
    }

    // If submitted, look for evidence of WRONG answers to highlight
    const wrongEvidence = story.questions
        .filter(q => answers[q.id] !== q.correctAnswer && q.evidence)
        .map(q => q.evidence || "");

    if (wrongEvidence.length === 0) {
        return <p className="whitespace-pre-wrap">{story.content}</p>;
    }

    // Highlight logic
    // Fix: Use React.ReactNode instead of JSX.Element to avoid namespace errors
    let contentNodes: React.ReactNode[] = [story.content];

    wrongEvidence.forEach(evidence => {
        // Fix: Use React.ReactNode instead of JSX.Element
        const newNodes: React.ReactNode[] = [];
        contentNodes.forEach(node => {
            if (typeof node === 'string') {
                const parts = node.split(evidence);
                parts.forEach((part, i) => {
                    if (i > 0) {
                        newNodes.push(
                            <span key={`${evidence}-${i}`} className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded mx-0.5 shadow-sm border border-yellow-300">
                                {evidence}
                            </span>
                        );
                    }
                    if (part) newNodes.push(part);
                });
            } else {
                newNodes.push(node);
            }
        });
        contentNodes = newNodes;
    });

    return <div className="whitespace-pre-wrap leading-relaxed">{contentNodes}</div>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-brand-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 game-font">
              <BookOpen className="w-6 h-6" /> Misión de Lectura
            </h2>
            <p className="text-brand-100 text-sm mt-1">¡Lee la historia y demuestra que lo has entendido!</p>
          </div>
          <button 
            onClick={handleGenerateStory}
            disabled={loading}
            className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {story ? "Nueva Historia" : "Generar Historia"}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[400px]">
          {!story && !loading && (
            <div className="text-center text-slate-500 mt-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg">¡Pulsa el botón para generar una historia única con IA!</p>
              <p className="text-sm mt-2">Usará vocabulario de tu libro de texto.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-brand-600">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-bold animate-pulse">Invocando una historia...</p>
            </div>
          )}

          {story && (
            <div className="animate-fade-in">
              <h3 className="text-3xl font-bold text-slate-800 mb-4 game-font">{story.title}</h3>
              
              <div className="prose prose-lg text-slate-700 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
                 {renderHighlightedContent()}
              </div>

              {/* Quiz Section */}
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-md">
                <h4 className="text-xl font-bold text-brand-800 mb-6 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" /> Comprobación de Lectura
                </h4>
                
                <div className="space-y-8">
                  {story.questions.map((q) => (
                    <div key={q.id} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <p className="font-bold text-slate-800 mb-4 text-lg">{q.text}</p>
                      <div className="space-y-2">
                        {q.options.map((option) => {
                          let btnClass = "w-full text-left px-4 py-3 rounded-lg border transition-all font-medium ";
                          if (quizSubmitted) {
                            if (option === q.correctAnswer) btnClass += "bg-green-100 border-green-500 text-green-800 font-bold shadow-sm";
                            else if (answers[q.id] === option) btnClass += "bg-red-100 border-red-500 text-red-800 shadow-sm";
                            else btnClass += "bg-white border-slate-200 opacity-50";
                          } else {
                            if (answers[q.id] === option) btnClass += "bg-brand-100 border-brand-500 text-brand-800 shadow-sm scale-[1.01]";
                            else btnClass += "bg-white hover:bg-slate-50 border-slate-200";
                          }

                          return (
                            <button
                              key={option}
                              onClick={() => handleAnswerSelect(q.id, option)}
                              className={btnClass}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                      {quizSubmitted && answers[q.id] !== q.correctAnswer && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700 font-semibold animate-fade-in">
                              <AlertTriangle className="w-4 h-4" /> Mira el texto resaltado para encontrar la pista.
                          </div>
                      )}
                    </div>
                  ))}
                </div>

                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(answers).length < story.questions.length}
                    className="mt-8 w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-lg"
                  >
                    Comprobar Respuestas
                  </button>
                ) : (
                  <div className="mt-8 p-6 bg-brand-50 rounded-xl border border-brand-200 text-center animate-fade-in">
                    <p className="text-2xl font-bold text-brand-800 mb-2 game-font">
                      Resultado: {score} / {story.questions.length}
                    </p>
                    {score === story.questions.length ? (
                      <p className="text-green-600 flex items-center justify-center gap-2 font-bold text-lg">
                        <CheckCircle className="w-6 h-6" /> ¡Increíble! ¡Has ganado +{score * 20} XP!
                      </p>
                    ) : (
                      <div className="text-slate-600">
                         <p className="font-bold mb-1">¡Casi lo tienes!</p>
                         <p>Revisa las partes resaltadas en amarillo en el texto para ver dónde fallaste.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingQuest;