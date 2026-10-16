import { observer } from "mobx-react-lite";
import { useStudentSubjects } from "../../hooks/useStudentSubjects.ts";
import {
  calculateYearlyMark,
  terms,
} from "../../utils/subjectStatistics.ts";
import type { FC } from "react";
import s from "./SubjectsTable.module.css";

interface MainTableProps {
  onSelectSubject: (id: string) => void;
}

export const SubjectsTable: FC<MainTableProps> = observer(
  ({ onSelectSubject }) => {
    const {
      profile,
      isLoading,
      isEmpty,
      subjects: subjectsList,
    } = useStudentSubjects();

    if (isLoading)
      return (
        <div className={s.centered}>
          Загрузка дневника...
        </div>
      );
    if (isEmpty || !profile)
      return <div className={s.centered}>Нет данных</div>;

    return (
      <div className={s.container}>
        <h2 className={s.title}>
          Электронный дневник: {profile.name}{" "}
          {profile.class} класс
        </h2>
        <p className={s.description}>
          💡 Нажмите на название предмета, чтобы посмотреть
          текущие оценки или выставить новые.
        </p>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th className={s.thLeft}>Предмет</th>
                {terms.map(({ key, tableLabel }) => (
                  <th key={key} className={s.th}>
                    {tableLabel}
                  </th>
                ))}
                <th className={s.thYearly}>Годовая</th>
              </tr>
            </thead>
            <tbody>
              {subjectsList.map((subject) => {
                const yearlyMark =
                  calculateYearlyMark(subject);

                return (
                  <tr key={subject.id} className={s.tr}>
                    <td
                      className={s.tdName}
                      onClick={() =>
                        onSelectSubject(subject.id)
                      }
                    >
                      {subject.name}
                    </td>

                    {terms.map(({ key: termKey }) => {
                      const finalMark =
                        subject[termKey]?.finalMark;
                      return (
                        <td
                          key={termKey}
                          className={s.tdMark}
                        >
                          {finalMark !== undefined &&
                          finalMark !== null ? (
                            <span
                              className={s.finalMarkBadge}
                            >
                              {finalMark}
                            </span>
                          ) : (
                            <span className={s.empty}>
                              —
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className={s.tdMark}>
                      {typeof yearlyMark === "number" ? (
                        <span className={s.yearlyMarkBadge}>
                          {yearlyMark}
                        </span>
                      ) : (
                        <span className={s.empty}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);
