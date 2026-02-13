import React, { useEffect, useState } from 'react';
import Layout from '@theme-original/Layout';
import type LayoutType from '@theme/Layout';
import type { WrapperProps } from '@docusaurus/types';
import ResumeGenerator from '@site/src/components/resume-generator/ResumeGenerator';

type Props = WrapperProps<typeof LayoutType>;

export default function LayoutWrapper(props: Props): React.JSX.Element {
  const [showGenerator, setShowGenerator] = useState(false);

  useEffect(() => {
    const handleOpenResumeGenerator = () => {
      setShowGenerator(true);
    };

    window.addEventListener('openResumeGenerator', handleOpenResumeGenerator);

    return () => {
      window.removeEventListener('openResumeGenerator', handleOpenResumeGenerator);
    };
  }, []);

  return (
    <>
      <Layout {...props} />
      {showGenerator && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10000,
          background: 'white',
        }}>
          <ResumeGenerator onClose={() => setShowGenerator(false)} />
        </div>
      )}
    </>
  );
}
