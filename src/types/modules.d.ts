declare module '*.yml' {
  const content: string;
  export default content;
}

declare module '*.yaml' {
  const content: string;
  export default content;
}

declare module 'js-yaml' {
  export function load(input: string): unknown;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '@docusaurus/useBaseUrl' {
  export default function useBaseUrl(path: string): string;
}

declare module '@docusaurus/Link' {
  import * as React from 'react';
  const Link: React.ComponentType<React.AnchorHTMLAttributes<HTMLAnchorElement> & {to?: string}>;
  export default Link;
}

declare module '@theme-original/NavbarItem/ComponentTypes' {
  import * as React from 'react';
  const componentTypes: Record<string, React.ComponentType<any>>;
  export default componentTypes;
}
