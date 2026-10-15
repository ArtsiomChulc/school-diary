import { useTermSelection } from "../../hooks/useTermSelection.ts";
import type { ISubject } from "../../store/UserStore.tsx";
import { useStudentSubjects } from "../../hooks/useStudentSubjects.ts";
import { calculateSubjectStats } from "../../utils/subjectStatistics.ts";
import s from "./Statistics.module.css";

export interface SubjectStatistics {
  id: ISubject["id"];
  name: ISubject["name"];
  average: number;
  count: number;
  badgeClass: string;
  finalMark?: number | null;
}

const getBadgeClass = (average: number): string => {
  if (average >= 8) return s.badgeHigh;
  if (average >= 6) return s.badgeMedium;
  if (average >= 4) return s.badgeLow;
  return s.badgeCritical;
};

export const useStatistics = () => {
  const termSelector = useTermSelection();
  const { selectedTerm } = termSelector;
  const {
    profile,
    subjects: studentSubjects,
    isEmpty,
  } = useStudentSubjects();

  const subjects: SubjectStatistics[] = studentSubjects.map(
    (subject) => {
      const termData = subject[selectedTerm];
      const stats = calculateSubjectStats(termData?.marks);
      return {
        id: subject.id,
        name: subject.name,
        ...stats,
        badgeClass: getBadgeClass(stats.average),
        finalMark: termData?.finalMark,
      };
    },
  );

  return {
    studentName: profile?.name ?? "",
    isEmpty,
    subjects,
    termSelector,
  };
};
