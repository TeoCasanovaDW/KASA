// Mirrors GET /api/properties (Property) and GET /api/properties/:id (PropertyDetail).

export type PropertyHost = {
  id: number;
  name: string;
  picture: string | null;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover: string | null;
  location: string | null;
  price_per_night: number;
  rating_avg: number;
  ratings_count: number;
  // The backend omits the key entirely when `host_id` is null.
  host?: PropertyHost;
};

export type PropertyDetail = Property & {
  pictures: string[];
  equipments: string[];
  tags: string[];
};
