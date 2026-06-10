import { PracticeTest, UserAttempt } from '../types';
import { Play, ClipboardList, Clock, RefreshCw } from 'lucide-react';

interface DashboardProps {
  tests: Record<string, PracticeTest>;
  attempts: UserAttempt[];
  onStartTest: (testId: string, mode: 'practice' | 'exam') => void;
  onViewAttempt: (attempt: UserAttempt) => void;
  onClearHistory: () => void;
}

export default function Dashboard({ tests, attempts, onStartTest, onViewAttempt, onClearHistory }: DashboardProps) {
  // Statistics Calculations
  const totalCompleted = attempts.length;
  const averageScore = totalCompleted 
    ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / totalCompleted) 
    : 0;
  
  const practiceCount = attempts.filter(a => a.mode === 'practice').length;
  const examCount = attempts.filter(a => a.mode === 'exam').length;
  
  const bestScore = totalCompleted 
    ? Math.max(...attempts.map(a => a.score)) 
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      
      {/* Hero Welcome banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <span className="badge badge-orange" style={{ marginBottom: '1rem' }}>AWS Certified Machine Learning Engineer - Associate</span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.8rem', lineHeight: 1.2 }}>Master your MLA-C01 Certification Exam</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '650px' }}>
            Interactive practice engine utilizing realistic scenario-based questions. Select between **Practice Mode** for immediate answer explanations, or **Exam Simulation Mode** to test your knowledge under real exam conditions.
          </p>
        </div>
        
        {/* Overall Stats box */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', width: '320px' }}>
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Score</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: averageScore >= 75 ? 'var(--accent-success)' : 'var(--aws-orange)', margin: '0.2rem 0' }}>
              {totalCompleted ? `${averageScore}%` : '--'}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Target: 75%</span>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Best Score</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: bestScore >= 75 ? 'var(--accent-success)' : '#818cf8', margin: '0.2rem 0' }}>
              {totalCompleted ? `${bestScore}%` : '--'}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Highest attempt</span>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completed</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {totalCompleted}
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{practiceCount} P / {examCount} E</span>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: averageScore >= 75 ? 'var(--accent-success)' : 'var(--text-secondary)', margin: '0.7rem 0 0.5rem' }}>
              {totalCompleted ? (averageScore >= 75 ? 'Ready' : 'In Progress') : 'Unstarted'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Tests */}
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ClipboardList className="text-indigo-400" style={{ color: '#818cf8' }} /> Available Practice Exams
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {Object.entries(tests)
            .filter(([testId]) => !testId.startsWith('domain_'))
            .map(([testId, test]) => (
              <div key={testId} className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{test.title}</h4>
                    <span className="badge badge-purple">{test.questions.length} Questions</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => onStartTest(testId, 'practice')} 
                    className="btn-secondary" 
                    style={{ flex: 1, fontSize: '0.9rem', padding: '0.7rem' }}
                  >
                    <RefreshCw size={16} /> Practice Mode
                  </button>
                  <button 
                    onClick={() => onStartTest(testId, 'exam')} 
                    className="btn-primary" 
                    style={{ flex: 1, fontSize: '0.9rem', padding: '0.7rem' }}
                  >
                    <Play size={16} /> Simulate Exam
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Practice by Exam Domain */}
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ClipboardList className="text-purple-400" style={{ color: '#c084fc' }} /> Practice by Domain
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {Object.entries(tests)
            .filter(([testId]) => testId.startsWith('domain_'))
            .map(([testId, test]) => (
              <div key={testId} className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>{test.title.replace(' (Practice)', '')}</h4>
                    <span className="badge badge-purple" style={{ flexShrink: 0 }}>{test.questions.length} Questions</span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Targeted practice focused exclusively on {test.title.replace(' (Practice)', '')} questions to master this specific exam domain.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                  <button 
                    onClick={() => onStartTest(testId, 'practice')} 
                    className="btn-secondary" 
                    style={{ flex: 1, fontSize: '0.9rem', padding: '0.7rem', border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)' }}
                  >
                    <RefreshCw size={16} /> Start Domain Practice
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* History attempts */}
      {attempts.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock style={{ color: '#818cf8' }} /> Test Attempts History
            </h3>
            <button 
              onClick={onClearHistory} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-error)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear History
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', height: '2.5rem' }}>
                  <th style={{ padding: '0.5rem' }}>Exam Name</th>
                  <th>Mode</th>
                  <th>Date Attempted</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th style={{ textAlign: 'right', paddingRight: '0.5rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const minutes = Math.floor(attempt.timeTaken / 60);
                  const seconds = attempt.timeTaken % 60;
                  return (
                    <tr key={attempt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', height: '3rem' }}>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{attempt.testTitle}</td>
                      <td>
                        <span className={`badge ${attempt.mode === 'practice' ? 'badge-purple' : 'badge-orange'}`}>
                          {attempt.mode === 'practice' ? 'Practice' : 'Simulation'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{attempt.date}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: attempt.score >= 75 ? 'var(--accent-success)' : 'var(--accent-error)' }}>
                          {attempt.score}%
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {minutes}m {seconds}s
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '0.5rem' }}>
                        <button 
                          onClick={() => onViewAttempt(attempt)} 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          Review Answers
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
