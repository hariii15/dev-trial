import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Navbar({ user, isAdmin }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left" onClick={() => navigate("/dashboard")}>Safra</div>
      <div className="navbar-right">
        {isAdmin && (
          <button className="nav-link" onClick={() => navigate("/admin")}>
            Admin
          </button>
        )}
        <span className="nav-user">{user?.email}</span>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
