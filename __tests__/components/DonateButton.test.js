import { render, screen } from '@testing-library/react';
import DonateButton from '../../components/DonateButton';

describe('DonateButton', () => {
  it('should render a Donate label', () => {
    render(<DonateButton />);
    expect(screen.getByText('Donate')).toBeInTheDocument();
  });

  it('should link to Stripe payment page', () => {
    render(<DonateButton />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('buy.stripe.com'));
  });

  it('should open link in new tab', () => {
    render(<DonateButton />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('should render heart icon SVG', () => {
    const { container } = render(<DonateButton />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
