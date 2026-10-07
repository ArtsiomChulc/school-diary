import { Button } from "../../atoms/button/Button.tsx";
import { Text } from "../../atoms/text/Text.tsx";
import {
  Calculator,
  SunMoon,
  OutdentIcon,
} from "lucide-react";
import { NickNameIco } from "../../atoms/nickNameIco/NickNameIco.tsx";
import useTheme from "../../../hooks/useTheme.ts";
import { userStore } from "../../../store/UserStore.ts";
import { NavLink } from "react-router";
import { observer } from "mobx-react-lite";
import s from "./Header.module.css";

interface Props {
  handleLogout: () => void;
}

const Header = observer(({ handleLogout }: Props) => {
  const { toggleTheme } = useTheme();
  const { profile } = userStore;

  return (
    <header className={s.header}>
      <NavLink to={"/calculator"} className={s.header_btn}>
        <Text as={"span"}>
          <Calculator
            size={32}
            color={"var(--text-main)"}
          />
          калькулятор оценок
        </Text>
      </NavLink>

      <Button
        onClick={toggleTheme}
        className={s.header_btn}
        title="Сменить тему"
      >
        <Text as={"span"}>
          <SunMoon size={28} color={"var(--text-main)"} />
          сменить тему
        </Text>
      </Button>

      <Button
        onClick={handleLogout}
        className={s.header_btn}
        title="Выход"
      >
        <Text as={"span"}>
          <OutdentIcon
            size={28}
            color={"var(--text-main)"}
          />
          Выход
        </Text>
      </Button>

      {/*<Hamburger isOpen={false} onToggle={() => {}}/>*/}
      <NickNameIco
        fullName={profile?.name}
        role={profile?.role}
      />
    </header>
  );
});

export default Header;
