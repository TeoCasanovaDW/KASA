import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PriceCard from "@/components/property/PriceCard";

const meta = {
  title: "Property/PriceCard",
  component: PriceCard,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PriceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Typical: Story = {
  args: { pricePerNight: 120 },
};

export const HighPrice: Story = {
  args: { pricePerNight: 1249999 },
};
