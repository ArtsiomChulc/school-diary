import { useState } from "react";
import {
  terms,
  type TermKey,
} from "../utils/subjectStatistics.ts";

export const useTermSelection = () => {
  const [selectedTerm, setSelectedTerm] =
    useState<TermKey>("term_1");

  return {
    terms,
    selectedTerm,
    onSelectTerm: setSelectedTerm,
  };
};
