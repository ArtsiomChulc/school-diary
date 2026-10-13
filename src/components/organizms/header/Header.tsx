import { Button } from "../../atoms/button/Button.tsx";
import { Text } from "../../atoms/text/Text.tsx";
import {
  Calculator,
  SunMoon,
  OutdentIcon,
  BookAIcon,
} from "lucide-react";
import { NickNameIco } from "../../atoms/nickNameIco/NickNameIco.tsx";
import useTheme from "../../../hooks/useTheme.ts";
import { userStore } from "../../../store/UserStore.tsx";
import { NavLink } from "react-router";
import { observer } from "mobx-react-lite";
import s from "./Header.module.css";
import useWindowWidth from "../../../hooks/useWindowSize.ts";
import { Hamburger } from "../../molecules/hamburger/Hamburger.tsx";

interface Props {
  handleLogout: () => void;
}

const Header = observer(({ handleLogout }: Props) => {
  const { toggleTheme } = useTheme();
  const { currentUserProfile } = userStore;
  const width = useWindowWidth();

  const mobile = width <= 540;

  return (
    <header className={s.header}>
      <NavLink to={"/calculator"} className={s.header_btn}>
        <Text as={"span"} size={mobile ? "sm" : "md"}>
          {mobile && (
            <Calculator
              size={32}
              color={"var(--text-main)"}
            />
          )}
          Калькулятор оценок
        </Text>
      </NavLink>
      <NavLink to={"/subjects"} className={s.header_btn}>
        <Text as={"span"} size={mobile ? "sm" : "md"}>
          {mobile && (
            <BookAIcon
              size={32}
              color={"var(--text-main)"}
            />
          )}
          Дневник
        </Text>
      </NavLink>

      <Button
        onClick={toggleTheme}
        className={s.header_btn}
        title="Сменить тему"
      >
        <Text as={"span"} size={mobile ? "sm" : "md"}>
          {mobile && (
            <SunMoon size={28} color={"var(--text-main)"} />
          )}
          Сменить тему
        </Text>
      </Button>

      <Button
        onClick={handleLogout}
        className={s.header_btn}
        title="Выход"
      >
        <Text as={"span"} size={mobile ? "sm" : "md"}>
          {mobile && (
            <OutdentIcon
              size={28}
              color={"var(--text-main)"}
            />
          )}
          Выход
        </Text>
      </Button>

      {mobile && (
        <Hamburger isOpen={false} onToggle={() => {}} />
      )}
      <NickNameIco
        fullName={currentUserProfile?.name}
        role={currentUserProfile?.role}
      />
    </header>
  );
});

export default Header;
