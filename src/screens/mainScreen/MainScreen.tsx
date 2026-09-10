import {Hamburger} from "../../components/molecules/hamburger/Hamburger.tsx";
import {NickNameIco} from "../../components/atoms/nickNameIco/NickNameIco.tsx";
import s from './MainScreen.module.css';

export const MainScreen = () => {
    return (
        <div>
            <header className={s.header}>
                <Hamburger isOpen={false} onToggle={() => {}}/>
                <NickNameIco />
            </header>
        </div>
    );
};