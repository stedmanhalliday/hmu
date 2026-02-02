import { useRef, useState, useCallback } from 'react';

const ITEMS_PER_PAGE = 8;

/**
 * Chunk an array into pages of specified size.
 */
function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Carousel component for displaying links in paginated pages.
 * Uses CSS scroll-snap for native swipe behavior.
 */
export default function LinksCarousel({ children }) {
    const scrollRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(0);

    // Convert children to array and chunk into pages
    const items = Array.isArray(children) ? children : [children];
    const pages = chunkArray(items, ITEMS_PER_PAGE);

    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;

        const { scrollLeft, clientWidth } = scrollRef.current;
        const newPage = Math.round(scrollLeft / clientWidth);
        setCurrentPage(newPage);
    }, []);

    const goToPage = useCallback((pageIndex) => {
        if (!scrollRef.current) return;

        const { clientWidth } = scrollRef.current;
        scrollRef.current.scrollTo({
            left: pageIndex * clientWidth,
            behavior: 'smooth'
        });
    }, []);

    return (
        <div className="relative w-full">
            {/* Scrollable container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            >
                {pages.map((pageItems, pageIndex) => (
                    <div
                        key={pageIndex}
                        className="flex-shrink-0 w-full snap-start"
                    >
                        <div className="flex flex-wrap justify-center">
                            {pageItems}
                        </div>
                    </div>
                ))}
            </div>

            {/* Page indicator dots */}
            {pages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {pages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentPage
                                    ? 'bg-black/60'
                                    : 'bg-black/20'
                            }`}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export { ITEMS_PER_PAGE };
