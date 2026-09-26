import {Hamburger} from "../../components/molecules/hamburger/Hamburger.tsx";
import {NickNameIco} from "../../components/atoms/nickNameIco/NickNameIco.tsx";
import {userStore} from "../../store/UserStore.ts";
import {Dashboard} from "../../components/organizms/dashboard/Dashboard.tsx";
import s from './MainScreen.module.css';

export const MainScreen = () => {

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
                <Hamburger isOpen={false} onToggle={() => {}}/>
                <NickNameIco fullName={profile?.name} role={profile?.role} />
            </header>
            <main className={s.main_content}>
                <div className={s.info_block}>
                    <div className={s.info_block_text}>
                        <h1>Наглядное представление вашего прогресса.</h1>
                        <p>Ваш учебный процесс — всё четко и организовано. Вот
                            что вас ждет в этой учебной четверти.</p>
                    </div>
                    <div className={s.info_block_nav}>
                        <Dashboard/>
                    </div>
                </div>
            </main>
        </div>
    );
};