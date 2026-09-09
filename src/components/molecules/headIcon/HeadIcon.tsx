import s from './HeadIcon.module.css';

interface IconProps {
    size?: number;
    title?: string;
    subtitle?: string;
}

export const HeadIcon = ({size = 24, title = 'Школьный дневник', subtitle = 'Academic portal'}: IconProps) => {
    return (
        <div className={s.icon_container}>
            <div className={s.icon_wrap}>
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.42 10.9221C21.599 10.8431 21.7509 10.7134 21.8569 10.5489C21.9629 10.3845 22.0183 10.1925 22.0163 9.99685C22.0143 9.8012 21.9549 9.61044 21.8455 9.4482C21.7362 9.28596 21.5816 9.15937 21.401 9.08411L12.83 5.18011C12.5694 5.06126 12.2864 4.99976 12 4.99976C11.7136 4.99976 11.4305 5.06126 11.17 5.18011L2.59998 9.08011C2.42195 9.15809 2.2705 9.28625 2.16415 9.44893C2.0578 9.61161 2.00116 9.80176 2.00116 9.99611C2.00116 10.1905 2.0578 10.3806 2.16415 10.5433C2.2705 10.706 2.42195 10.8341 2.59998 10.9121L11.17 14.8201C11.4305 14.939 11.7136 15.0005 12 15.0005C12.2864 15.0005 12.5694 14.939 12.83 14.8201L21.42 10.9221Z" stroke="#FBF8F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M22 10V16" stroke="#FBF8F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 12.5V16C6 16.7956 6.63214 17.5587 7.75736 18.1213C8.88258 18.6839 10.4087 19 12 19C13.5913 19 15.1174 18.6839 16.2426 18.1213C17.3679 17.5587 18 16.7956 18 16V12.5" stroke="#FBF8F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <div>
                <p className={s.title_icon}>{title}</p>
                <p className={s.subtitle_icon}>{subtitle}</p>
            </div>
        </div>
    );
};
