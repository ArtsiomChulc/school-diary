import { Outlet, useNavigate } from "react-router";
import { signOut } from "firebase/auth";
import type { FC } from "react";
import { auth } from "../../../../firebase.ts";
import { Text } from "../../atoms/text/Text.tsx";
import { Header } from "../header/Header.tsx";
import toast from "react-hot-toast";
import { MainContainer } from "../containers/main_container/MainContainer.tsx";
import s from "./Layout.module.css";

export const Layout: FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      toast.error("Ошибка при выходе из системы");
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  return (
    <MainContainer>
      <Header handleLogout={handleLogout} />
      <main className={s.main}>
        <div>
          <Outlet />
        </div>
      </main>
      <footer className={s.footer}>
        <Text align="center" color={"var(--text-main)"}>
          © {new Date().getFullYear()} Дневник ученика 4
          класса средняя школа №17.
        </Text>
      </footer>
    </MainContainer>
  );
};
