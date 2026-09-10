import s from "./Hamburger.module.css";

interface HamburgerProps {
    isOpen: boolean;
    onToggle: () => void;
}

export const Hamburger = ({ isOpen, onToggle }: HamburgerProps) => {
    return (
        <button
            className={`${s.hamburger} ${isOpen ? s.active : ""}`}
            onClick={onToggle}
            aria-label="Toggle menu"
        >
            <div className={s.line} />
            <div className={s.line} />
            <div className={s.line} />
        </button>
    );
};
