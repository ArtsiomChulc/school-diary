import { userStore } from "../../store/UserStore.ts";
import { Dashboard } from "../../components/organizms/dashboard/Dashboard.tsx";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { Text } from "../../components/atoms/text/Text.tsx";
import s from "./MainScreen.module.css";

export const MainScreen = observer(() => {
  const [view, setView] = useState<"diary" | "calculator">(
    "diary",
  );

  const { profile } = userStore;
  //todo delete code
  // const handleCreateUser = async () => {
  //     await quickCreateUser()

  // }
  if (!profile) {
    return (
      <Text as={"p"} weight={500} size={"large"}>
        Пользователь не авторизован
      </Text>
    );
  }

  if (
    !profile.subjects ||
    Object.keys(profile.subjects).length === 0
  ) {
    return (
      <Text as={"p"} weight={500} size={"large"}>
        Список предметов пуст
      </Text>
    );
  }

  return (
    <div className={s.main_screen}>
      <main className={s.main_content}>
        <div className={s.info_block}>
          <div className={s.info_block_text}>
            <Text
              as={"h1"}
              size={"large"}
              align={"center"}
              color={"var(--text-main)"}
              weight={600}
            >
              Наглядное представление вашего прогресса.
            </Text>
            <Text
              as={"p"}
              size={"sm"}
              align={"center"}
              color={"var(--text-secondary)"}
            >
              Ваш учебный процесс — всё четко и
              организовано. Вот что вас ждет в этой учебной
              четверти.
            </Text>
          </div>
          <div className={s.info_block_nav}>
            <Dashboard
              externalView={view}
              setExternalView={setView}
            />
          </div>
        </div>
      </main>
    </div>
  );
});
