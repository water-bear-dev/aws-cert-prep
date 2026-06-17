import { GraduationCap, Lock, Award, Cloud, Shield, Settings } from 'lucide-react';

interface CertSelectProps {
  onSelectCert: (certId: string) => void;
}

export default function CertSelect({ onSelectCert }: CertSelectProps) {
  const certifications = [
    {
      id: 'mle_associate',
      title: 'AWS Certified Machine Learning Engineer',
      level: 'Associate (MLA-C01)',
      icon: <GraduationCap size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate your ability to build, train, tune, deploy, and monitor machine learning models on AWS.',
      questions: 195,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'sa_associate',
      title: 'AWS Certified Solutions Architect',
      level: 'Associate (SAA-C03)',
      icon: <Cloud size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate your ability to design and deploy secure and robust applications on AWS technologies.',
      questions: 390,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'sa_professional',
      title: 'AWS Certified Solutions Architect',
      level: 'Professional (SAP-C02)',
      icon: <Award size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate advanced technical skills and experience designing distributed systems and applications on AWS.',
      questions: 150,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'devops_professional',
      title: 'AWS Certified DevOps Engineer',
      level: 'Professional (DOP-C02)',
      icon: <Settings size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate technical expertise in provisioning, operating, and managing distributed application systems on AWS.',
      questions: 75,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'security_specialty',
      title: 'AWS Certified Security',
      level: 'Specialty (SCS-C02)',
      icon: <Shield size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate your credentials in securing AWS environments, covering advanced security configurations and hybrid clouds.',
      questions: 195,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'network_specialty',
      title: 'AWS Certified Advanced Networking',
      level: 'Specialty (ANS-C01)',
      icon: <Cloud size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate your expertise in designing and maintaining network architecture for the breadth of AWS services.',
      questions: 65,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'de_associate',
      title: 'AWS Certified Data Engineer',
      level: 'Associate (DEA-C01)',
      icon: <Cloud size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate skills and experience in core data-related AWS services.',
      questions: 260,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'dv_associate',
      title: 'AWS Certified Developer',
      level: 'Associate (DVA-C02)',
      icon: <Settings size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate your ability to develop, deploy, and debug cloud-based applications using AWS.',
      questions: 390,
      status: 'available',
      badge: 'Active'
    },
    {
      id: 'sysops_associate',
      title: 'AWS Certified SysOps Administrator',
      level: 'Associate (SOA-C02)',
      icon: <Settings size={32} style={{ color: 'var(--aws-orange)' }} />,
      desc: 'Validate technical expertise in deployment, management, and operations on the AWS platform.',
      questions: 260,
      status: 'available',
      badge: 'Active'
    }
  ];


  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '3rem auto 5rem auto', padding: '0 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }} className="gradient-text">
          Select Your Target Certification
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
          Choose from AWS Associate, Professional, or Specialty preparation suites. Get access to realistic, scenario-based practice questions.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        {[
          { title: 'Associate', certs: certifications.filter(c => c.level.startsWith('Associate')) },
          { title: 'Professional', certs: certifications.filter(c => c.level.startsWith('Professional')) },
          { title: 'Specialty', certs: certifications.filter(c => c.level.startsWith('Specialty')) }
        ].map((group) => (
          <div key={group.title}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {group.title} Level
              </h3>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
              {group.certs.map((cert) => {
                const isAvailable = cert.status === 'available';

                return (
                  <div
                    key={cert.id}
                    onClick={() => isAvailable && onSelectCert(cert.id)}
                    className="glass-panel"
                    style={{
                      padding: '2rem',
                      borderRadius: '16px',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.2rem',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: isAvailable ? '1px solid rgba(255, 153, 0, 0.15)' : '1px solid var(--border-color)',
                      opacity: isAvailable ? 1 : 0.65,
                      transform: 'translateY(0)',
                      boxShadow: isAvailable ? '0 8px 32px rgba(255, 153, 0, 0.03)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (isAvailable) {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.borderColor = 'var(--aws-orange)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(255, 153, 0, 0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isAvailable) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255, 153, 0, 0.15)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 153, 0, 0.03)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '12px' }}>
                        {cert.icon}
                      </div>
                      <span
                        className={`badge ${isAvailable ? 'badge-orange' : ''}`}
                        style={{
                          backgroundColor: isAvailable ? 'rgba(255, 153, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: isAvailable ? 'var(--aws-orange)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        {!isAvailable && <Lock size={12} />}
                        {cert.badge}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>
                        {cert.title}
                      </h3>
                      <span style={{ fontSize: '0.85rem', color: isAvailable ? 'var(--aws-orange)' : 'var(--text-muted)', fontWeight: 600 }}>
                        {cert.level}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, flexGrow: 1 }}>
                      {cert.desc}
                    </p>

                    {isAvailable ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Total Questions: <strong>{cert.questions}</strong>
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--aws-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          Start Preparation →
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <span>Question bank under development</span>
                      </div>
                    )}
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
