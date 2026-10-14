import { type FC, useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import {
  BarChart3,
  GraduationCap,
  Percent,
} from "lucide-react";
import { userStore } from "../../store/UserStore.tsx";
import { Text } from "../../components/atoms/text/Text.tsx";
import { Button } from "../../components/atoms/button/Button.tsx";
import s from "./Statistics.module.css";

type TermKey = "term_1" | "term_2" | "term_3" | "term_4";

export const Statistics: FC = observer(() => {
  const navigate = useNavigate();
  const { profile } = userStore;
  const [selectedTerm, setSelectedTerm] =
    useState<TermKey>("term_1");

  if (!profile || !profile.subjects) {
    return (
      <div className={s.emptyState}>
        <Text color="var(--text-secondary)">
          Журнал пуст или профиль загружается...
        </Text>
      </div>
    );
  }

  const subjectsList = Object.values(profile.subjects);

  // Конфиг для вкладок четвертей
  const termsConfig: { key: TermKey; label: string }[] = [
    { key: "term_1", label: "I ч." },
    { key: "term_2", label: "II ч." },
    { key: "term_3", label: "III ч." },
    { key: "term_4", label: "IV ч." },
  ];

  // Вспомогательная функция для расчета статистики по конкретному предмету
  const calculateSubjectStats = (marks: number[]) => {
    if (!marks || marks.length === 0) {
      return { average: 0, count: 0 };
    }
    const sum = marks.reduce((acc, val) => acc + val, 0);
    const average = sum / marks.length;
    return {
      average: Number(average.toFixed(2)), // Округляем до сотых для точности
      count: marks.length,
    };
  };

  // Функция для динамического окрашивания среднего балла по 10-балльной системе РБ
  const getBadgeClass = (avg: number) => {
    if (avg >= 8) return s.badgeHigh; // Высокий уровень (8-10)
    if (avg >= 6) return s.badgeMedium; // Средний/достаточный уровень (6-7)
    if (avg >= 4) return s.badgeLow; // Удовлетворительный уровень (4-5)
    return s.badgeCritical; // Требует внимания (1-3)
  };

  return (
    <div className={s.statisticsWrapper}>
      {/* Шапка блока */}
      <div className={s.header}>
        <BarChart3 className={s.headerIcon} size={24} />
        <Text as="h2" color="var(--text-main)">
          Статистика успеваемости
        </Text>
      </div>

      {/* Переключатель четвертей */}
      <div className={s.tabs}>
        {termsConfig.map(({ key, label }) => (
          <Button
            key={key}
            onClick={() => setSelectedTerm(key)}
            className={`${s.tabBtn} ${selectedTerm === key ? s.tabBtnActive : s.tabBtnInactive}`}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Сетка карточек предметов */}
      <div className={s.grid}>
        {subjectsList.map((subject) => {
          const termData = subject[selectedTerm];
          const marks = termData?.marks || [];
          const { average, count } =
            calculateSubjectStats(marks);

          return (
            <div
              key={subject.id}
              className={s.card}
              onClick={() =>
                navigate(`/subjects/${subject.id}`)
              }
              title="Открыть детали предмета"
            >
              <div className={s.cardHeader}>
                <Text
                  as="h3"
                  weight={600}
                  className={s.subjectName}
                >
                  {subject.name}
                </Text>
                <span
                  className={`${s.avgBadge} ${getBadgeClass(average)}`}
                >
                  {count > 0 ? average : "—"}
                </span>
              </div>

              <div className={s.cardBody}>
                <div className={s.infoRow}>
                  <Percent
                    size={16}
                    className={s.infoIcon}
                  />
                  <Text
                    as="span"
                    color="var(--text-secondary)"
                  >
                    Средний балл:{" "}
                    <strong>
                      {count > 0
                        ? `${average} из 10`
                        : "нет оценок"}
                    </strong>
                  </Text>
                </div>

                <div className={s.infoRow}>
                  <GraduationCap
                    size={16}
                    className={s.infoIcon}
                  />
                  <Text
                    as="span"
                    color="var(--text-secondary)"
                  >
                    Всего оценок в четверти:{" "}
                    <strong>{count}</strong>
                  </Text>
                </div>
              </div>

              {/* Декоративный индикатор итоговой оценки, если она уже выставлена в Firestore */}
              {termData?.finalMark && (
                <div className={s.finalMarkFooter}>
                  <Text as="small">
                    Выставлена четвертная:{" "}
                    <strong>{termData.finalMark}</strong>
                  </Text>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
