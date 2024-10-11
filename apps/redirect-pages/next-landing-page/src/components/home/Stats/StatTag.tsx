import Tag from "@/components/Tag";

export default function StatTag(props: { icon: JSX.Element; text: string }) {
  return (
    <Tag variant="primary" size="small" iconStart={props.icon}>
      {props.text}
    </Tag>
  );
}
