import {MainContainer} from "./components/organizms/containers/main_container/MainContainer.tsx";
import {SignIn} from "./screens/signIn/SignIn.tsx";
import './App.css'

export const App = () => {

  return (
    <MainContainer>
      <SignIn/>
    </MainContainer>
  )
}
