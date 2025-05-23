import CurrentStrokeIcon from "@/components/utils/CurrentStrokeIcon";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { ReactNode } from "react";

type Props = {
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: ("noreferrer" | "noopener")[];
  href?: string;
  iconEnd?: JSX.Element;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  variant: "primary" | "tertiary" | "tertiaryColor";
  size: "small" | "medium" | "large";
};

// TODO: To support dark mode
const variants = cva(
  cn(
    "focus:outline-none focus:ring-[0.1875rem]",
    "rounded-[0.5rem]",
    "font-medium",
    "text-pretty text-[1rem] text-start leading-[1.5rem] text-paragraph",
    "data-[disabled=true]:pointer-events-none",
    "transition-transform active:translate-y-[0.0625rem]",
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "focus:ring-brand-600/40",
          "border border-brand-600 hover:border-brand-700 data-[disabled=true]:border-brand-200",
          "bg-brand-600 hover:bg-brand-700 focus:bg-brand-600 data-[disabled=true]:bg-brand-200",
          "text-white-force_white data-[disabled=true]:text-white-text_only-disabled",
          "shadow-button",
        ),
        tertiary: cn(
          "focus:ring-brand-600/40",
          "hover:bg-gray-focus_washed-100 focus:bg-white-force_white",
          "text-black-700 data-[disabled=true]:text-gray-text_only-disabled",
        ),
        tertiaryColor: cn(
          "focus:ring-brand-600/40",
          "hover:bg-brand-50 focus:bg-white-force_white",
          "text-brand-600 data-[disabled=true]:text-brand-text_only-disabled",
        ),
      },
      size: {
        small: cn(
          "px-[0.623rem] py-[0.375rem]",
          "text-[0.875rem] leading-[1.25rem]",
        ),
        medium: cn("px-[0.75rem] py-[0.5rem]", "text-[1rem] leading-[1.5rem]"),
        large: cn(
          "px-[0.875rem] py-[0.625rem]",
          "text-[1rem] leading-[1.5rem]",
        ),
      },
    },
  },
);

export default function ButtonB(props: Props) {
  const commonProps = {
    ["disabled"]: props.disabled,
    ["data-disabled"]: props.disabled,
    ["className"]: cn(
      variants({
        variant: props.variant,
        size: props.size,
      }),
      props.className,
    ),
  };

  const body = (
    <div
      className={cn(
        "h-full",
        "flex flex-row flex-nowrap items-center",
        "gap-x-[0.5rem]",
      )}
    >
      {props.children}
      {props.iconEnd && <CurrentStrokeIcon icon={props.iconEnd} />}
    </div>
  );

  return props.href ? (
    <a
      href={props.href}
      rel={props.rel && props.rel.join(" ")}
      target={props.target}
      {...commonProps}
    >
      {body}
    </a>
  ) : (
    <button {...commonProps}>{body}</button>
  );
}
