import s from "./Loader.module.css";

interface LoaderProps {
  size?: number;
  centered?: boolean;
}

export const Loader = ({
  size = 32,
  centered = true,
}: LoaderProps) => {
  return (
    <div className={centered ? s.loaderContainer : ""}>
      <div
        className={s.ring}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderWidth: `${Math.max(2, size / 8)}px`, // пропорциональная толщина кольца
        }}
      />
    </div>
  );
};
