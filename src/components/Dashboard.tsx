import { PracticeTest } from '../types';
import { Play, ClipboardList, RefreshCw } from 'lucide-react';

interface DashboardProps {
  selectedCert: string;
  tests: Record<string, PracticeTest>;
  onStartTest: (testId: string, mode: 'practice' | 'exam') => void;
}

const CERT_INFO: Record<string, { title: string, code: string }> = {
  mle_associate: { title: 'AWS Certified Machine Learning Engineer - Associate', code: 'MLA-C01' },
  sa_associate: { title: 'AWS Certified Solutions Architect - Associate', code: 'SAA-C03' },
  sa_professional: { title: 'AWS Certified Solutions Architect - Professional', code: 'SAP-C02' },
  devops_professional: { title: 'AWS Certified DevOps Engineer - Professional', code: 'DOP-C02' },
  security_specialty: { title: 'AWS Certified Security - Specialty', code: 'SCS-C02' },
  de_associate: { title: 'AWS Certified Data Engineer - Associate', code: 'DEA-C01' },
  dv_associate: { title: 'AWS Certified Developer - Associate', code: 'DVA-C02' },
  sysops_associate: { title: 'AWS Certified SysOps Administrator - Associate', code: 'SOA-C02' }
};

export default function Dashboard({ selectedCert, tests, onStartTest }: DashboardProps) {

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
      
      {/* Hero Welcome banner */}
      <div className="glass-panel" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <span className="badge badge-orange" style={{ marginBottom: '1rem' }}>{CERT_INFO[selectedCert]?.code || 'AWS'}</span>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.8rem', lineHeight: 1.2 }}>Master your {CERT_INFO[selectedCert]?.title || 'AWS Certification'} Exam</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '650px' }}>
            Interactive practice engine utilizing realistic scenario-based questions. Select between <strong>Practice Mode</strong> for immediate answer explanations, or <strong>Exam Simulation Mode</strong> to test your knowledge under real exam conditions.
          </p>
        </div>
        

      </div>

      {/* Grid of Tests */}
      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ClipboardList className="text-indigo-400" style={{ color: '#818cf8' }} /> Available Practice Exams
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
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
      <div style={{ marginTop: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <ClipboardList size={24} className="text-purple" style={{ color: '#c084fc' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Practice by Domain</h3>
        </div>

        {Object.entries(
          Object.entries(tests)
            .filter(([testId]) => testId.startsWith('domain_'))
            .reduce((acc, [testId, test]) => {
              const group = test.certGroup || 'Default';
              if (!acc[group]) acc[group] = [];
              acc[group].push([testId, test]);
              return acc;
            }, {} as Record<string, [string, PracticeTest][]>)
        ).map(([groupName, groupDomains]) => (
          <div key={groupName} style={{ marginBottom: '2rem' }}>
            {groupName !== 'Default' && (
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#c084fc', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                {groupName}
              </h4>
            )}
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
              {groupDomains.map(([testId, test]) => {
                return (
                  <div key={testId} className="glass-panel" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>{test.title.replace(' (Practice)', '')}</h4>
                        <span className="badge badge-purple" style={{ flexShrink: 0 }}>{test.questions.length} Questions</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.5rem' }}>
                        Targeted practice focused exclusively on {test.title.replace(' (Practice)', '').replace(/^Domain \d+: /, '')} questions to master this specific exam domain.
                      </p>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button
                        onClick={() => onStartTest(testId, 'practice')}
                        className="btn-secondary"
                        style={{ width: '100%', padding: '0.7rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <RefreshCw size={18} />
                        Start Domain Practice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
