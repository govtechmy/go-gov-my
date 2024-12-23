import { Footer, Nav } from '@dub/ui';
import Providers from '../(auth)/providers';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function StatsLayout(props: Props) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-gray-50">
      <Providers>
        <Nav />
        {props.children}
        <Footer />
      </Providers>
    </div>
  );
}
