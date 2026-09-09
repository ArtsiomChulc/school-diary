import type {PropsWithChildren} from "react";
import s from './MainContainer.module.css'

export const MainContainer = ({children}: PropsWithChildren) => {
    return (
        <div className={s.main_container}>
            {children}
        </div>
    );
};