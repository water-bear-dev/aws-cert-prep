import { useState } from 'react';
import { Question, UserAttempt } from '../types';
import { CheckCircle2, XCircle, ChevronLeft, Award, BookOpen, AlertCircle } from 'lucide-react';

interface ExamResultsProps {
  attempt: UserAttempt;
  questions: Question[];
  onBackToDashboard: () => void;
}

export default function ExamResults({ attempt, questions, onBackToDashboard }: ExamResultsProps) {
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // Group stats by Domain
  const domainStats: Record<string, { total: number; correct: number }> = {};
  
  questions.forEach((q) => {
    const domain = q.domain || 'General ML Engineering';
    if (!domainStats[domain]) {
      domainStats[domain] = { total: 0, correct: 0 };
    }
    
    domainStats[domain].total += 1;
    
    const userAnswers = attempt.answers[q.id] || [];
    const correctAnswers = q.correct_answers || [];
    const isCorrect = 
      userAnswers.length === correctAnswers.length && 
      userAnswers.every((val) => correctAnswers.includes(val));
      
    if (isCorrect) {
      domainStats[domain].correct += 1;
    }
  });

  const isPassed = attempt.score >= 75;

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const userAnswers = attempt.answers[q.id] || [];
    const correctAnswers = q.correct_answers || [];
    const isCorrect = 
      userAnswers.length === correctAnswers.length && 
      userAnswers.every((val) => correctAnswers.includes(val));

    if (filterMode === 'incorrect') return !isCorrect;
    if (filterMode === 'correct') return isCorrect;
    return true;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      
      {/* Back button */}
      <div>
        <button onClick={onBackToDashboard} className="btn-secondary" style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem' }}>
          <ChevronLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Main Score Banner */}
      <div className="glass-panel" style={{ 
        padding: '2.5rem', 
        background: isPassed 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem'
      }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <span className={`badge ${isPassed ? 'badge-success' : 'badge-error'}`} style={{ marginBottom: '1rem' }}>
            {isPassed ? 'PASSING SCORE' : 'FAILING SCORE'}
          </span>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {isPassed ? 'Congratulations! You Passed!' : 'Requires Further Review'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {isPassed 
              ? 'You have met or exceeded the 75% target threshold required for the AWS Certified Machine Learning Engineer exam simulation.'
              : 'The target threshold for passing is 75%. Review your incorrect answers and explanations below to improve your score.'}
          </p>
        </div>

        <div style={{ textAlign: 'center', minWidth: '150px' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            border: `6px solid ${isPassed ? 'var(--accent-success)' : 'var(--accent-error)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.8rem',
            background: 'rgba(0,0,0,0.3)',
            boxShadow: `0 0 20px ${isPassed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: isPassed ? 'var(--accent-success)' : 'var(--accent-error)' }}>
              {attempt.score}%
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              {attempt.correctCount} / {attempt.totalCount}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Attempted: {attempt.date}</span>
        </div>
      </div>

      {/* Domain Proficiency Section */}
      <div>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award style={{ color: '#818cf8' }} /> Domain-wise Diagnostics Report
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {Object.entries(domainStats).map(([domain, stat]) => {
            const domainScore = Math.round((stat.correct / stat.total) * 100);
            const isDomainPassed = domainScore >= 75;
            
            return (
              <div key={domain} className="glass-panel" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', height: '2.5rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {domain}
                </span>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Proficiency: {stat.correct}/{stat.total}</span>
                  <span style={{ fontWeight: 700, color: isDomainPassed ? 'var(--accent-success)' : 'var(--aws-orange)' }}>
                    {domainScore}%
                  </span>
                </div>

                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${domainScore}%`, 
                    height: '100%', 
                    background: isDomainPassed ? 'var(--accent-success)' : 'var(--aws-orange)',
                    borderRadius: '99px' 
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Questions Review Deck */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen style={{ color: '#818cf8' }} /> Question Review Deck
          </h3>

          {/* Filter tabs */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.2rem' }}>
            <button 
              onClick={() => setFilterMode('all')} 
              style={{ background: filterMode === 'all' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              All ({questions.length})
            </button>
            <button 
              onClick={() => setFilterMode('incorrect')} 
              style={{ background: filterMode === 'incorrect' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: 'var(--accent-error)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Incorrect ({questions.length - attempt.correctCount})
            </button>
            <button 
              onClick={() => setFilterMode('correct')} 
              style={{ background: filterMode === 'correct' ? 'var(--bg-secondary)' : 'transparent', border: 'none', color: 'var(--accent-success)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Correct ({attempt.correctCount})
            </button>
          </div>
        </div>

        {/* List of Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredQuestions.map((q) => {
            const userAnswers = attempt.answers[q.id] || [];
            const correctAnswers = q.correct_answers || [];
            const isCorrect = 
              userAnswers.length === correctAnswers.length && 
              userAnswers.every((val) => correctAnswers.includes(val));

            const isExpanded = expandedQuestionId === q.id;

            return (
              <div key={q.id} className="glass-panel" style={{ padding: '1.5rem', borderLeft: `4px solid ${isCorrect ? 'var(--accent-success)' : 'var(--accent-error)'}` }}>
                {/* Header info */}
                <div 
                  onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', cursor: 'pointer', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>Question {q.id}</span>
                      <span className={`badge ${isCorrect ? 'badge-success' : 'badge-error'}`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                      {q.domain && (
                        <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>{q.domain}</span>
                      )}
                    </div>
                    {isExpanded ? (
                      <div 
                        style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)', marginTop: '0.3rem', whiteSpace: 'pre-line' }}
                        dangerouslySetInnerHTML={{ __html: q.question_text }}
                      />
                    ) : (
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-primary)', marginTop: '0.3rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {q.question_text.replace(/<[^>]*>/g, '')}
                      </p>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-secondary)', fontWeight: 600, flexShrink: 0, marginTop: '0.2rem' }}>
                    {isExpanded ? 'Collapse' : 'Expand Details'}
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="animate-fade-in" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Options list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAnswers.includes(optIdx);
                        const isCorrectOpt = correctAnswers.includes(optIdx);
                        
                        let borderStyle = '1px solid var(--border-color)';
                        let bgStyle = 'rgba(255, 255, 255, 0.01)';
                        let statusIcon = null;

                        if (isCorrectOpt) {
                          borderStyle = '1px solid var(--accent-success)';
                          bgStyle = 'rgba(16, 185, 129, 0.08)';
                          statusIcon = <CheckCircle2 size={16} style={{ color: 'var(--accent-success)', marginLeft: 'auto' }} />;
                        } else if (isSelected) {
                          borderStyle = '1px solid var(--accent-error)';
                          bgStyle = 'rgba(239, 68, 68, 0.08)';
                          statusIcon = <XCircle size={16} style={{ color: 'var(--accent-error)', marginLeft: 'auto' }} />;
                        }

                        return (
                          <div key={optIdx} style={{ border: borderStyle, background: bgStyle, padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '4px', 
                              border: isSelected ? '2px solid var(--accent-primary)' : '2px solid var(--text-muted)',
                              backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: '#fff'
                            }}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span style={{ fontSize: '0.9rem', color: isCorrectOpt ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {opt}
                            </span>
                            {statusIcon}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation content */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.2rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertCircle size={16} style={{ color: 'var(--accent-primary)' }} /> Why this is the correct choice:
                      </h4>
                      <div 
                        style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}
                        dangerouslySetInnerHTML={{ __html: q.explanation }}
                      />
                      
                      {q.references.length > 0 && (
                        <div style={{ marginTop: '0.8rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>References:</span>
                          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.2rem', fontSize: '0.8rem' }}>
                            {q.references.map((ref, rIdx) => (
                              <li key={rIdx}>
                                <a href={ref} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}>
                                  {ref}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
