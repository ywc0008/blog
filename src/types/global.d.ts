declare global {
  interface Window {
    trackEvent?: (name: string, params?: Record<string, unknown>) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export {};
