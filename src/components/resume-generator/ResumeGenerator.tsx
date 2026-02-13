import React, { useState, useEffect } from 'react';
import { load as parseYaml } from 'js-yaml';
import ResumeGeneratorModal from './ResumeGeneratorModal';
import ResumeTemplate from './ResumeTemplate';
import CareerHistoryTemplate from './CareerHistoryTemplate';

interface IntroData {
  intro: {
    base_info: Array<{
      name: string;
    }>;
    email: string;
    hobby: string[];
  };
}

interface HistoryItem {
  time: string;
  title: string;
}

interface HistoryData {
  timeline: HistoryItem[];
}

interface Certification {
  name: string;
  DateOfQualification: string;
}

interface CertificationData {
  certifications: Certification[];
}

interface ExperienceProject {
  title: string;
  summary: string;
  role: string[];
  tech: {
    os?: string[];
    lang?: string[];
    infra?: string[];
  };
}

interface ExperienceCompany {
  name: string;
  period: string;
  projects: ExperienceProject[];
}

interface ExperienceData {
  companies: ExperienceCompany[];
}

interface PersonalProject {
  name: string;
  tech_stack: string[];
  abstract: string;
  repos_url: string;
}

interface ProjectData {
  projects: PersonalProject[];
}

interface ResumeGeneratorProps {
  onClose?: () => void;
}

export default function ResumeGenerator({ onClose }: ResumeGeneratorProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [showResume, setShowResume] = useState(false);
  const [showCareerHistory, setShowCareerHistory] = useState(false);
  const [introData, setIntroData] = useState<IntroData | null>(null);
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [certificationData, setCertificationData] = useState<CertificationData | null>(null);
  const [experienceData, setExperienceData] = useState<ExperienceData | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [formData, setFormData] = useState<{
    phone: string;
    address: string;
    photoDataUrl?: string;
  } | null>(null);
  const [abstractText, setAbstractText] = useState<string>('');
  const [selfPRText, setSelfPRText] = useState<string>('');

  useEffect(() => {
    // Load YAML data
    const loadData = async () => {
      try {
        const [intro, history, certifications, experiences, projects, abstract, selfPR] = await Promise.all([
          fetch('/MyResume/data/intro.yml').then(r => r.text()).then(t => parseYaml(t) as IntroData),
          fetch('/MyResume/data/history.yml').then(r => r.text()).then(t => parseYaml(t) as HistoryData),
          fetch('/MyResume/data/certifications.yml').then(r => r.text()).then(t => parseYaml(t) as CertificationData),
          fetch('/MyResume/data/experiences.yml').then(r => r.text()).then(t => parseYaml(t) as ExperienceData),
          fetch('/MyResume/data/projects.yml').then(r => r.text()).then(t => parseYaml(t) as ProjectData),
          fetch('/MyResume/data/experience-details/abstract.md').then(r => r.text()).catch(() => ''),
          fetch('/MyResume/data/selfPR.md').then(r => r.text()).catch(() => ''),
        ]);

        setIntroData(intro);
        setHistoryData(history);
        setCertificationData(certifications);
        setExperienceData(experiences);
        setProjectData(projects);
        setAbstractText(abstract);
        setSelfPRText(selfPR);
      } catch (error) {
        console.error('Failed to load YAML data:', error);
      }
    };

    loadData();
  }, []);

  const handleGenerate = async (data: { phone: string; address: string; photoFile: File | null }) => {
    let photoDataUrl: string | undefined;
    
    if (data.photoFile) {
      photoDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(data.photoFile!);
      });
    }

    setFormData({
      phone: data.phone,
      address: data.address,
      photoDataUrl,
    });

    setIsModalOpen(false);
    setShowResume(true);
  };

  const handlePrintResume = () => {
    window.print();
  };

  const handleShowCareerHistory = () => {
    setShowResume(false);
    setShowCareerHistory(true);
  };

  const handleShowResume = () => {
    setShowCareerHistory(false);
    setShowResume(true);
  };

  const handleClose = () => {
    setShowResume(false);
    setShowCareerHistory(false);
    setFormData(null);
    if (onClose) {
      onClose();
    }
  };

  if (showResume && formData && introData && historyData && certificationData) {
    const resumeData = {
      name: introData.intro.base_info[0]?.name || '',
      email: introData.intro.email || '',
      phone: formData.phone,
      address: formData.address,
      photoDataUrl: formData.photoDataUrl,
      hobbies: introData.intro.hobby || [],
      history: historyData.timeline.map(item => ({
        time: item.time,
        title: item.title,
      })),
      certifications: certificationData.certifications.map(cert => ({
        name: cert.name,
        DateOfQualification: cert.DateOfQualification,
      })),
    };

    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', position: 'sticky', top: 0, zIndex: 1000 }}>
          <button onClick={handlePrintResume} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            印刷 / PDF保存
          </button>
          <button onClick={handleShowCareerHistory} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            職務経歴書を表示
          </button>
          <button onClick={handleClose} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            閉じる
          </button>
        </div>
        <ResumeTemplate data={resumeData} />
      </div>
    );
  }

  if (showCareerHistory && experienceData && projectData) {
    const careerData = {
      resumeSiteUrl: 'https://shono1103.github.io/MyResume/',
      abstract: abstractText,
      experiences: experienceData.companies,
      personalProjects: projectData.projects,
      selfPR: selfPRText,
    };

    return (
      <div>
        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', position: 'sticky', top: 0, zIndex: 1000 }}>
          <button onClick={handlePrintResume} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            印刷 / PDF保存
          </button>
          <button onClick={handleShowResume} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer' }}>
            履歴書を表示
          </button>
          <button onClick={handleClose} style={{ padding: '10px 20px', cursor: 'pointer' }}>
            閉じる
          </button>
        </div>
        <CareerHistoryTemplate data={careerData} />
      </div>
    );
  }

  return (
    <>
      <ResumeGeneratorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onClose) {
            onClose();
          }
        }}
        onGenerate={handleGenerate}
      />
    </>
  );
}
