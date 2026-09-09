import type {ButtonHTMLAttributes} from "react";
import s from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    text: string;
}

export const Button = ({text, ...props}: ButtonProps) => {
    return (
        <button className={s.button} {...props}>{text}</button>
    );
};
