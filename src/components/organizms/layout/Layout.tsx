import { Outlet, useNavigate } from "react-router";
import { signOut } from "firebase/auth";
import type { FC } from "react";
import { auth } from "../../../../firebase.ts";
import { Text } from "../../atoms/text/Text.tsx";
import Header from "../header/Header.tsx";

export const Layout: FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  return (
    <div>
      <Header handleLogout={handleLogout} />
      <main>
        <div>
          <Outlet />
        </div>
      </main>
      <footer>
        <Text align="center" color={"var(--text-main)"}>
          © {new Date().getFullYear()} Дневник ученика 4
          класса Республики Беларусь. Все права защищены.
        </Text>
      </footer>
    </div>
  );
};
