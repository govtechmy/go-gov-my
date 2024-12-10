type Props = {
  className?: string;
};

export default function IconLinkFill(props: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <path
        d="M7.33605 10.6639L5.12012 12.8799C3.58704 14.413 3.6872 16.9987 5.34383 18.6554C7.00046 20.312 9.58623 20.4121 11.1193 18.8791L13.3352 16.6631M8.67171 15.3275L15.3275 8.67172M16.6631 13.3353L18.879 11.1193C20.4121 9.58625 20.312 7.00048 18.6553 5.34385C16.9987 3.68722 14.4129 3.58706 12.8799 5.12014L10.6639 7.33607"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
