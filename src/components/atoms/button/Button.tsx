import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import s from "./Button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const Button = ({
  children,
  ...props
}: ButtonProps) => {
  return (
    <button className={s.button} {...props}>
      {children}
    </button>
  );
};
