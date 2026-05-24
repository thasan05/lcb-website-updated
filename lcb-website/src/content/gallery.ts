import storyGalleryData from "./data/story-gallery.json";


export type GalleryItem = {
  id: string;
  src: string;
  srcs?: string[];
  alt: string;
  caption?: string;
  span?: "tall" | "wide" | "square" | "feature";
};

export const gallery = storyGalleryData as GalleryItem[];
