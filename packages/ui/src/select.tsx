"use client";

import { ChevronDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { IconMenu } from "./icon-menu";
import CheckCircle from "./icons/check-circle";
import { Popover } from "./popover";

type Option = {
  label: string;
  full: string;
  value: string;
};

type CustomSelectProps = {
  icon: ReactNode;
  options: Option[];
  onChange: (newValue: Option) => void;
  defaultValue: number;
};

export function CustomSelect({
  icon,
  options,
  onChange,
  defaultValue,
}: CustomSelectProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[defaultValue]);

  const onItemClick = (option: Option) => {
    let newValue;
    newValue = option;
    setSelectedOption(newValue);
    onChange(newValue);
    setShowMenu(false);
  };

  const isSelected = (option: Option) => {
    if (!selectedOption) {
      return false;
    }
    return selectedOption.value === option.value;
  };

  return (
    <Popover
      content={
        <div className="w-full p-2 md:w-48">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onItemClick(option)}
              className="flex w-full items-center justify-between space-x-2 rounded-md px-1 py-2 hover:bg-gray-100 active:bg-gray-200"
            >
              <IconMenu text={option.full} icon={null} />
              {isSelected(option) && (
                <CheckCircle className="text-blue-600" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      }
      openPopover={showMenu}
      setOpenPopover={setShowMenu}
    >
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        className="flex w-fit items-center justify-between space-x-2 rounded-md bg-white px-3 py-2.5 shadow transition-all duration-75 hover:shadow-md"
      >
        <IconMenu text={selectedOption.label} icon={icon} />
        <ChevronDown
          className={`h-5 w-5 text-gray-400 ${
            showMenu ? "rotate-180 transform" : ""
          } transition-all duration-75`}
        />
      </button>
    </Popover>
  );
}
