import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

// Mock fetch
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('/health')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'healthy', app: 'DevOps Task Management API', version: '1.0.0' }),
      });
    }
    if (url.includes('/tasks/stats')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ total: 2, completed: 1, pending: 1, in_progress: 0, high_priority: 1 }),
      });
    }
    if (url.includes('/tasks')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: 1,
            title: 'Sample CI Task',
            description: 'Setup CircleCI pipeline',
            status: 'completed',
            priority: 'high',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]),
      });
    }
    return Promise.reject(new Error(`Unhandled request: ${url}`));
  });
});

describe('App Dashboard', () => {
  it('renders application title and navigation elements', async () => {
    render(<App />);
    expect(await screen.findByText('TaskOps')).toBeDefined();
    expect(await screen.findByText(/CircleCI CI\/CD/i)).toBeDefined();
    expect(await screen.findByText(/Continuous Integration & Automated Testing Pipeline/i)).toBeDefined();
  });
});
