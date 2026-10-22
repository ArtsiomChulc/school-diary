import { GraduationCap, Percent } from "lucide-react";
import { useNavigate } from "react-router";
import { Text } from "../../components/atoms/text/Text.tsx";
import type { SubjectStatistics } from "./useStatistics.ts";
import { PATHS } from "../../app/router/PATHS.ts";
import s from "./Statistics.module.css";

interface SubjectCardProps {
  subject: SubjectStatistics;
}

export const SubjectCard = ({
  subject,
}: SubjectCardProps) => {
  const navigate = useNavigate();
  const {
    id,
    name,
    average,
    count,
    badgeClass,
    finalMark,
  } = subject;

  return (
    <div
      className={s.card}
      onClick={() => navigate(`${PATHS.subjects}/${id}`)}
      title="Открыть детали предмета"
    >
      <div className={s.cardHeader}>
        <Text
          as="h3"
          weight={600}
          className={s.subjectName}
        >
          {name}
        </Text>
        <span className={`${s.avgBadge} ${badgeClass}`}>
          {count > 0 ? average : "—"}
        </span>
      </div>
      <div className={s.cardBody}>
        <div className={s.infoRow}>
          <Percent size={16} className={s.infoIcon} />
          <Text as="span" color="var(--text-secondary)">
            Средний балл:{" "}
            <strong>
              {count > 0
                ? `${average} из 10`
                : "нет оценок"}
            </strong>
          </Text>
        </div>
        <div className={s.infoRow}>
          <GraduationCap size={16} className={s.infoIcon} />
          <Text as="span" color="var(--text-secondary)">
            Всего оценок в четверти:{" "}
            <strong>{count}</strong>
          </Text>
        </div>
      </div>
      {finalMark && (
        <div className={s.finalMarkFooter}>
          <Text as="small">
            Выставлена четвертная:{" "}
            <strong>{finalMark}</strong>
          </Text>
        </div>
      )}
    </div>
  );
};
