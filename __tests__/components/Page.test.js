import { render, screen } from '@testing-library/react';
import Page from '../../components/Page';

// Mock next/head since it doesn't render in tests
jest.mock('next/head', () => {
  return function MockHead({ children }) {
    return <>{children}</>;
  };
});

describe('Page', () => {
  describe('rendering', () => {
    it('should render children content', () => {
      render(
        <Page>
          <div data-testid="child-content">Hello World</div>
        </Page>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Page>
          <div>First child</div>
          <div>Second child</div>
          <div>Third child</div>
        </Page>
      );

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('should render the main element with correct base classes', () => {
      render(
        <Page>
          <div>Content</div>
        </Page>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toHaveClass('box-border');
      expect(main).toHaveClass('min-h-screen');
      expect(main).toHaveClass('flex');
      expect(main).toHaveClass('flex-col');
      expect(main).toHaveClass('items-center');
      expect(main).toHaveClass('p-8');
    });
  });

  describe('className prop', () => {
    it('should apply custom className to main element', () => {
      render(
        <Page className="custom-class">
          <div>Content</div>
        </Page>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('custom-class');
    });

    it('should merge custom className with base classes', () => {
      render(
        <Page className="bg-red-500 extra-class">
          <div>Content</div>
        </Page>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('bg-red-500');
      expect(main).toHaveClass('extra-class');
      expect(main).toHaveClass('min-h-screen');
    });

    it('should handle undefined className gracefully', () => {
      render(
        <Page>
          <div>Content</div>
        </Page>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('style prop', () => {
    it('should apply custom inline styles to main element', () => {
      const customStyle = { backgroundColor: 'blue', padding: '20px' };
      render(
        <Page style={customStyle}>
          <div>Content</div>
        </Page>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveStyle({ backgroundColor: 'blue', padding: '20px' });
    });

    it('should handle gradient background styles', () => {
      const gradientStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
      render(
        <Page style={gradientStyle}>
          <div>Content</div>
        </Page>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveStyle(gradientStyle);
    });
  });

  describe('structure', () => {
    it('should have correct DOM hierarchy', () => {
      const { container } = render(
        <Page>
          <div data-testid="child">Content</div>
        </Page>
      );

      // Root div > main > children
      const rootDiv = container.firstChild;
      expect(rootDiv.tagName).toBe('DIV');
      
      const main = rootDiv.querySelector('main');
      expect(main).toBeInTheDocument();
      
      const child = main.querySelector('[data-testid="child"]');
      expect(child).toBeInTheDocument();
    });
  });
});
