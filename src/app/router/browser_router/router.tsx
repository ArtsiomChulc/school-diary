import { ProtectedRoute } from "../ProtectedRoute.tsx";
import { createBrowserRouter } from "react-router";
import { SignIn } from "../../../screens/signIn/SignIn.tsx";
import { Layout } from "../../layout/Layout.tsx";
import GradeCalculator from "../../../screens/gradeCalculator/GradeCalculator.tsx";
import { MainScreen } from "../../../screens/mainScreen/MainScreen.tsx";
import { SubjectDetails } from "../../../components/organizms/subjectDetails/SubjectDetails.tsx";
import { Statistics } from "../../../screens/statistics/Statistics.tsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <SignIn />,
    errorElement: <div>not found</div>,
  },

  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <div>not found</div>,
    children: [
      {
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Statistics />,
          },
          {
            path: "subjects",
            element: <MainScreen />,
          },
          {
            path: "calculator",
            element: <GradeCalculator />,
          },
          {
            path: "subjects/:subjectId",
            element: <SubjectDetails />,
          },
        ],
      },
    ],
  },
]);
