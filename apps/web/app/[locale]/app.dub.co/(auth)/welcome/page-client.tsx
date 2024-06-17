"use client";

import { useAddWorkspaceModal } from "@/ui/modals/add-workspace-modal";
import Interim from "@/ui/welcome/interim";
import Intro from "@/ui/welcome/intro";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePageClient() {
  const { setShowAddWorkspaceModal, AddWorkspaceModal } =
    useAddWorkspaceModal();

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get("type") === "workspace") {
      setTimeout(() => {
        setShowAddWorkspaceModal(true);
      }, 200);
    } else {
      setShowAddWorkspaceModal(false);
    }
  }, [searchParams, setShowAddWorkspaceModal]);

  return (
    <div className="flex h-screen flex-col items-center">
      <AddWorkspaceModal />
      <AnimatePresence mode="wait">
        {!searchParams?.get("type") && <Intro key="intro" />}
        {searchParams?.get("type") === "interim" && (
          <>
            <button
              className="group fixed left-10 top-10 z-[99] rounded-full p-2 transition-all hover:bg-gray-100"
              onClick={() => router.back()}
            >
              <ArrowLeft
                size={20}
                className="text-gray-500 group-hover:text-gray-700 group-active:scale-90"
              />
            </button>
            <Interim key="interim" />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
