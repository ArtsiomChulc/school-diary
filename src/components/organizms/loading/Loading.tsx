import { useState, useEffect, type FC } from 'react';
import s from './Loading.module.css';

interface LoadingProps {
    message?: string;
}

export const Loading: FC<LoadingProps> = ({ message = 'Идет урок...' }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={s.container}>
            <div className={s.board}>
                <div className={s.frame}>
                    <div className={s.chalkSpinner}></div>

                    <h2 className={s.text}>
                        {message.replace(/\.+\$/, '')}
                        <span className={s.dots}>{dots}</span>
                    </h2>

                    <div className={s.chalkTray}>
                        <div className={s.chalkPiece}></div>
                        <div className={s.sponge}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Loading;
