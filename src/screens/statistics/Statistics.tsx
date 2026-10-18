import { observer } from "mobx-react-lite";
import { StatisticsHeader } from "./StatisticsHeader.tsx";
import { StatisticsEmptyState } from "./StatisticsEmptyState.tsx";
import { SubjectCard } from "./SubjectCard.tsx";
import { GradeDistribution } from "./GradeDistribution.tsx";
import { TermSelector } from "../../components/molecules/termSelector/TermSelector.tsx";
import { useStatistics } from "./useStatistics.ts";
import s from "./Statistics.module.css";

export const Statistics = observer(() => {
  const {
    studentName,
    isEmpty,
    subjects,
    termSelector,
    grades,
  } = useStatistics();

  if (isEmpty) return <StatisticsEmptyState />;

  return (
    <div className={s.statisticsWrapper}>
      <StatisticsHeader studentName={studentName} />
      <TermSelector
        {...termSelector}
        classes={{
          tabs: s.tabs,
          tabBtn: s.tabBtn,
          tabBtnActive: s.tabBtnActive,
          tabBtnInactive: s.tabBtnInactive,
        }}
      />
      <GradeDistribution grades={grades} />
      <div className={s.grid}>
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
});
