import {FormContainer} from "../../components/organizms/containers/form_container/FormContainer.tsx";
import {HeadIcon} from "../../components/molecules/headIcon/HeadIcon.tsx";
import {Input} from "../../components/atoms/input/Input.tsx";
import {LockOpen, Mail} from "lucide-react";
import {Button} from "../../components/atoms/button/Button.tsx";
import {type SyntheticEvent, useState} from "react";
import {userStore} from "../../store/UserStore.ts";
import s from './SignIn.module.css'

export const SignIn = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const { login, authError, isLoading } = userStore;

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        // Простейшая валидация перед отправкой
        if (!email.trim() || !password.trim()) {
            return;
        }

        // Вызываем метод стора
        await login(email, password);
    };

    return (
        <div className={s.sign_in_wrapper}>
            <div className={s.icon_and_text}>
              <HeadIcon/>
            </div>
            <FormContainer>
                <h3 className={s.signin_title}>Ваша история обучения начинается здесь.</h3>
                <p className={s.signin_subtitle}>Войдите в систему, чтобы следить за своей успеваемостью</p>
                {authError && <div className={s.error_login}>{authError}</div>}
                <form onSubmit={handleSubmit} className={s.form}>
                    <Input id="email"
                           label="Почтовый адрес"
                           type="email"
                           placeholder="you@school.com"
                           onChange={(e) => setEmail(e.target.value)}
                           icon={<Mail size={20} strokeWidth={1.5} />}
                           required
                    />
                    <Input id="password"
                           label="Пароль"
                           type="password"
                           placeholder="Введи свой  пароль"
                           onChange={(e) => setPassword(e.target.value)}
                           icon={<LockOpen size={20} strokeWidth={1.5} />}
                           disabled={isLoading}
                           required
                    />
                    <Button text={isLoading ? 'Вход...' : 'Войти'} type={'submit'} disabled={isLoading}/>
                </form>
            </FormContainer>
        </div>
    );
};
