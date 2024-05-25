import { InputHTMLAttributes } from "react";
import InputMask from "react-input-mask";

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  width?: string;
}

export const FormInput = ({ label, width, ...props }: FormCheckboxProps) => {
  const _props = { ...props };

  if (props.type?.trim() == "phone-number") {
    _props.type = "text";
  }

  return (
    <div className="input-box" style={{ flexBasis: width }}>
      {props.type?.trim() == "phone-number" ? (
        <InputMask mask="+38 (999) 999-99-99" maskChar="_" {..._props} />
      ) : (
        <input {..._props} />
      )}
      <label htmlFor={props.id}>{label}</label>
    </div>
  );
};
