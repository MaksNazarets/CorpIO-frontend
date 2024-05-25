interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  optionList: { value: string; text: string }[] | null;
  width?: string
}

export default function FormSelect({
  label,
  optionList,
  width,
  ...props
}: FormSelectProps) {
  return (
    <div className="input-box"  style={{flexBasis: width}}>
      <select {...props}>
        {optionList?.map((option) => (
          <option key={option.value} value={option.value}>{option.text}</option>
        ))}
      </select>
      <label htmlFor={props.id}>{label}</label>
    </div>
  );
}
