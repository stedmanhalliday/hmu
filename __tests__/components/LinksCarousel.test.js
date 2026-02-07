import { render, screen, fireEvent } from '@testing-library/react';
import LinksCarousel, { ITEMS_PER_PAGE } from '../../components/LinksCarousel';

describe('LinksCarousel', () => {
  const createItems = (count) =>
    Array.from({ length: count }, (_, i) => <div key={i} data-testid={`item-${i}`}>Item {i}</div>);

  describe('ITEMS_PER_PAGE export', () => {
    it('should export ITEMS_PER_PAGE as 8', () => {
      expect(ITEMS_PER_PAGE).toBe(8);
    });
  });

  describe('single page', () => {
    it('should render all items on one page', () => {
      render(<LinksCarousel>{createItems(4)}</LinksCarousel>);

      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
      }
    });

    it('should not show page indicator dots for single page', () => {
      render(<LinksCarousel>{createItems(4)}</LinksCarousel>);
      const dots = screen.queryAllByRole('button', { name: /go to page/i });
      expect(dots).toHaveLength(0);
    });
  });

  describe('multiple pages', () => {
    it('should render page indicator dots when items exceed page size', () => {
      render(<LinksCarousel>{createItems(12)}</LinksCarousel>);
      const dots = screen.getAllByRole('button', { name: /go to page/i });
      expect(dots).toHaveLength(2);
    });

    it('should render correct number of pages', () => {
      render(<LinksCarousel>{createItems(20)}</LinksCarousel>);
      const dots = screen.getAllByRole('button', { name: /go to page/i });
      expect(dots).toHaveLength(3); // 20 / 8 = 2.5 → 3 pages
    });

    it('should render all items across pages', () => {
      render(<LinksCarousel>{createItems(12)}</LinksCarousel>);
      for (let i = 0; i < 12; i++) {
        expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
      }
    });

    it('should have accessible labels on page dots', () => {
      render(<LinksCarousel>{createItems(12)}</LinksCarousel>);
      expect(screen.getByRole('button', { name: 'Go to page 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Go to page 2' })).toBeInTheDocument();
    });
  });

  describe('single child handling', () => {
    it('should handle a single child element', () => {
      render(
        <LinksCarousel>
          <div data-testid="single">Only one</div>
        </LinksCarousel>
      );
      expect(screen.getByTestId('single')).toBeInTheDocument();
    });
  });

  describe('exactly one page', () => {
    it('should not show dots for exactly ITEMS_PER_PAGE items', () => {
      render(<LinksCarousel>{createItems(ITEMS_PER_PAGE)}</LinksCarousel>);
      const dots = screen.queryAllByRole('button', { name: /go to page/i });
      expect(dots).toHaveLength(0);
    });
  });

  describe('scroll handling', () => {
    it('should highlight first page dot by default', () => {
      render(<LinksCarousel>{createItems(12)}</LinksCarousel>);

      const dots = screen.getAllByRole('button', { name: /go to page/i });
      expect(dots[0].className).toContain('bg-black/60');
      expect(dots[1].className).toContain('bg-black/20');
    });

    it('should update active page dot on scroll', () => {
      const { container } = render(<LinksCarousel>{createItems(12)}</LinksCarousel>);

      const scrollContainer = container.querySelector('.overflow-x-auto');

      // Simulate scrolling to the second page
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 375, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 375, configurable: true });
      fireEvent.scroll(scrollContainer);

      const dots = screen.getAllByRole('button', { name: /go to page/i });
      expect(dots[0].className).toContain('bg-black/20');
      expect(dots[1].className).toContain('bg-black/60');
    });

    it('should stay on first page when scrolled partway', () => {
      const { container } = render(<LinksCarousel>{createItems(12)}</LinksCarousel>);

      const scrollContainer = container.querySelector('.overflow-x-auto');

      // Simulate a small scroll that rounds back to page 0
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 375, configurable: true });
      fireEvent.scroll(scrollContainer);

      const dots = screen.getAllByRole('button', { name: /go to page/i });
      expect(dots[0].className).toContain('bg-black/60');
      expect(dots[1].className).toContain('bg-black/20');
    });
  });

  describe('goToPage', () => {
    it('should scroll to correct offset when page dot is clicked', () => {
      const { container } = render(<LinksCarousel>{createItems(12)}</LinksCarousel>);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 375, configurable: true });
      scrollContainer.scrollTo = jest.fn();

      const dots = screen.getAllByRole('button', { name: /go to page/i });
      fireEvent.click(dots[1]);

      expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
        left: 375,
        behavior: 'smooth'
      });
    });

    it('should scroll to first page when first dot is clicked', () => {
      const { container } = render(<LinksCarousel>{createItems(12)}</LinksCarousel>);

      const scrollContainer = container.querySelector('.overflow-x-auto');
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 400, configurable: true });
      scrollContainer.scrollTo = jest.fn();

      const dots = screen.getAllByRole('button', { name: /go to page/i });
      fireEvent.click(dots[0]);

      expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
        left: 0,
        behavior: 'smooth'
      });
    });
  });
});
