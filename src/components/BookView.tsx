import { usePageFlip } from '@/hooks/usePageFlip';
import { mockPages } from '@/data/mockPages';
import { PageCounter } from './PageCounter';
import { NavControls } from './NavControls';
import { LayoutSwitcher } from './LayoutSwitcher';
import { PageFlipView } from './PageFlipView';
import type { PageFormat } from '@/types';

const formatOptions: { value: PageFormat; label: string }[] = [
  { value: 'book', label: 'Book' },
  { value: 'landscape', label: 'Landscape' },
];

export function BookView() {
  const {
    currentPage,
    isAnimating,
    pageFormat,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    registerFlipMethods,
    handleFlip,
    handleChangeState,
    switchFormat,
    consumePendingRestore,
    isRestorePending,
  } = usePageFlip(mockPages.length);

  const page = mockPages[currentPage];

  const maxWidthClass = pageFormat === 'landscape' ? 'max-w-2xl' : 'max-w-md';

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-stone-200 via-stone-100 to-stone-200 px-4 py-6">
      {/* Format toggle */}
      <div className="flex w-full flex-col items-center gap-2">
        <LayoutSwitcher
          mode={pageFormat}
          options={formatOptions}
          onSwitch={switchFormat}
          disabled={isAnimating}
        />
      </div>

      {/* Book area */}
      <div className={`flex w-full ${maxWidthClass} flex-1 items-center justify-center`}>
        <div
          className="relative w-full"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          <PageFlipView
            key={pageFormat}
            pages={mockPages}
            pageFormat={pageFormat}
            onFlip={handleFlip}
            onChangeState={handleChangeState}
            registerFlipMethods={registerFlipMethods}
            consumePendingRestore={consumePendingRestore}
            isRestorePending={isRestorePending}
          />
        </div>
      </div>

      {/* Controls */}
      <div className={`flex w-full ${maxWidthClass} flex-col items-center gap-4 pt-4`}>
        <NavControls
          onPrev={goPrev}
          onNext={goNext}
          canPrev={canGoPrev}
          canNext={canGoNext}
        />
        <PageCounter current={page.pageNumber} total={mockPages.length} />
      </div>
    </div>
  );
}
