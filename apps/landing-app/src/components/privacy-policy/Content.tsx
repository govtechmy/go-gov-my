import React from 'react';
import Link from 'next/link';

type Props = {
  header: string;
  yourPrivacy: {
    title: string;
    description: string;
  };
  collectedInfo: {
    title: string;
    description: string;
  };
  policyChange: {
    title: string;
    description: string;
  };
  personalData: {
    title: string;
    act: {
      title: string;
      description: string;
    };
  };
  lastUpdate: string;
};

export default function Content(props: Props) {
  return (
    <div className="flex w-full flex-col">
      <div className="container flex w-full flex-col gap-3 py-8 lg:gap-4 xl:px-0">
        <div className="flex flex-col gap-8">
          <h1 className="text-3xl font-bold">{props.header}</h1>
          
          {/* Your Privacy Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{props.yourPrivacy.title}</h2>
            <p className="text-gray-600">{props.yourPrivacy.description}</p>
          </section>

          {/* Information Collected Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{props.collectedInfo.title}</h2>
            <p className="whitespace-pre-line text-gray-600">{props.collectedInfo.description}</p>
          </section>

          {/* Policy Change Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{props.policyChange.title}</h2>
            <p className="text-gray-600">{props.policyChange.description}</p>
          </section>

          {/* Personal Data Protection Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold">{props.personalData.title}</h2>
            <h3 className="text-lg font-semibold">{props.personalData.act.title}</h3>
            <p className="whitespace-pre-line text-gray-600">
              {props.personalData.act.description.split('<a>').map((part, index, array) => {
                if (index === array.length - 1) return part;
                const [text, url] = part.split('</a>');
                return (
                  <React.Fragment key={index}>
                    {text}
                    <Link 
                      href={url} 
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {url}
                    </Link>
                  </React.Fragment>
                );
              })}
            </p>
          </section>

          {/* Last Update */}
          <p className="text-sm text-gray-500">{props.lastUpdate}</p>
        </div>
      </div>
    </div>
  );
} 