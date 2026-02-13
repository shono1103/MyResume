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
