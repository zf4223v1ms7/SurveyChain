import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../src/components/Header';

// Mock RainbowKit
vi.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button>Connect Wallet</button>,
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Header Component', () => {
  it('should render header with logo and title', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText('FHE Survey')).toBeInTheDocument();
    expect(screen.getByText('Privacy-First Surveys')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    renderWithRouter(<Header />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    const aboutLink = screen.getByRole('link', { name: /about/i });

    expect(homeLink).toBeInTheDocument();
    expect(aboutLink).toBeInTheDocument();
  });

  it('should render connect wallet button', () => {
    renderWithRouter(<Header />);

    const connectButton = screen.getByText('Connect Wallet');
    expect(connectButton).toBeInTheDocument();
  });

  it('should show "Fully Encrypted" badge', () => {
    renderWithRouter(<Header />);

    expect(screen.getByText('Fully Encrypted')).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    renderWithRouter(<Header />);

    const homeLink = screen.getByRole('link', { name: /home/i });
    const aboutLink = screen.getByRole('link', { name: /about/i });

    expect(homeLink).toHaveAttribute('href', '/');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });
});
