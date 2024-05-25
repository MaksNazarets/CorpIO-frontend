import { InputHTMLAttributes } from "react";

interface FormTextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  value: string;
  width?: string;
  rows?: number;
}

export const FormTextArea = ({
  label,
  width,
  rows,
  ...props
}: FormTextAreaProps) => {
  const _props = { ...props };

  return (
    <div className="input-box" style={{ flexBasis: width }}>
      <textarea {..._props} rows={rows}></textarea>

      <label htmlFor={props.id}>{label}</label>
    </div>
  );
};
