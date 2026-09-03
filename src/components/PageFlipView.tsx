import { useRef, useEffect, useCallback, forwardRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import 'page-flip/src/Style/stPageFlip.css';
import { PageContent } from './PageContent';
import type { Page, PageFormat, FlipState } from '@/types';

interface PageFlipViewProps {
  pages: Page[];
  pageFormat: PageFormat;
  onFlip: (pageIndex: number) => void;
  onChangeState: (state: FlipState) => void;
  registerFlipMethods: (
    next: (() => void) | null,
    prev: (() => void) | null,
  ) => void;
  consumePendingRestore: () => number | null;
  isRestorePending: () => boolean;
}

// react-pageflip ships its own types but the ref API is typed as `any`.
// The actual ref exposes pageFlip() which returns the PageFlip instance.
interface FlipBookRef {
  pageFlip: () => {
    flipNext: (corner: 'top' | 'bottom') => void;
    flipPrev: (corner: 'top' | 'bottom') => void;
    turnToPage: (pageNum: number) => void;
    getCurrentPageIndex: () => number;
  };
}

const PageWrapper = forwardRef<HTMLDivElement, { page: Page; format: PageFormat }>(
  ({ page, format }, ref) => (
    <div ref={ref} className="overflow-hidden bg-[#fdfbf7]">
      <PageContent page={page} format={format} />
    </div>
  ),
);
PageWrapper.displayName = 'PageWrapper';

export function PageFlipView({
  pages,
  pageFormat,
  onFlip,
  onChangeState,
  registerFlipMethods,
  consumePendingRestore,
  isRestorePending,
}: PageFlipViewProps) {
  const bookRef = useRef<FlipBookRef | null>(null);

  const dims =
    pageFormat === 'landscape'
      ? { width: 500, height: 375, minWidth: 280, minHeight: 210 }
      : { width: 300, height: 500, minWidth: 240, minHeight: 400 };

  const handleFlipNext = useCallback(() => {
    bookRef.current?.pageFlip().flipNext('top');
  }, []);

  const handleFlipPrev = useCallback(() => {
    bookRef.current?.pageFlip().flipPrev('top');
  }, []);

  useEffect(() => {
    registerFlipMethods(handleFlipNext, handleFlipPrev);
    return () => registerFlipMethods(null, null);
  }, [registerFlipMethods, handleFlipNext, handleFlipPrev]);

  const handleInit = useCallback(() => {
    if (!isRestorePending()) return;
    const restore = consumePendingRestore();
    if (restore !== null && restore > 0) {
      const pf = bookRef.current?.pageFlip();
      if (pf) {
        pf.turnToPage(restore);
        onFlip(restore);
      }
    }
  }, [isRestorePending, consumePendingRestore, onFlip]);

  return (
    <HTMLFlipBook
      ref={bookRef as never}
      width={dims.width}
      height={dims.height}
      size="stretch"
      minWidth={dims.minWidth}
      maxWidth={dims.width + 200}
      minHeight={dims.minHeight}
      maxHeight={dims.height + 100}
      startPage={0}
      drawShadow
      flippingTime={700}
      usePortrait
      startZIndex={0}
      autoSize={false}
      maxShadowOpacity={0.5}
      showCover
      mobileScrollSupport
      clickEventForward
      useMouseEvents
      swipeDistance={30}
      showPageCorners
      disableFlipByClick={false}
      className="mx-auto w-full max-w-full"
      style={{ width: '100%', maxWidth: '100%' }}
      onFlip={(e: { data: number }) => onFlip(e.data)}
      onChangeState={(e: { data: FlipState }) => onChangeState(e.data)}
      onInit={handleInit}
    >
      {pages.map((page) => (
        <PageWrapper key={page.pageNumber} page={page} format={pageFormat} />
      ))}
    </HTMLFlipBook>
  );
}
