import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Simulacro de las fuentes de Next.js
vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans' }),
  Geist_Mono: () => ({ variable: 'geist-mono' }),
}));