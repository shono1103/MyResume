import React from 'react';
import OriginalComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import ResumeGeneratorNavbarItem from './ResumeGeneratorNavbarItem';

const ComponentTypes = {
  ...OriginalComponentTypes,
  'custom-resumeGenerator': ResumeGeneratorNavbarItem,
};

export default ComponentTypes;
