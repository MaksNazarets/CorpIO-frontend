import { InputHTMLAttributes } from "react";

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const FormCheckbox = ({ label, ...props }: FormCheckboxProps) => {
  return (
    <div className="custom-checkbox">
    <input type="checkbox" {...props} />
    <label htmlFor={props.id}>
      {label}
    </label>
  </div>
  )
}