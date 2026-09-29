import { useState, useEffect, type FC } from "react";
import { observer } from "mobx-react-lite";
import { GradeCalculator } from "../../../screens/gradeCalculator/GradeCalculator.tsx";
import { SubjectDetails } from "../subjectDetails/SubjectDetails.tsx";
import { SubjectsTable } from "../subjectsTable/SubjectsTable.tsx";

interface DashboardProps {
  externalView: "diary" | "calculator";
  setExternalView: (view: "diary" | "calculator") => void;
}

export const Dashboard: FC<DashboardProps> = observer(
  ({ externalView, setExternalView }) => {
    const [selectedSubjectId, setSelectedSubjectId] =
      useState<string | null>(null);

    const [subView, setSubView] = useState<
      "table" | "details"
    >("table");

    useEffect(() => {
      if (externalView === "calculator") {
        setSelectedSubjectId(null);
        setSubView("table");
      }
    }, [externalView]);

    const handleSelectSubject = (id: string) => {
      setSelectedSubjectId(id);
      setSubView("details");
      setExternalView("diary"); // Гарантируем, что режим 'diary' активен
    };

    const handleBackToTable = () => {
      setSelectedSubjectId(null);
      setSubView("table");
    };

    if (externalView === "calculator") {
      return (
        <GradeCalculator
          onBack={() => setExternalView("diary")}
        />
      );
    }

    if (subView === "details" && selectedSubjectId) {
      return (
        <SubjectDetails
          subjectId={selectedSubjectId}
          onBack={handleBackToTable}
        />
      );
    }

    return (
      <SubjectsTable
        onSelectSubject={handleSelectSubject}
      />
    );
  },
);
