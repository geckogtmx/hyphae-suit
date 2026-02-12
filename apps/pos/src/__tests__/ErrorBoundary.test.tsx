import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ErrorBoundary from '../components/ErrorBoundary';

const ThrowError = () => {
    throw new Error('Test Error');
};

describe('ErrorBoundary', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    afterEach(() => {
        consoleErrorSpy.mockClear();
    });

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Safe Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe Content')).toBeInTheDocument();
    });

    it('renders error UI when an error occurs', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
        expect(screen.getByText(/Test Error/)).toBeInTheDocument();
    });

    it('provides a reload button', () => {
        // Mock window.location.reload
        const reloadSpy = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: reloadSpy }
        });

        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        const button = screen.getByRole('button', { name: /reload application/i });
        fireEvent.click(button);
        expect(reloadSpy).toHaveBeenCalled();
    });
});
