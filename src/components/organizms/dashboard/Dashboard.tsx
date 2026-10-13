import { type FC } from "react";
import { observer } from "mobx-react-lite";
import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router";
import { SubjectDetails } from "../subjectDetails/SubjectDetails.tsx";
import { SubjectsTable } from "../subjectsTable/SubjectsTable.tsx";
import GradeCalculator from "../../../screens/gradeCalculator/GradeCalculator.tsx";

export const Dashboard: FC = observer(() => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // 1. ОПРЕДЕЛЯЕМ ЭКРАН НА ОСНОВЕ URL
  // Если в пути есть слово "calculator", показываем калькулятор оценок
  if (location.pathname.includes("calculator")) {
    return <GradeCalculator />;
  }

  // Если в URL есть динамический параметр subjectId, показываем детали этого предмета
  if (subjectId) {
    return (
      <SubjectDetails
        subjectId={subjectId}
        onBack={() => navigate("/subjects")} // Шаг назад к таблице через навигацию
      />
    );
  }

  // 2. ДЕФОЛТНЫЙ ВАРИАНТ (Если мы на "/" или "/subjects")
  return (
    <SubjectsTable
      onSelectSubject={(id) => navigate(`/subjects/${id}`)} // Переход на карточку предмета по URL
    />
  );
});
