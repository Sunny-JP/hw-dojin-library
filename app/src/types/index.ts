// Define shared types here
export type Doujinshi = {
  id: string;
  title: string;
  circle: string | null;
  authors: string[];
  genres: string[];
  publishedDate: string | null; // Keep as string or Date? Match DB return
  thumbnailUrl: string | null;
  createdAt?: Date; // Optional on client-side
  updatedAt?: Date; // Optional on client-side
};

// You can add other shared types here as needed