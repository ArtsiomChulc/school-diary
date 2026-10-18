import { Text } from "../../components/atoms/text/Text.tsx";
import s from "./Statistics.module.css";

interface GradeDistributionProps {
  grades?: readonly number[] | null;
}

export const GradeDistribution = ({
  grades = [],
}: GradeDistributionProps) => {
  const counts = { 10: 0, 9: 0 };

  for (const grade of grades ?? []) {
    if (grade === 10 || grade === 9) counts[grade] += 1;
  }

  const total = counts[10] * 2 + counts[9];

  return (
    <section
      className={s.distribution}
      aria-label="Вознаграждение за оценки"
    >
      <Text as="h3" className={s.subjectName}>
        Вознаграждение за оценки в четверти
      </Text>
      <dl className={s.distributionList}>
        {([10, 9] as const).map((grade) => (
          <div key={grade} className={s.distributionRow}>
            <dt>
              Оценка {grade} ({grade === 10 ? 2 : 1}{" "}
              руб./шт.)
            </dt>
            <dd>{counts[grade]} шт.</dd>
          </div>
        ))}
      </dl>
      <div className={s.rewardTotal}>
        <span>Итого заработано:</span>
        <strong aria-live="polite" aria-atomic="true">
          {total} руб.
        </strong>
      </div>
    </section>
  );
};
