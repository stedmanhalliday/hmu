import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button', () => {
  it('should render children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    render(<Button className="extra-class">Test</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('extra-class');
  });

  it('should pass through type prop', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('should have base styling classes', () => {
    render(<Button>Styled</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-full');
    expect(button).toHaveClass('uppercase');
    expect(button).toHaveClass('tracking-widest');
    expect(button).toHaveClass('button');
  });

  it('should render with submit type for forms', () => {
    render(
      <form>
        <Button type="submit">Save</Button>
      </form>
    );
    expect(screen.getByRole('button', { name: /save/i })).toHaveAttribute('type', 'submit');
  });
});
