import React, { useState, useRef, useEffect, useMemo } from 'react';

interface VirtualizedTableProps<T> {
  items: T[];
  rowHeight?: number;
  containerHeight?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
}

export function VirtualizedTable<T>({
  items,
  rowHeight = 64,
  containerHeight = 400,
  renderRow,
  keyExtractor,
  emptyMessage = 'No items found',
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * rowHeight;
  const visibleCount = Math.ceil(containerHeight / rowHeight);

  // Calculate buffer range for smooth 60fps scrolling
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 3);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 6);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      return {
        item,
        actualIndex,
        top: actualIndex * rowHeight,
      };
    });
  }, [items, startIndex, endIndex, rowHeight]);

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-muted-foreground font-mono">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: containerHeight }}
      className="overflow-y-auto relative w-full border-border/40 rounded-2xl no-scrollbar font-mono text-xs"
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        {visibleItems.map(({ item, actualIndex, top }) => (
          <div
            key={keyExtractor(item, actualIndex)}
            style={{
              position: 'absolute',
              top: `${top}px`,
              left: 0,
              right: 0,
              height: `${rowHeight}px`,
            }}
          >
            {renderRow(item, actualIndex)}
          </div>
        ))}
      </div>
    </div>
  );
}
