import { Text } from "../../components/atoms/text/Text.tsx";
import s from "./Statistics.module.css";

export const StatisticsEmptyState = () => (
  <div className={s.emptyState}>
    <Text color="var(--text-secondary)">
      Журнал пуст или профиль загружается...
    </Text>
  </div>
);
