import React, { useState, useEffect, type FC} from 'react';

interface LoadingProps {
    message?: string;
}

export const Loading: FC<LoadingProps> = ({ message = 'Идет урок...' }) => {
    const [dots, setDots] = useState('');

    // Анимация троеточия для текста
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={styles.container}>
        <div style={styles.board}>
            <div style={styles.frame}>
        <div style={styles.chalkSpinner}></div>

    <h2 style={styles.text}>
        {message.replace(/\.+\$/, '')}
        <span style={styles.dots}>{dots}</span>
        </h2>

    <div style={styles.chalkTray}>
    <div style={styles.chalkPiece}></div>
        <div style={styles.sponge}></div>
        </div>
        </div>
        </div>

    <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @font-face {
          font-family: 'SchoolChalk';
          src: local('Comic Sans MS'), local('Caveat'), local('Arial'); /* Фолбэк для мелового эффекта */
        }
      `}</style>
    </div>
);
};

// Стили компонента
const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
        backgroundColor: '#f4f1ea',
        fontFamily: '"Comic Sans MS", "Caveat", cursive, sans-serif',
    },
    board: {
        width: '320px',
        height: '220px',
        backgroundColor: '#0d4223',
        border: '12px solid #8B4513',
        borderRadius: '8px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3), inset 0 0 30px rgba(0,0,0,0.5)',
        position: 'relative',
        padding: '20px',
        boxSizing: 'border-box',
    },
    frame: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'relative',
    },
    chalkSpinner: {
        width: '50px',
        height: '50px',
        border: '4px dashed rgba(255, 255, 255, 0.8)',
        borderRadius: '50%',
        borderTop: '4px solid transparent',
        animation: 'spin 1.5s linear infinite',
        marginBottom: '20px',
    },
    text: {
        color: 'rgba(255, 255, 255, 0.9)',
        margin: 0,
        fontSize: '22px',
        letterSpacing: '1px',
        textAlign: 'center',
        textShadow: '0 0 2px rgba(255,255,255,0.3)',
        userSelect: 'none',
    },
    dots: {
        display: 'inline-block',
        width: '20px',
        textAlign: 'left',
    },
    chalkTray: {
        position: 'absolute',
        bottom: '-15px',
        right: '0px',
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-end',
    },
    chalkPiece: {
        width: '25px',
        height: '8px',
        backgroundColor: '#ffffff',
        borderRadius: '2px',
        transform: 'rotate(-5deg)',
        boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
    sponge: {
        width: '35px',
        height: '14px',
        backgroundColor: '#dfb76c',
        borderRadius: '3px',
        boxShadow: '1px 1px 2px rgba(0,0,0,0.2)',
    },
};

export default Loading;
