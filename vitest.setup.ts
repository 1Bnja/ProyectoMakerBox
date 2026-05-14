import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/font/google', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Geist: () => ({ variable: 'geist-sans' }),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Geist_Mono: () => ({ variable: 'geist-mono' }),
}));