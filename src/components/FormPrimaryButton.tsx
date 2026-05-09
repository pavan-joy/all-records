import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "pill";
};

export default function FormPrimaryButton({
  variant = "default",
  className = "",
  children,
  type = "submit",
  ...props
}: Props) {
  const pill = variant === "pill" ? "form-submit-btn--pill" : "";
  return (
    <button type={type} className={`form-submit-btn ${pill} ${className}`.trim()} {...props}>
      <span className="form-submit-btn-inner">{children}</span>
    </button>
  );
}
