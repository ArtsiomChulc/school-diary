import { Button } from "../../atoms/button/Button.tsx";
import type {
  TermKey,
  TermOption,
} from "../../../utils/subjectStatistics.ts";

interface TermSelectorProps {
  terms: readonly TermOption[];
  selectedTerm: TermKey;
  onSelectTerm: (term: TermKey) => void;
  classes: {
    tabs: string;
    tabBtn: string;
    tabBtnActive: string;
    tabBtnInactive: string;
  };
}

export const TermSelector = ({
  terms,
  selectedTerm,
  onSelectTerm,
  classes: s,
}: TermSelectorProps) => (
  <div className={s.tabs}>
    {terms.map(({ key, label }) => (
      <Button
        key={key}
        onClick={() => onSelectTerm(key)}
        className={`${s.tabBtn} ${selectedTerm === key ? s.tabBtnActive : s.tabBtnInactive}`}
      >
        {label}
      </Button>
    ))}
  </div>
);
