import { Background } from '@dub/ui';
import { ReactNode } from 'react';
import Providers from './providers';

export const runtime = 'edge';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <Background />
      <div className="relative z-10 flex h-screen w-screen justify-center">{children}</div>
    </Providers>
  );
}
