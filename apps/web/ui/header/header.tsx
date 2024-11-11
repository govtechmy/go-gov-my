'use client';

import IdentifyWebsite from './identify-website';
import { useState } from 'react';
import { cn } from './cn';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        'w-full bg-[#F4F4F5]',
        isOpen && [
          'shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]',
          'bg-gradient-to-b from-[#F4F4F5] from-[84.74%] to-[#E4E4E7] to-100%',
        ]
      )}
    >
      <div className="mx-auto max-w-7xl">
        <IdentifyWebsite onOpenChange={setIsOpen} isOpen={isOpen} />
      </div>
    </div>
  );
};

export default Header;
