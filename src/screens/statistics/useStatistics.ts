import { useState } from "react";
import {
  userStore,
  type ISubject,
} from "../../store/UserStore.tsx";
import s from "./Statistics.module.css";

export type TermKey = Extract<
  keyof ISubject,
  `term_${number}`
>;

export interface TermOption {
  key: TermKey;
  label: string;
}

export interface SubjectStatistics {
  id: ISubject["id"];
  name: ISubject["name"];
  average: number;
  count: number;
  badgeClass: string;
  finalMark?: number | null;
}

const terms: readonly TermOption[] = [
  { key: "term_1", label: "I ч." },
  { key: "term_2", label: "II ч." },
  { key: "term_3", label: "III ч." },
  { key: "term_4", label: "IV ч." },
];

const calculateSubjectStats = (
  marks: readonly number[] = [],
) => {
  if (marks.length === 0) return { average: 0, count: 0 };
  const sum = marks.reduce((acc, mark) => acc + mark, 0);
  return {
    average: Number((sum / marks.length).toFixed(1)),
    count: marks.length,
  };
};

const getBadgeClass = (average: number): string => {
  if (average >= 8) return s.badgeHigh;
  if (average >= 6) return s.badgeMedium;
  if (average >= 4) return s.badgeLow;
  return s.badgeCritical;
};

// Call from an observer component so MobX tracks all observable reads below.
export const useStatistics = () => {
  const [selectedTerm, setSelectedTerm] =
    useState<TermKey>("term_1");
  const { profile } = userStore;

  // Derive during rendering: observable arrays can change without changing identity.
  const subjects: SubjectStatistics[] = Object.values(
    profile?.subjects ?? {},
  ).map((subject) => {
    const termData = subject[selectedTerm];
    const stats = calculateSubjectStats(termData?.marks);
    return {
      id: subject.id,
      name: subject.name,
      ...stats,
      badgeClass: getBadgeClass(stats.average),
      finalMark: termData?.finalMark,
    };
  });

  return {
    studentName: profile?.name ?? "",
    isEmpty: !profile?.subjects,
    subjects,
    termSelector: {
      terms,
      selectedTerm,
      onSelectTerm: setSelectedTerm,
    },
  };
};
