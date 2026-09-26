import {MainContainer} from "./components/organizms/containers/main_container/MainContainer.tsx";
import {MainScreen} from "./screens/mainScreen/MainScreen.tsx";
import { observer } from 'mobx-react-lite';
import {userStore} from "./store/UserStore.ts";
import {SignIn} from "./screens/signIn/SignIn.tsx";
import Loading from "./components/organizms/loading/Loading.tsx";
import './App.css'
import {Toaster} from "react-hot-toast";

export const App = observer(() => {

    const { user, isLoading} = userStore;

    if (isLoading) {
        return <Loading/>
    }

    if (!user) {
        return <SignIn />;
    }

    return (
    <MainContainer>
        <Toaster position="top-center" />
        <MainScreen/>
    </MainContainer>
  )
})