import type { ISubject } from "../store/UserStore.tsx";

export type TermKey = Extract<
  keyof ISubject,
  `term_${number}`
>;

export interface TermOption {
  key: TermKey;
  label: string;
  tableLabel: string;
}

export const terms: readonly TermOption[] = [
  { key: "term_1", label: "I ч.", tableLabel: "I четв." },
  { key: "term_2", label: "II ч.", tableLabel: "II четв." },
  {
    key: "term_3",
    label: "III ч.",
    tableLabel: "III четв.",
  },
  { key: "term_4", label: "IV ч.", tableLabel: "IV четв." },
];

export const calculateAverage = (
  marks: readonly number[],
): number =>
  marks.length === 0
    ? 0
    : marks.reduce((sum, mark) => sum + mark, 0) /
      marks.length;

export const calculateSubjectStats = (
  marks: readonly number[] = [],
) => ({
  average: Number(calculateAverage(marks).toFixed(1)),
  count: marks.length,
});

export const calculateYearlyMark = (
  subject: ISubject,
): number | null => {
  const finalMarks = terms
    .map(({ key }) => subject[key]?.finalMark)
    .filter(
      (mark): mark is number =>
        mark !== undefined && mark !== null,
    );

  return finalMarks.length === 0
    ? null
    : Math.round(calculateAverage(finalMarks));
};
