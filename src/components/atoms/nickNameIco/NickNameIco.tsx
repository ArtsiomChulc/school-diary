import s from './NickNameIco.module.css';

interface NickNameIco {
    fullName?: string;
}

export const NickNameIco = ({fullName = 'Стефания Чульц'}: NickNameIco) => {

    const initials = fullName
        .split(" ")
        .map(word => word[0])
        .join("");

    return (
        <div className={s.nick_name_wrap}>
            <div className={s.inside_circle}>
                {initials}
            </div>
        </div>
    );
};