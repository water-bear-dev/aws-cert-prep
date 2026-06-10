import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TestEngine from './components/TestEngine';
import ExamResults from './components/ExamResults';
import CertSelect from './components/CertSelect';
import { PracticeTest, ActiveSession, UserAttempt } from './types';
import { BookOpen, GraduationCap, History, Award } from 'lucide-react';

export default function App() {
  const [tests, setTests] = useState<Record<string, PracticeTest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Certification Selection
  const [selectedCert, setSelectedCert] = useState<string | null>(() => {
    return localStorage.getItem('selected_aws_cert');
  });

  // Navigation
  const [currentScreen, setCurrentScreen] = useState<'cert_select' | 'dashboard' | 'test' | 'results'>(() => {
    const saved = localStorage.getItem('selected_aws_cert');
    return saved ? 'dashboard' : 'cert_select';
  });
  
  // Active session states
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  
  // Completed attempts history
  const [attempts, setAttempts] = useState<UserAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<UserAttempt | null>(null);

  // Load tests JSON
  useEffect(() => {
    fetch(`/data/tests.json?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load test questions data.');
        return res.json();
      })
      .then((data: Record<string, PracticeTest>) => {
        // Group questions by domain
        const domainTests: Record<string, PracticeTest> = {};
        
        Object.entries(data).forEach(([_, test]) => {
          test.questions.forEach((q) => {
            const domainName = q.domain || 'Uncategorized';
            if (!domainTests[domainName]) {
              domainTests[domainName] = {
                title: `${domainName} (Practice)`,
                questions: []
              };
            }
            const newId = domainTests[domainName].questions.length + 1;
            domainTests[domainName].questions.push({
              ...q,
              id: newId
            });
          });
        });

        const updatedTests = { ...data };
        Object.entries(domainTests).forEach(([domainName, test]) => {
          const slug = domainName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          updatedTests[`domain_${slug}`] = test;
        });

        setTests(updatedTests);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });

    // Load history from localStorage
    const savedAttempts = localStorage.getItem('aws_exam_prep_attempts');
    if (savedAttempts) {
      try {
        setAttempts(JSON.parse(savedAttempts));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Save attempts to localStorage
  const saveAttempt = (newAttempt: UserAttempt) => {
    const updated = [newAttempt, ...attempts];
    setAttempts(updated);
    localStorage.setItem('aws_exam_prep_attempts', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your test history?')) {
      setAttempts([]);
      localStorage.removeItem('aws_exam_prep_attempts');
    }
  };

  const startTest = (testId: string, mode: 'practice' | 'exam') => {
    const test = tests[testId];
    if (!test) return;

    setActiveSession({
      testId,
      testTitle: test.title,
      mode,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      timeRemaining: 165 * 60, // 165 minutes in seconds
      isFinished: false,
      timeTaken: 0,
    });
    setCurrentScreen('test');
  };

  const finishTestSession = (session: ActiveSession) => {
    const test = tests[session.testId];
    if (!test) return;

    // Calculate score
    let correctCount = 0;
    const totalCount = test.questions.length;

    test.questions.forEach((q) => {
      const userAnswers = session.answers[q.id] || [];
      const correctAnswers = q.correct_answers || [];
      
      // Sort and compare arrays
      const isCorrect = 
        userAnswers.length === correctAnswers.length && 
        userAnswers.every((val) => correctAnswers.includes(val));
        
      if (isCorrect) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / totalCount) * 100);
    const timeTaken = (165 * 60) - session.timeRemaining;

    const newAttempt: UserAttempt = {
      id: Math.random().toString(36).substr(2, 9),
      testId: session.testId,
      testTitle: session.testTitle,
      date: new Date().toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      mode: session.mode,
      score,
      correctCount,
      totalCount,
      answers: session.answers,
      timeTaken,
      completed: true,
    };

    saveAttempt(newAttempt);
    setSelectedAttempt(newAttempt);
    setActiveSession(null);
    setCurrentScreen('results');
  };

  const viewAttempt = (attempt: UserAttempt) => {
    setSelectedAttempt(attempt);
    setCurrentScreen('results');
  };

  const handleSelectCertChange = (certId: string) => {
    if (certId === 'cert_select_portal') {
      triggerCertChange(null);
      return;
    }
    if (certId === 'mle_associate') {
      triggerCertChange('mle_associate');
    }
  };

  const triggerCertChange = (certId: string | null) => {
    if (activeSession) {
      if (!window.confirm('Switching certificates will cancel your current test/exam session. Do you want to proceed?')) {
        return;
      }
      setActiveSession(null);
    }
    
    if (certId === null) {
      setSelectedCert(null);
      localStorage.removeItem('selected_aws_cert');
      setCurrentScreen('cert_select');
    } else {
      setSelectedCert(certId);
      localStorage.setItem('selected_aws_cert', certId);
      setCurrentScreen('dashboard');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
        <GraduationCap size={48} className="text-indigo-500" style={{ color: '#6366f1', animation: 'spin 2s linear infinite' }} />
        <p style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: '1.2rem', color: '#9ca3af' }}>Loading Practice Exam Platform...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
        <Award size={48} style={{ color: '#ef4444' }} />
        <h2 style={{ color: '#ef4444', fontFamily: 'Outfit, sans-serif' }}>Failed to Load</h2>
        <p style={{ color: '#9ca3af', maxWidth: '500px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Premium Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: selectedCert ? 'pointer' : 'default' }} 
          onClick={() => selectedCert && setCurrentScreen('dashboard')}
        >
          <div style={{ background: 'linear-gradient(135deg, var(--aws-orange) 0%, #ffc061 100%)', padding: '0.6rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={28} color="#090d16" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }} className="gradient-text">AWS CERT PREP</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--aws-orange)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {selectedCert === 'mle_associate' ? 'MACHINE LEARNING ENGINEER' : 'CERTIFICATION PORTAL'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {selectedCert && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <select
                value={selectedCert}
                onChange={(e) => handleSelectCertChange(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                <option value="mle_associate" style={{ background: '#090d16', color: 'var(--text-primary)' }}>
                  AWS Certified Machine Learning Engineer - Associate
                </option>
                <option value="sa_associate" disabled style={{ background: '#090d16', color: 'var(--text-muted)' }}>
                  AWS Certified Solutions Architect - Associate (Soon)
                </option>
                <option value="sa_professional" disabled style={{ background: '#090d16', color: 'var(--text-muted)' }}>
                  AWS Certified Solutions Architect - Professional (Soon)
                </option>
                <option value="devops_professional" disabled style={{ background: '#090d16', color: 'var(--text-muted)' }}>
                  AWS Certified DevOps Engineer - Professional (Soon)
                </option>
                <option value="security_specialty" disabled style={{ background: '#090d16', color: 'var(--text-muted)' }}>
                  AWS Certified Security - Specialty (Soon)
                </option>
                <option value="cert_select_portal" style={{ background: '#090d16', color: 'var(--aws-orange)' }}>
                  ← Change Certificate Portal
                </option>
              </select>
            </div>
          )}

          {selectedCert && currentScreen !== 'test' && (
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className={`btn-secondary ${currentScreen === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentScreen('dashboard')}
                style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', borderColor: currentScreen === 'dashboard' ? 'var(--accent-primary)' : 'var(--border-color)' }}
              >
                <BookOpen size={16} /> Dashboard
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Screens */}
      <main style={{ flex: 1 }}>
        {(currentScreen === 'cert_select' || !selectedCert) ? (
          <CertSelect onSelectCert={(certId) => triggerCertChange(certId)} />
        ) : (
          <>
            {currentScreen === 'dashboard' && (
              <Dashboard 
                tests={tests} 
                attempts={attempts} 
                onStartTest={startTest} 
                onViewAttempt={viewAttempt} 
                onClearHistory={clearHistory}
              />
            )}
            
            {currentScreen === 'test' && activeSession && (
              <TestEngine 
                session={activeSession} 
                questions={tests[activeSession.testId].questions} 
                onUpdateSession={setActiveSession}
                onFinish={finishTestSession}
                onCancel={() => {
                  if (window.confirm('Are you sure you want to quit this test session? Your progress will be lost.')) {
                    setActiveSession(null);
                    setCurrentScreen('dashboard');
                  }
                }}
              />
            )}

            {currentScreen === 'results' && selectedAttempt && (
              <ExamResults 
                attempt={selectedAttempt} 
                questions={tests[selectedAttempt.testId].questions} 
                onBackToDashboard={() => {
                  setSelectedAttempt(null);
                  setCurrentScreen('dashboard');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Premium Footer */}
      <footer style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>© 2026 AWS Exam Prep Engine. Powered by TypeScript & React.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={12} /> Last sync: Jun 2026
        </p>
      </footer>
    </div>
  );
}
