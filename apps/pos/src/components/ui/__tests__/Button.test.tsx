import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '../Button';

describe('Button Component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('bg-lime-500'); // Default variant class
    });

    it('applies destructive variant classes', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button', { name: /delete/i });
        expect(button).toHaveClass('bg-red-500');
    });

    it('applies outline variant classes', () => {
        render(<Button variant="outline">Outline</Button>);
        const button = screen.getByRole('button', { name: /outline/i });
        expect(button).toHaveClass('border-zinc-200');
    });

    it('applies ghost variant classes', () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole('button', { name: /ghost/i });
        expect(button).toHaveClass('hover:bg-zinc-100');
    });

    it('applies link variant classes', () => {
        render(<Button variant="link">Link</Button>);
        const button = screen.getByRole('button', { name: /link/i });
        expect(button).toHaveClass('underline-offset-4');
    });

    it('applies secondary variant classes', () => {
        render(<Button variant="secondary">Secondary</Button>);
        const button = screen.getByRole('button', { name: /secondary/i });
        expect(button).toHaveClass('bg-zinc-100');
    });

    it('applies size classes', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-9');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-11');

        rerender(<Button size="icon">Icon</Button>);
        expect(screen.getByRole('button')).toHaveClass('h-10 w-10');
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Clickable</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Ref Button</Button>);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('merges custom classes', () => {
        render(<Button className="custom-class">Custom</Button>);
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('is disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByRole('button')).toHaveClass('disabled:opacity-50');
    });
});
