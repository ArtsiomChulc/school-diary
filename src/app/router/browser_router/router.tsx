import { ProtectedRoute } from "../ProtectedRoute.tsx";
import { createBrowserRouter } from "react-router";
import { SignIn } from "../../../screens/signIn/SignIn.tsx";
import { Layout } from "../../../components/organizms/layout/Layout.tsx";
import GradeCalculator from "../../../screens/gradeCalculator/GradeCalculator.tsx";

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
            element: <div>home</div>,
          },
          {
            path: "subjects",
            element: <div>subjects</div>,
          },
          {
            path: "calculator",
            element: <GradeCalculator />,
          },
          {
            path: "subjects/:subjectId",
            element: <div>subjects/:subjectId</div>,
          },
        ],
      },
    ],
  },
]);
