import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import Navbar from "../components/Navbar";
import { runClaimsEngine } from "../services/adminService";

export default function Admin({ user }) {
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    const unsubClaims = onSnapshot(collection(db, "claims"), (snap) => {
      setClaims(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      unsubUsers();
      unsubClaims();
    };
  }, []);

  const handleRunClaims = async () => {
    setLoading(true);
    try {
      const res = await runClaimsEngine("admin-dashboard");
      setSummary(res.data ?? res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <Navbar user={user} isAdmin={true} />
      <main className="main">
        <section className="header-row">
          <div>
            <h2>Admin Dashboard</h2>
            <p className="muted">Manage users and automated claims engine.</p>
          </div>
          <button className="btn" onClick={handleRunClaims} disabled={loading}>
            {loading ? "Running..." : "Run Claims Engine"}
          </button>
        </section>

        {summary && (
          <section className="cards-row">
            <div className="card">
              <h3>Claims Summary</h3>
              <p>Processed Users: {summary.processed_users}</p>
              <p>Claims Approved: {summary.claims_approved}</p>
              <p>Total Payout: ₹{summary.total_payout}</p>
            </div>
          </section>
        )}

        <section className="claims-row grid-two">
          <div className="card">
            <h3>Users</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Zone</th>
                  <th>Plan</th>
                  <th>Wallet</th>
                  <th>Admin</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.zone}</td>
                    <td>{u.plan}</td>
                    <td>₹{u.wallet_balance?.toFixed?.(2) ?? "0.00"}</td>
                    <td>{u.isAdmin ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>Claims Logs</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>GWDI</th>
                  <th>Payout</th>
                  <th>Reason</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c) => (
                  <tr key={c.id}>
                    <td>{c.userId}</td>
                    <td>{c.gwdi_score?.toFixed?.(3)}</td>
                    <td>₹{c.payout?.toFixed?.(2)}</td>
                    <td>{c.reason}</td>
                    <td>{new Date(c.timestamp?.toDate?.() ?? c.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
