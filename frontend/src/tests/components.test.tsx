import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';

describe('UI Reusable Components', () => {
  it('renders primary button with accessible text', () => {
    render(<Button variant="primary">नोंदणी करा</Button>);
    const btn = screen.getByRole('button', { name: 'नोंदणी करा' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass('bg-forest-600');
  });

  it('renders loading state in button', () => {
    render(<Button isLoading>जतन करत आहे...</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(screen.getByText('जतन करत आहे...')).toBeInTheDocument();
  });

  it('renders Input with accessible label and error state', () => {
    render(
      <Input
        label="मोबाईल नंबर"
        error="कृपया अचूक मोबाईल नंबर टाका"
        defaultValue="123"
      />
    );
    expect(screen.getByLabelText('मोबाईल नंबर')).toBeInTheDocument();
    expect(screen.getByText('कृपया अचूक मोबाईल नंबर टाका')).toBeInTheDocument();
  });

  it('renders Badge with development variant', () => {
    render(<Badge variant="development">Phase 2</Badge>);
    expect(screen.getByText('Phase 2')).toBeInTheDocument();
  });
});

