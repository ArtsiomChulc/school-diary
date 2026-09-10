import {MainContainer} from "./components/organizms/containers/main_container/MainContainer.tsx";
import {MainScreen} from "./screens/mainScreen/MainScreen.tsx";
import './App.css'

export const App = () => {

  return (
    <MainContainer>
      {/*<SignIn/>*/}
        <MainScreen/>
    </MainContainer>
  )
}
