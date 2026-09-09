import type {PropsWithChildren} from "react";
import s from './FormContainer.module.css'

export const FormContainer = ({children}: PropsWithChildren) => {
    return (
        <div className={s.form_container}>
            {children}
        </div>
    );
};