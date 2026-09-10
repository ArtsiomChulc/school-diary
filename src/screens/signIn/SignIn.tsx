import {FormContainer} from "../../components/organizms/containers/form_container/FormContainer.tsx";
import {HeadIcon} from "../../components/molecules/headIcon/HeadIcon.tsx";
import {Input} from "../../components/atoms/input/Input.tsx";
import {Mail, LockOpen} from "lucide-react";
import s from './SignIn.module.css'
import {Button} from "../../components/atoms/button/Button.tsx";

export const SignIn = () => {
    return (
        <div className={s.sign_in_wrapper}>
            <div className={s.icon_and_text}>
              <HeadIcon/>
            </div>
            <FormContainer>
                <h3 className={s.signin_title}>Ваша история обучения начинается здесь.</h3>
                <p className={s.signin_subtitle}>Войдите в систему, чтобы следить за своей успеваемостью</p>
                <form className={s.form}>
                    <Input id="email"
                           label="Почтовый адрес"
                           type="email"
                           placeholder="you@school.com"
                           onChange={() => {}}
                           icon={<Mail size={20} strokeWidth={1.5} />}
                           required
                    />
                    <Input id="password"
                           label="Пароль"
                           type="password"
                           placeholder="Введи свой  пароль"
                           onChange={() => {}}
                           icon={<LockOpen size={20} strokeWidth={1.5} />}
                           required
                    />
                    <Button text={'Войти'} type={'submit'}/>
                </form>
            </FormContainer>
        </div>
    );
};
