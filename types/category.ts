export interface CategoryNode {
  id: string;
  vendorId: string;
  name: string;
  parentId?: string | null;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  depth: number; // 1, 2, or 3
  children?: CategoryNode[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  vendorId?: string;
  name: string;
  parentId?: string | null;
  slug?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  parentId?: string | null;
  slug?: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface TagSearchResult {
  tag: string;
  count: number;
}
