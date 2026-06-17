import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import TestEngine from './components/TestEngine';
import ExamResults from './components/ExamResults';
import CertSelect from './components/CertSelect';
import { PracticeTest, ActiveSession, UserAttempt } from './types';
import { GraduationCap, Clock, Award } from 'lucide-react';
import CustomSelect from './components/CustomSelect';
import ConfirmModal from './components/ConfirmModal';

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
  
  const [selectedAttempt, setSelectedAttempt] = useState<UserAttempt | null>(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  const openConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  // Load tests JSON
  useEffect(() => {
    if (!selectedCert || selectedCert === 'cert_select_portal') return;
    
    setLoading(true);
    setError(null);
    
    fetch(`/data/${selectedCert}.json?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load test questions data for ${selectedCert}.`);
        return res.json();
      })
      .then((data: Record<string, PracticeTest>) => {
        // Group questions by domain
        const domainTests: Record<string, PracticeTest> = {};
        
        Object.values(data).forEach((test) => {
          test.questions.forEach((q) => {
            let domainName = q.domain || 'Uncategorized';
            const uniqueDomainKey = domainName;

            if (!domainTests[uniqueDomainKey]) {
              domainTests[uniqueDomainKey] = {
                title: `${domainName} (Practice)`,
                questions: []
              };
            }
            const newId = domainTests[uniqueDomainKey].questions.length + 1;
            domainTests[uniqueDomainKey].questions.push({
              ...q,
              id: newId
            });
          });
        });

        const updatedTests = { ...data };
        
        // Filter domains with >= 10 questions and sort them alphabetically
        const validDomains = Object.entries(domainTests)
          .filter(([_, test]) => test.questions.length >= 10)
          .sort((a, b) => a[0].localeCompare(b[0]));
          
        validDomains.forEach(([domainKey, test], index) => {
          const slug = domainKey.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const originalDomainName = test.title.replace(' (Practice)', '');
          
          // Add Domain # prefix if it's missing
          if (!/^domain\s*\d*:/i.test(originalDomainName) && !/^domain/i.test(originalDomainName)) {
            test.title = `Domain ${index + 1}: ${originalDomainName} (Practice)`;
          }
          
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

  }, [selectedCert]);

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
        correctAnswers.length > 0 &&
        userAnswers.length === correctAnswers.length && 
        userAnswers.every((val) => correctAnswers.includes(val));
        
      if (isCorrect) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / totalCount) * 100);
    const timeTaken = (165 * 60) - session.timeRemaining;

    const newAttempt: UserAttempt = {
      id: new Date().toISOString(),
      certId: selectedCert!,
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


    setSelectedAttempt(newAttempt);
    setActiveSession(null);
    setCurrentScreen('results');
  };


  const handleSelectCertChange = (certId: string) => {
    triggerCertChange(certId === 'cert_select_portal' ? null : certId);
  };

  const triggerCertChange = (certId: string | null) => {
    if (activeSession) {
      openConfirm('Switching certificates will cancel your current test/exam session. Do you want to proceed?', () => {
        setActiveSession(null);
        executeCertChange(certId);
        closeConfirm();
      });
      return;
    }
    executeCertChange(certId);
  };

  const executeCertChange = (certId: string | null) => {
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 100 }}>
              <CustomSelect
                value={selectedCert}
                onChange={handleSelectCertChange}
                options={[
                  { value: 'mle_associate', label: 'AWS Certified Machine Learning Engineer - Associate' },
                  { value: 'sa_associate', label: 'AWS Certified Solutions Architect - Associate' },
                  { value: 'sa_professional', label: 'AWS Certified Solutions Architect - Professional' },
                  { value: 'devops_professional', label: 'AWS Certified DevOps Engineer - Professional' },
                  { value: 'security_specialty', label: 'AWS Certified Security - Specialty' },
                  { value: 'network_specialty', label: 'AWS Certified Advanced Networking - Specialty' },
                  { value: 'de_associate', label: 'AWS Certified Data Engineer - Associate' },
                  { value: 'dv_associate', label: 'AWS Certified Developer - Associate' },
                  { value: 'sysops_associate', label: 'AWS Certified SysOps Administrator - Associate' }
                ]}
              />
            </div>
          )}

          {selectedCert && currentScreen !== 'test' && (
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn-secondary"
                onClick={() => handleSelectCertChange('cert_select_portal')}
                style={{ fontSize: '0.9rem', padding: '0.6rem 1.2rem', borderColor: 'var(--border-color)' }}
              >
                ← Back to portal
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
            {currentScreen === 'dashboard' && selectedCert && (
              <Dashboard 
                selectedCert={selectedCert}
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
                  openConfirm('Are you sure you want to quit this test session? Your progress will be lost.', () => {
                    setActiveSession(null);
                    setCurrentScreen('dashboard');
                    closeConfirm();
                  });
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
          <Clock size={12} /> Last sync: Jun 2026
        </p>
      </footer>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
