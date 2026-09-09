import { type InputHTMLAttributes } from "react";
import s from "./Input.module.css";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon: React.ReactNode;
}

export const Input = ({ label, icon, id, ...props }: InputProps) => {
    return (
        <div className={s.inputWrapper}>
            <label htmlFor={id} className={s.label}>
                {label}
            </label>

            <div className={s.inputContainer}>
                <div className={s.iconWrapper}>
                    {icon}
                </div>

                <input
                    id={id}
                    {...props}
                    className={s.inputField}
                />
            </div>
        </div>
    );
}
