import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import { FavoritesProvider } from "@/components/favorites/FavoritesProvider";
import PropertyCard from "@/components/property/PropertyCard";
import type { Property } from "@/types/property";

const property: Property = {
  id: "c67ab8a7",
  slug: "appartement-cosy-c67ab8a7",
  title: "Appartement cosy",
  description: "Votre maison loin de chez vous.",
  cover: "/images/about_01.png",
  location: "Ile de France - Paris 17e",
  price_per_night: 120,
  rating_avg: 4.5,
  ratings_count: 12,
  host: { id: 1, name: "Nathalie Jean", picture: null },
};

const meta = {
  title: "Property/PropertyCard",
  component: PropertyCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xs">
        <Story />
      </div>
    ),
  ],
  args: { property },
} satisfies Meta<typeof PropertyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCover: Story = {
  args: { property: { ...property, cover: null } },
};

export const LongTitleAndLocation: Story = {
  args: {
    property: {
      ...property,
      title:
        "Magnifique maison d'architecte avec piscine chauffée, grand jardin arboré et vue imprenable sur la vallée",
      location:
        "Provence-Alpes-Côte d'Azur - Saint-Rémy-de-Provence, à deux pas du centre historique",
    },
  },
};

export const WithFavoriteControl: Story = {
  decorators: [
    (Story) => (
      <FavoritesProvider>
        <Story />
      </FavoritesProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "The real `FavoriteButton` in a guest-mode `FavoritesProvider`: toggling it only writes this Storybook's own `localStorage`.",
      },
    },
  },
  args: {
    favoriteControl: <FavoriteButton propertyId={property.id} />,
  },
};
