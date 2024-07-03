import React, { MutableRefObject, useEffect, useRef, useState } from "react";

type Option = {
    label: string,
    value: string
}
type CustomSelectProps= {
    options: Option[],
    onChange: (newValue: Option)=> void,
    defaultValue: number
}

const Icon = ({ isOpen }: { isOpen: Boolean }) => {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="#222" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" className={isOpen ? 'ease-in-out duration-300 rotate-180 translate' : ''}>
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );
};

const Tick= () => {
    return <div className="text-blue-500 m-1"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" className="text-primary dark:text-primary-dark h-4 w-4"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"></path></svg></div>
}

export function CustomSelect({ options, onChange, defaultValue }: CustomSelectProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedValue, setSelectedValue] = useState(options[defaultValue]);
    const inputRef = useRef() as MutableRefObject<HTMLDivElement> 

    useEffect(() => {
        const handler = (e: { target: any; }) => {
            if (inputRef.current && !inputRef.current?.contains(e.target)) {
                setShowMenu(false);
            }
        };

        window.addEventListener("click", handler);
        return () => {
            window.removeEventListener("click", handler);
        };
    });

    const handleInputClick = () => {
        setShowMenu(!showMenu);
    };

    const getDisplay = () => {
        return selectedValue.label;
    };

    const onItemClick = (option: Option) => {
        let newValue;
        newValue = option;
        setSelectedValue(newValue);
        onChange(newValue);
    };

    const isSelected = (option: Option) => {
        if (!selectedValue) {
            return false;
        }

        return selectedValue.value === option.value;
    };

    const getOptions = () => {
        return options;
    };

    return (
        <div className="text-left border-1 relative rounded cursor-pointer w-max w-[-moz-max-content] w-[-webkit-max-content] ease-in-out duration-300 ">

            <div ref={inputRef} onClick={handleInputClick} className="shadow-button flex items-center gap-1.5 rounded-md px-3 py-1.5 text-start text-sm font-medium text-black dark:text-white active:bg-washed hover:dark:bg-washed-dark/50 active:dark:bg-washed-dark select-none bg-white dark:bg-black border-outline dark:border-washed-dark hover:border-outlineHover hover:dark:border-outlineHover-dark border outline-none w-fit">
                <div className={`dropdown-selected-value`}>{getDisplay()}</div>
                <div>
                    <div>
                        <Icon isOpen={showMenu} />
                    </div>
                </div>
            </div>

            {
                showMenu && (
                    <div className={`w-max border-2 border-[#dbdbdb] mt-1 rounded-lg overflow-auto bg-white z-[99] max-h-[312px] min-h-[50px]`}>
                        {
                            getOptions().map((option) => (
                                <div onClick={() => onItemClick(option)} key={option?.value} className={`hover:bg-[#F1F5F9] p-2 flex flex-row text-black ${isSelected(option) && "font-semibold"}`} >
                                    {option?.label} {isSelected(option) && <Tick/>}
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
}