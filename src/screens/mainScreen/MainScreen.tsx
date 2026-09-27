import { NickNameIco } from "../../components/atoms/nickNameIco/NickNameIco.tsx";
import { userStore } from "../../store/UserStore.ts";
import { Dashboard } from "../../components/organizms/dashboard/Dashboard.tsx";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { StepBack, Calculator } from "lucide-react";
import s from "./MainScreen.module.css";

export const MainScreen = observer(() => {
  const [view, setView] = useState<"diary" | "calculator">("diary");

  const { profile } = userStore;
  //todo delete code
  // const handleCreateUser = async () => {
  //     await quickCreateUser()

  // }
  if (!profile) {
    return <div>Пользователь не авторизован</div>;
  }

  if (!profile.subjects || Object.keys(profile.subjects).length === 0) {
    return <div>Список предметов пуст</div>;
  }

  return (
    <div className={s.main_screen}>
      <header className={s.header}>
        <button
          onClick={() =>
            setView(view === "calculator" ? "diary" : "calculator")
          }
          className={s.calc_btn}
        >
          {view === "calculator" ? (
            <span>
              <StepBack size={34} color={"var(--text-main)"} />
              назад
            </span>
          ) : (
            <span>
              <Calculator size={34} color={"var(--text-main)"} />
              калькулятор оценок
            </span>
          )}
        </button>
        {/*<Hamburger isOpen={false} onToggle={() => {}}/>*/}
        <NickNameIco fullName={profile?.name} role={profile?.role} />
      </header>
      <main className={s.main_content}>
        <div className={s.info_block}>
          <div className={s.info_block_text}>
            <h1>Наглядное представление вашего прогресса.</h1>
            <p>
              Ваш учебный процесс — всё четко и организовано. Вот что вас ждет в
              этой учебной четверти.
            </p>
          </div>
          <div className={s.info_block_nav}>
            <Dashboard externalView={view} setExternalView={setView} />
          </div>
        </div>
      </main>
    </div>
  );
});
