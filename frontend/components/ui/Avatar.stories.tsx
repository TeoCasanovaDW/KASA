import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Avatar from "@/components/ui/Avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: {
    src: "/images/about_01.png",
    size: 48,
    alt: "Photo de profil",
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {};

export const Fallback: Story = {
  args: { src: null },
};

export const Small: Story = {
  args: { size: 32 },
};

export const Large: Story = {
  args: { size: 80 },
};

export const RoundedLarge: Story = {
  args: { size: 80, rounded: "rounded-lg" },
};
