import React from 'react';
import Link from 'next/link';
import Heading from '../Heading';

type Props = {
  header: string;
  disclaimer: {
    title: string;
    description: string;
  };
  lastUpdate: string;
};

export default function DisclaimerContent(props: Props) {
  return (
    <div className="flex w-full flex-col min-h-[70vh]">
      <div className="container flex w-full flex-col gap-3 py-8 lg:gap-4 xl:px-0">
        <div className="flex flex-col gap-8">
          <Heading level={1} className="text-3xl font-semibold text-center">{props.header}</Heading>
          
          {/* Your Disclaimer Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{props.disclaimer.title}</h2>
            <p className="text-gray-600">{props.disclaimer.description}</p>
          </section>

          {/* Last Update */}
          <p className="text-sm text-gray-500">{props.lastUpdate}</p>
        </div>
      </div>
    </div>
  );
} 