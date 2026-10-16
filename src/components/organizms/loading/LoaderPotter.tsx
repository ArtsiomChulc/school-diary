import type { FC } from "react";
import wizardImg from "../../../assets/hogvards.png";
import styles from "./LoaderPotter.module.css";

interface LoaderProps {
  text?: string;
}

export const LoaderPotter: FC<LoaderProps> = ({
  text = "Загрузка магии...",
}) => {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.magicContainer}>
        <div className={styles.wizardCircle} />
        <div className={styles.wizardCircleInner} />
        <div className={styles.characterWrapper}>
          <img
            src={wizardImg}
            alt="Wizard Loading"
            className={styles.characterImage}
          />
          <div className={styles.lumosSparkle} />
        </div>
      </div>
      <div className={styles.loadingText}>{text}</div>
    </div>
  );
};
