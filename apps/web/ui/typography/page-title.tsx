import { ReactNode } from 'react';

type PageTitleProps = {
  text: string;
};

export default function PageTitle({ text }: PageTitleProps) {
  return <h1 className="truncate text-2xl font-semibold hidden xs:block font-poppins">{text}</h1>;
}
