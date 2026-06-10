import { useEffect, useState } from 'react';
import { ActiveSession, Question } from '../types';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

interface TestEngineProps {
  session: ActiveSession;
  questions: Question[];
  onUpdateSession: (session: ActiveSession) => void;
  onFinish: (session: ActiveSession) => void;
  onCancel: () => void;
}

export default function TestEngine({ session, questions, onUpdateSession, onFinish, onCancel }: TestEngineProps) {
  const [isChecked, setIsChecked] = useState(false);
  
  const currentQuestion = questions[session.currentQuestionIndex];
  const selectedAnswers = session.answers[currentQuestion.id] || [];
  
  // Is this question multi-select?
  const isMultiSelect = currentQuestion.correct_answers.length > 1;

  // Handle timer
  useEffect(() => {
    if (session.mode !== 'exam') return;
    
    const interval = setInterval(() => {
      if (session.timeRemaining <= 1) {
        clearInterval(interval);
        alert("Time is up! Your exam will be submitted automatically.");
        onFinish(session);
      } else {
        onUpdateSession({
          ...session,
          timeRemaining: session.timeRemaining - 1,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, onUpdateSession, onFinish]);

  // Reset checked state when changing questions
  useEffect(() => {
    setIsChecked(false);
  }, [session.currentQuestionIndex]);

  const handleSelectOption = (index: number) => {
    if (session.mode === 'practice' && isChecked) return; // disable changing once checked in practice mode

    let newAnswers = [...selectedAnswers];
    if (isMultiSelect) {
      if (newAnswers.includes(index)) {
        newAnswers = newAnswers.filter(i => i !== index);
      } else {
        // Limit selected count to number of correct answers
        if (newAnswers.length < currentQuestion.correct_answers.length) {
          newAnswers.push(index);
        }
      }
    } else {
      newAnswers = [index];
    }

    onUpdateSession({
      ...session,
      answers: {
        ...session.answers,
        [currentQuestion.id]: newAnswers
      }
    });
  };

  const toggleFlag = () => {
    const isFlagged = session.flaggedQuestions.includes(currentQuestion.id);
    const updatedFlags = isFlagged
      ? session.flaggedQuestions.filter(id => id !== currentQuestion.id)
      : [...session.flaggedQuestions, currentQuestion.id];

    onUpdateSession({
      ...session,
      flaggedQuestions: updatedFlags
    });
  };

  const nextQuestion = () => {
    if (session.currentQuestionIndex < questions.length - 1) {
      onUpdateSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1
      });
    }
  };

  const prevQuestion = () => {
    if (session.currentQuestionIndex > 0) {
      onUpdateSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex - 1
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isQuestionAnswered = (qId: number) => {
    return (session.answers[qId] || []).length > 0;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', flexWrap: 'wrap' }}>
      
      {/* Question panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Navigation Bar */}
        <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Question {session.currentQuestionIndex + 1} of {questions.length}</span>
            {isMultiSelect && (
              <span className="badge badge-purple">Select {currentQuestion.correct_answers.length}</span>
            )}
            {currentQuestion.domain && (
              <span className="badge badge-orange" style={{ fontSize: '0.75rem' }}>{currentQuestion.domain}</span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button 
              onClick={toggleFlag} 
              className="btn-secondary" 
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', color: session.flaggedQuestions.includes(currentQuestion.id) ? 'var(--aws-orange)' : 'var(--text-secondary)' }}
            >
              {session.flaggedQuestions.includes(currentQuestion.id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />} Flag Question
            </button>
            
            {session.mode === 'exam' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--aws-orange)' }}>
                <Clock size={18} />
                <span>{formatTime(session.timeRemaining)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Question content card */}
        <div className="glass-panel" style={{ padding: '2rem', minHeight: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div 
            style={{ fontSize: '1.15rem', lineHeight: 1.6, fontWeight: 500, whiteSpace: 'pre-line' }}
            dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
          />
          
          {/* Options Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentQuestion.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers.includes(optIdx);
              const isCorrectOpt = currentQuestion.correct_answers.includes(optIdx);
              
              let borderStyle = '1px solid var(--border-color)';
              let bgStyle = 'rgba(255, 255, 255, 0.02)';
              let markerIcon = null;

              if (session.mode === 'practice' && isChecked) {
                if (isCorrectOpt) {
                  borderStyle = '1px solid var(--accent-success)';
                  bgStyle = 'rgba(16, 185, 129, 0.1)';
                  markerIcon = <CheckCircle2 size={18} style={{ color: 'var(--accent-success)' }} />;
                } else if (isSelected) {
                  borderStyle = '1px solid var(--accent-error)';
                  bgStyle = 'rgba(239, 68, 68, 0.1)';
                  markerIcon = <XCircle size={18} style={{ color: 'var(--accent-error)' }} />;
                }
              } else if (isSelected) {
                borderStyle = '1px solid var(--accent-primary)';
                bgStyle = 'rgba(99, 102, 241, 0.1)';
              }

              return (
                <div 
                  key={optIdx} 
                  onClick={() => handleSelectOption(optIdx)}
                  style={{ 
                    border: borderStyle,
                    background: bgStyle,
                    padding: '1.2rem',
                    borderRadius: '12px',
                    cursor: (session.mode === 'practice' && isChecked) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  className="option-item"
                >
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: isMultiSelect ? '6px' : '50%', 
                    border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                    flexShrink: 0,
                    marginTop: '0.1rem'
                  }}>
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <div style={{ flex: 1, fontSize: '0.95rem', lineHeight: 1.5 }}>{opt}</div>
                  {markerIcon}
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Mode Detailed Explanations */}
        {session.mode === 'practice' && isChecked && (
          <div className="glass-panel animate-fade-in" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-primary)', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={20} style={{ color: 'var(--accent-primary)' }} />
              <h4 style={{ fontSize: '1.15rem' }}>Explanation & References</h4>
            </div>
            
            <div 
              style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}
              dangerouslySetInnerHTML={{ __html: currentQuestion.explanation }}
            />

            {currentQuestion.references.length > 0 && (
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>References & Documentation:</span>
                <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                  {currentQuestion.references.map((ref, refIdx) => (
                    <li key={refIdx} style={{ marginBottom: '0.3rem' }}>
                      <a href={ref} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}>
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Navigation actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={prevQuestion} 
            className="btn-secondary" 
            disabled={session.currentQuestionIndex === 0}
            style={{ opacity: session.currentQuestionIndex === 0 ? 0.5 : 1 }}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {session.mode === 'practice' && !isChecked && (
            <button 
              onClick={() => setIsChecked(true)} 
              className="btn-primary" 
              disabled={selectedAnswers.length === 0}
              style={{ background: 'linear-gradient(135deg, var(--accent-success) 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
            >
              Verify Answer
            </button>
          )}

          <button 
            onClick={nextQuestion} 
            className="btn-secondary" 
            disabled={session.currentQuestionIndex === questions.length - 1}
            style={{ opacity: session.currentQuestionIndex === questions.length - 1 ? 0.5 : 1 }}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>

      </div>

      {/* Side panel Navigator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Actions panel */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ fontSize: '1rem' }}>Test Operations</h4>
          
          <button 
            onClick={() => onFinish(session)} 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Finish and Submit
          </button>
          
          <button 
            onClick={onCancel} 
            className="btn-secondary" 
            style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-error)' }}
          >
            Cancel Test
          </button>
        </div>

        {/* Grid navigator panel */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Questions Panel</h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '0.5rem', 
            maxHeight: '350px', 
            overflowY: 'auto', 
            paddingRight: '0.3rem' 
          }}>
            {questions.map((q, idx) => {
              const isActive = session.currentQuestionIndex === idx;
              const isAnswered = isQuestionAnswered(q.id);
              const isFlagged = session.flaggedQuestions.includes(q.id);
              
              let bg = 'rgba(255,255,255,0.03)';
              let border = '1px solid var(--border-color)';
              let color = 'var(--text-secondary)';

              if (isActive) {
                border = '2px solid var(--accent-primary)';
                color = 'var(--text-primary)';
              } else if (isAnswered) {
                bg = 'rgba(99, 102, 241, 0.15)';
                border = '1px solid var(--accent-primary)';
                color = '#818cf8';
              }

              return (
                <div 
                  key={q.id} 
                  onClick={() => onUpdateSession({ ...session, currentQuestionIndex: idx })}
                  style={{ 
                    position: 'relative',
                    aspectRatio: '1',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: bg,
                    border: border,
                    color: color,
                    transition: 'all 0.1s ease'
                  }}
                >
                  {idx + 1}
                  {isFlagged && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '2px', 
                      right: '2px', 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--aws-orange)' 
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
