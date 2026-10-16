import { type FC } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import { userStore } from "../../store/UserStore.tsx";
import { observer } from "mobx-react-lite";
import { LoaderPotter } from "../../components/organizms/loading/LoaderPotter.tsx";

export const ProtectedRoute: FC = observer(() => {
  const location = useLocation();
  const { isLoading, user } = userStore;

  if (isLoading) {
    return <LoaderPotter text={"Шалость удалась"} />;
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
