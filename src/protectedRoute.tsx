import {Outlet, Navigate} from "react-router";
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const user = useAuth();
  return user ? <Outlet/> : <Navigate to = "/login" />
}

export default ProtectedRoute 