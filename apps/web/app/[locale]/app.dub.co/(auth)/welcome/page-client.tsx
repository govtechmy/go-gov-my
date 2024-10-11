'use client';

import { useAddWorkspaceModal } from '@/ui/modals/add-workspace-modal';
import Intro from '@/ui/welcome/intro';
import { AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function WelcomePageClient() {
  const { setShowAddWorkspaceModal, AddWorkspaceModal } =
    useAddWorkspaceModal();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams?.get('type') === 'workspace') {
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
        {!searchParams?.get('type') && <Intro key="intro" />}
      </AnimatePresence>
    </div>
  );
}
