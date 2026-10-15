import { Button } from "../../components/atoms/button/Button.tsx";
import type {
  TermKey,
  TermOption,
} from "./useStatistics.ts";
import s from "./Statistics.module.css";

interface TermSelectorProps {
  terms: readonly TermOption[];
  selectedTerm: TermKey;
  onSelectTerm: (term: TermKey) => void;
}

export const TermSelector = ({
  terms,
  selectedTerm,
  onSelectTerm,
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
