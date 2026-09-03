import { useState, useCallback, useRef } from 'react';
import type { PageFormat, FlipState } from '@/types';

const FLIP_TIMEOUT = 2000;

export function usePageFlip(totalPages: number) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pageFormat, setPageFormat] = useState<PageFormat>('book');

  const flipStateRef = useRef<FlipState>('read');
  const pendingRestoreRef = useRef<number | null>(null);
  const unlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goNextRef = useRef<(() => void) | null>(null);
  const goPrevRef = useRef<(() => void) | null>(null);

  const canGoNext = !isAnimating && currentPage < totalPages - 1;
  const canGoPrev = !isAnimating && currentPage > 0;

  const goNext = useCallback(() => {
    if (flipStateRef.current !== 'read') return;
    if (!goNextRef.current) return;
    flipStateRef.current = 'flipping';
    setIsAnimating(true);
    goNextRef.current();
  }, []);

  const goPrev = useCallback(() => {
    if (flipStateRef.current !== 'read') return;
    if (!goPrevRef.current) return;
    flipStateRef.current = 'flipping';
    setIsAnimating(true);
    goPrevRef.current();
  }, []);

  const registerFlipMethods = useCallback(
    (next: (() => void) | null, prev: (() => void) | null) => {
      goNextRef.current = next;
      goPrevRef.current = prev;
    },
    [],
  );

  const handleFlip = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, []);

  const handleChangeState = useCallback((state: FlipState) => {
    flipStateRef.current = state;
    if (state === 'read') {
      if (unlockTimerRef.current) {
        clearTimeout(unlockTimerRef.current);
        unlockTimerRef.current = null;
      }
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      if (unlockTimerRef.current) clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = setTimeout(() => {
        flipStateRef.current = 'read';
        setIsAnimating(false);
        unlockTimerRef.current = null;
      }, FLIP_TIMEOUT);
    }
  }, []);

  const switchFormat = useCallback(
    (format: PageFormat) => {
      if (flipStateRef.current !== 'read') return;
      pendingRestoreRef.current = currentPage;
      setPageFormat(format);
    },
    [currentPage],
  );

  const consumePendingRestore = useCallback(() => {
    const restore = pendingRestoreRef.current;
    pendingRestoreRef.current = null;
    return restore;
  }, []);

  const isRestorePending = useCallback(() => pendingRestoreRef.current !== null, []);

  return {
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
  };
}
