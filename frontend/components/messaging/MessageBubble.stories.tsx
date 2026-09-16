import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import MessageBubble from "@/components/messaging/MessageBubble";
import type { ThreadMessage } from "@/types/message";

const message: ThreadMessage = {
  id: 1,
  sender_id: 2,
  recipient_id: 1,
  body: "Bonjour, le logement est-il disponible le week-end prochain ?",
  created_at: "2025-09-03T11:04:00Z",
  read_at: null,
};

const meta = {
  title: "Messaging/MessageBubble",
  component: MessageBubble,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    message,
    participantName: "Nathalie Jean",
    picture: "/images/about_01.png",
    isOwn: false,
  },
} satisfies Meta<typeof MessageBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Received: Story = {};

export const Own: Story = {
  args: { isOwn: true, participantName: "Vous" },
};

export const LongBody: Story = {
  args: {
    message: {
      ...message,
      body: "Bonjour ! Merci pour votre accueil lors de notre dernier séjour. Nous aimerions revenir en octobre pour une semaine complète avec nos deux enfants : est-ce que le lit parapluie est toujours disponible, et pourriez-vous nous indiquer s'il est possible d'arriver après 22 heures ?",
    },
  },
};

export const WithoutPicture: Story = {
  args: { picture: null },
};
