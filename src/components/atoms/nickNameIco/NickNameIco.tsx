import { Text } from "../text/Text.tsx";
import s from "./NickNameIco.module.css";

interface NickNameIco {
  fullName?: string;
  role?: string;
}

export const NickNameIco = ({
  fullName = "Нет данных",
  role = "--------",
}: NickNameIco) => {
  const initials = fullName
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <div className={s.nick_name_wrap}>
      <div className={s.inside_circle}>{initials}</div>
      <div className={s.full_name}>
        <Text
          as={"span"}
          size={"md"}
          color={"var(--text-main)"}
        >
          {fullName}
        </Text>
        <Text
          as={"span"}
          size={"sm"}
          color={"var(--text-secondary)"}
        >
          {role}
        </Text>
      </div>
    </div>
  );
};
