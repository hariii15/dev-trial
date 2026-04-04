import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ user, requireAdmin = false, children }) {
  if (!user) return <Navigate to="/login" replace />;

  if (requireAdmin && !user.isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}
