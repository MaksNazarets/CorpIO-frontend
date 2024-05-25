import { InputHTMLAttributes } from "react";

export const SearchInput = (props: InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <div className="sidebar-search-container">
      <input className="sidebar-search" {...props}  type="search" />
    </div>
  );
};
