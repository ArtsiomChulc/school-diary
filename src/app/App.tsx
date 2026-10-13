import { MainContainer } from "../components/organizms/containers/main_container/MainContainer.tsx";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router";
import { router } from "./router/browser_router/router.tsx";
import "./App.css";

export const App = () => {
  return (
    <MainContainer>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </MainContainer>
  );
};
