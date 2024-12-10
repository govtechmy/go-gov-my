'use client';

import { ReactNode, useState } from 'react';
import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './radix';
import { cn } from '@/lib/utils';
import { cva } from 'class-variance-authority';
import ChevronDownB from '@/icons/chevron-down-b';
import CurrentStrokeIcon from '../utils/CurrentStrokeIcon';

type Props = {
  items: Item[];
  children: ReactNode;
  iconEnd?: JSX.Element;
  className?: string;
  onSelection?: (item: Item) => void;
};

type Checked = DropdownMenuCheckboxItemProps['checked'];

export type Item = {
  id: string;
  label: string;
};

export function Dropdown(props: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  function onClick(item: Item) {
    setSelected(item.id);
    props.onSelection?.(item);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(triggerVariants(), props.className)}>
          {props.children}
          <div className="ml-[0.5rem]">
            <CurrentStrokeIcon icon={props.iconEnd || <ChevronDownB />} />
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn(contentVariants(), props.className)}>
        {props.items.map((item: Item) => (
          <Option key={item.id} checked={selected === item.id} onClick={() => onClick(item)}>
            {item.label}
          </Option>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Option(props: { children: React.ReactNode; checked: Checked; onClick?: () => void }) {
  return (
    <DropdownMenuCheckboxItem
      checked={props.checked} // for accessibility purposes
      onSelect={() => props.onClick?.()}
    >
      <button
        className={cn(
          optionButtonVariants({
            state: props.checked ? 'selected' : 'default',
          })
        )}
      >
        {props.children}
      </button>
    </DropdownMenuCheckboxItem>
  );
}

const buttonVariants = cva(
  cn('px-[0.625rem] py-[0.375rem]', 'text-control_sm text-black-900 ', 'select-none')
);

const triggerVariants = cva(
  cn(
    buttonVariants(),
    'shadow-button',
    'rounded-[0.5rem] border border-outline-200',
    'hover:bg-background-50',
    'flex flex-row items-center',
    'font-medium'
  )
);

const contentVariants = cva(
  cn('mt-[0.25rem]', 'rounded-[0.5rem]', 'flex flex-col justify-stretch', 'bg-white-background-0')
);

const optionButtonVariants = cva(
  cn(
    buttonVariants(),
    'w-full',
    'align-stretch flex flex-col',
    'hover:bg-washed-100',
    'px-[0.625rem] py-[0.375rem]'
  ),
  {
    variants: {
      state: {
        default: '',
        selected: cn('bg-outline-200', 'text-black-900'),
      },
    },
  }
);
