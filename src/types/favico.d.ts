declare module 'favico.js' {
  interface FavicoOptions {
    animation?: 'fade' | 'slide' | 'pop' | 'popFade' | 'none';
    bgColor?: string;
    textColor?: string;
  }

  export default class Favico {
    constructor(options?: FavicoOptions);
    badge(value: number): void;
    reset(): void;
  }
}
