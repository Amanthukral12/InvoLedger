import { useEffect } from "react";
import { useAuth } from "../hooks/auth";
import useAuthStore from "../store/authStore";
import { Outlet } from "react-router-dom";

const AuthProvider = () => {
  const { sessionQuery } = useAuth();
  const setCompanyState = useAuthStore((state) => state.setCompany);
  const setSessionState = useAuthStore((state) => state.setCurrentSession);

  useEffect(() => {
    if (sessionQuery.data) {
      setCompanyState(sessionQuery.data.currentCompany);
      setSessionState(sessionQuery.data.currentSession);
    }
  }, [sessionQuery.data, sessionQuery.isLoading]);

  if (sessionQuery.isLoading) {
    return <div>Loading...</div>;
  }
  return <Outlet />;
};

export default AuthProvider;
