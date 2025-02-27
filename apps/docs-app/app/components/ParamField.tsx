const ParamField = ({
  name,
  type,
  children,
}: {
  name: string;
  type: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="param-field">
      <p>
        <strong>{name}</strong> <span className="type">({type})</span>
      </p>
      <div className="description">{children}</div>
    </div>
  );
};

export default ParamField;
