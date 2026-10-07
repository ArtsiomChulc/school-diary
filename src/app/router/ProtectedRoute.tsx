import { type FC } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import { userStore } from "../../store/UserStore.ts";
import { observer } from "mobx-react-lite";
import Loading from "../../components/organizms/loading/Loading.tsx";

export const ProtectedRoute: FC = observer(() => {
  const location = useLocation();
  const { isLoading, user } = userStore;

  if (isLoading) {
    return <Loading message="Проверяем школьный журнал" />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
});
