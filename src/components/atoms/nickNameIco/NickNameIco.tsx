import s from './NickNameIco.module.css';
import {LogOut} from "lucide-react";
import {userStore} from "../../../store/UserStore.ts";

interface NickNameIco {
    fullName?: string;
    role?: string;
}

export const NickNameIco = ({fullName = 'Нет данных', role = '--------'}: NickNameIco) => {

    const { logout } = userStore;

    const handleLogout = async () => {
        await logout();
    };

    const initials = fullName
        .split(" ")
        .map(word => word[0])
        .join("");

    return (
        <div className={s.nick_name_wrap}>
            <div className={s.inside_circle}>
                {initials}
            </div>
            <div className={s.full_name}>
                <span>{fullName}</span>
                <span>{role}</span>
            </div>
            <div className={s.logout_icon} onClick={handleLogout}>
                <LogOut size={26} strokeWidth={1.8} />
            </div>
        </div>
    );
};