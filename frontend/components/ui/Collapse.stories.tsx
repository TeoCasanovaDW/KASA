import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Collapse from "@/components/ui/Collapse";

const meta = {
  title: "UI/Collapse",
  component: Collapse,
  tags: ["autodocs"],
  args: {
    title: "Description",
    children: (
      <p className="mt-3 text-sm text-kasa-gray-dark">
        Appartement lumineux au cœur de la ville, proche des commerces.
      </p>
    ),
  },
} satisfies Meta<typeof Collapse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: { defaultOpen: true },
};

export const Closed: Story = {
  args: { defaultOpen: false },
};

export const LongContent: Story = {
  args: {
    title: "Équipements",
    children: (
      <ul className="mt-3 flex flex-col gap-1 text-sm text-kasa-gray-dark">
        {[
          "Climatisation",
          "Wi-Fi",
          "Cuisine équipée",
          "Machine à laver",
          "Sèche-linge",
          "Télévision",
          "Parking privé",
          "Chauffage",
          "Draps et serviettes",
          "Balcon avec vue sur la mer et les collines environnantes",
        ].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
};
