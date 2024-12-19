"use client";

import BorderedSection from "@/components/BorderedSection";
import Heading from "@/components/Heading";
import { cn } from "@/lib/utils";
import Rive from "@rive-app/react-canvas";
import { ReactNode } from "react";

type Props = {
  title: string;
  description: ReactNode;
  items: SectionItem[];
  className?: string;
};

type SectionItem = {
  tag: string;
  title: string;
  img: {
    svg: string;
    webp?: string;
    alt: string;
  };
  animation: {
    src: string;
    stateMachines: string;
    artboard: string;
  };
};

export default function Preview(props: Props) {
  return (
    <BorderedSection
      className={cn(
        "md:max-lg:mx-auto",
        "md:max-lg:max-w-[37.5rem]",
        "py-[5.25rem] md:max-lg:px-0",
        "grid grid-cols-2 lg:grid-cols-12",
        props.className,
      )}
    >
      <div
        className={cn(
          "col-span-full lg:col-start-4 lg:col-end-10",
          "gap-y-[1.125rem]",
          "flex flex-col items-center",
        )}
      >
        <Heading level={2} className="w-full text-center">
          {props.title}
        </Heading>
        <div className="w-full text-center">{props.description}</div>
      </div>
      <div
        className={cn(
          "lg:mx-auto",
          "lg:max-w-[52.875rem]",
          "col-span-full",
          "mt-[4rem]",
          "grid grid-cols-1 md:grid-cols-2",
          "gap-[1.5rem]",
        )}
      >
        {props.items.map((item, i) => (
          <Card key={i} item={item} />
        ))}
      </div>
    </BorderedSection>
  );
}

function Card(props: { item: SectionItem }) {
  const { item } = props;

  return (
    <div
      className={cn(
        "col-span-1",
        "border border-washed-100",
        "rounded-[0.75rem]",
        "flex flex-col justify-start",
      )}
    >
      <Rive
        src={item.animation.src}
        stateMachines={item.animation.stateMachines}
        artboard={item.animation.artboard}
        className="h-[20.9375rem] min-w-full md:h-[18.5625rem] lg:h-[14.5rem]"
      />
      {/* <picture
            className={cn("max-w-full lg:h-[14.5rem] lg:w-[23.4375rem]")}
          >
            <source srcSet={item.img.webp} type="image/webp" />
            <source srcSet={item.img.svg} type="image/svg+xml" />
            <img src={item.img.svg} alt={item.img.alt} />
          </picture> 
      */}
      <div
        className={cn(
          "mt-[1.25rem]",
          "border-t border-washed-100",
          "px-[1.125rem] py-[1.125rem]",
          "flex flex-col",
        )}
      >
        <div
          className={cn(
            "w-fit",
            "bg-washed-100",
            "px-[0.5rem] py-[0.125rem]",
            "rounded-full text-[0.75rem] font-medium uppercase leading-[1.125rem]",
          )}
        >
          {item.tag}
        </div>
        <div className="mt-[0.6875rem] text-[1.125rem] font-medium leading-[1.625rem]">
          {item.title}
        </div>
      </div>
    </div>
  );
}
