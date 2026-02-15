import React from 'react';
import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import ResumeAutoGeneratorItem from './ResumeAutoGeneratorItem';

const ComponentTypes = {
  ...OriginalComponentTypes,
  'custom-resumeGenerator': ResumeAutoGeneratorItem,
};

export default ComponentTypes;
