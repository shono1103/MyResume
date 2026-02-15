import React from 'react';
import ResumeAutoGeneratorButton from '@site/src/components/navigation/ResumeAutoGeneratorButton';

type Props = {
  label?: string;
  mobile?: boolean;
};

export default function ResumeAutoGeneratorItem(props: Props) {
  return <ResumeAutoGeneratorButton {...props} />;
}
