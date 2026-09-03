export type PageType = 'text' | 'photo' | 'mixed';
export type PageFormat = 'book' | 'landscape';
export type FlipState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';

export interface Page {
  pageNumber: number;
  type: PageType;
  content: string;
  imageUrl?: string;
  caption?: string;
}
