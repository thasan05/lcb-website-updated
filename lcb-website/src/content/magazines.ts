export interface Magazine {
  id: string;
  title: string;
  fileUrl: string;
  coverUrl?: string;
  fileSize?: number;
  uploadedAt: string;
  published: boolean;
}
