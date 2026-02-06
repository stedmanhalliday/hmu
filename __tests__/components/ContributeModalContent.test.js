import { render, screen } from '@testing-library/react';
import ContributeModalContent from '../../components/ContributeModalContent';

describe('ContributeModalContent', () => {
  it('should render the introduction paragraph', () => {
    render(<ContributeModalContent />);
    expect(screen.getByText(/free, open source, and private/)).toBeInTheDocument();
  });

  it('should render email contact link', () => {
    render(<ContributeModalContent />);
    const emailLink = screen.getByRole('link', { name: /sup@hmu.world/i });
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:sup@hmu.world'));
  });

  it('should render X (Twitter) link', () => {
    render(<ContributeModalContent />);
    const twitterLink = screen.getByRole('link', { name: /@stedmanhalliday/i });
    expect(twitterLink).toHaveAttribute('href', 'https://x.com/stedmanhalliday');
  });

  it('should render GitHub link', () => {
    render(<ContributeModalContent />);
    const githubLink = screen.getByRole('link', { name: /stedmanhalliday\/hmu/i });
    expect(githubLink).toHaveAttribute('href', 'https://github.com/stedmanhalliday/hmu');
  });

  it('should render DonateButton', () => {
    render(<ContributeModalContent />);
    expect(screen.getByText('Donate')).toBeInTheDocument();
  });

  it('should open all links in new tab', () => {
    render(<ContributeModalContent />);
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
    });
  });
});
