type Props = {
  className?: string;
};

export default function IconCursor(props: Props) {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path
        d="M9.49995 8.99995L7.89995 13.2L3.69995 3.19995L13.7 7.39995L9.49995 8.99995ZM9.49995 8.99995L12.9 12.4"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}
