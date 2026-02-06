import { render, screen, fireEvent } from '@testing-library/react';
import TextButton from '../../components/TextButton';

describe('TextButton', () => {
  it('should render children text', () => {
    render(<TextButton>Cancel</TextButton>);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<TextButton onClick={handleClick}>Click</TextButton>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(<TextButton className="mt-4">Test</TextButton>);
    expect(screen.getByRole('button')).toHaveClass('mt-4');
  });

  it('should apply inline style', () => {
    render(<TextButton style={{ color: 'red' }}>Styled</TextButton>);
    expect(screen.getByRole('button')).toHaveStyle({ color: 'red' });
  });

  it('should pass through type prop', () => {
    render(<TextButton type="button">Action</TextButton>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should have base styling classes', () => {
    render(<TextButton>Base</TextButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('uppercase');
    expect(button).toHaveClass('tracking-widest');
    expect(button).toHaveClass('textButton');
  });

  it('should be disabled when disabled prop is true', () => {
    const handleClick = jest.fn();
    render(<TextButton onClick={handleClick} disabled>Disabled</TextButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
