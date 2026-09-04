import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ThreadList from "@/components/messaging/ThreadList";
import { ApiError } from "@/lib/api-client";
import { getThreads } from "@/lib/messages-api";
import { getSessionUser } from "@/lib/session";
import type { ThreadSummary } from "@/types/message";

export const metadata: Metadata = {
  title: "Messagerie",
};

export default async function MessageriePage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/connexion");
  }

  let threads: ThreadSummary[] = [];
  let loadFailed = false;

  try {
    threads = await getThreads();
  } catch (error) {
    if (error instanceof ApiError) {
      loadFailed = true;
    } else {
      throw error;
    }
  }

  return (
    <>
      <div className="flex w-full flex-col border-kasa-gray-light lg:w-[370px] lg:flex-none lg:border-r">
        {loadFailed ? (
          <p className="p-6 text-sm text-kasa-gray-dark">
            La messagerie est indisponible. Réessayez plus tard.
          </p>
        ) : (
          <ThreadList threads={threads} />
        )}
      </div>

      <div className="hidden flex-1 items-center justify-center bg-kasa-light-orange lg:flex">
        <p className="text-sm text-kasa-gray-dark">
          Sélectionnez une conversation.
        </p>
      </div>
    </>
  );
}
