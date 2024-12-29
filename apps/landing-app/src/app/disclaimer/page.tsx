import { getTranslations } from 'next-intl/server';
import React from 'react';

export default async function DisclaimerPage() {
  const t = await getTranslations();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {t('pages.Disclaimer.title')}
      </h1>
      <div className="prose max-w-none">
        {t.rich('pages.Disclaimer.content')}
      </div>
    </main>
  );
} 