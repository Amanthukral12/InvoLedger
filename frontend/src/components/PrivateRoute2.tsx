import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute2 = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  return isAuthenticated === null ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute2;
