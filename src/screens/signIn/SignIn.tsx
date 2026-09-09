import {HeadStudentsIco} from "../../components/atoms/headStudentsIco/HeadStudentsIco.tsx";
import {FormContainer} from "../../components/organizms/containers/form_container/FormContainer.tsx";
import s from './SignIn.module.css'

export const SignIn = () => {
    return (
        <div className={s.sign_in_wrapper}>
            <div className={s.icon_and_text}>
                <HeadStudentsIco/>

            </div>
            <FormContainer></FormContainer>
        </div>
    );
};
