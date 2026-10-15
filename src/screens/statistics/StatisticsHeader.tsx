import { BarChart3 } from "lucide-react";
import { Text } from "../../components/atoms/text/Text.tsx";
import s from "./Statistics.module.css";

interface StatisticsHeaderProps {
  studentName: string;
}

export const StatisticsHeader = ({
  studentName,
}: StatisticsHeaderProps) => (
  <div className={s.header}>
    <BarChart3 className={s.headerIcon} size={24} />
    <Text as="h2" color="var(--text-main)">
      Статистика успеваемости для -{studentName}-
    </Text>
  </div>
);
