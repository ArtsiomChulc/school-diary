import { type FC } from "react";
import { observer } from "mobx-react-lite";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router";
import { SubjectDetails } from "../subjectDetails/SubjectDetails.tsx";
import { SubjectsTable } from "../../../screens/subjectsTable/SubjectsTable.tsx";
import GradeCalculator from "../../../screens/gradeCalculator/GradeCalculator.tsx";

export const Dashboard: FC = observer(() => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.includes("calculator")) {
    return <GradeCalculator />;
  }

  if (subjectId) {
    return <SubjectDetails />;
  }

  return (
    <SubjectsTable
      onSelectSubject={(id) => navigate(`/subjects/${id}`)} // Переход на карточку предмета по URL
    />
  );
});
