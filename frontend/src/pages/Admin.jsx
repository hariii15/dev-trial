import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import Navbar from "../components/Navbar";
import { runClaimsEngine, runClaimTest } from "../services/adminService";

export default function Admin({ user }) {
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState("");
  const [testGwdi, setTestGwdi] = useState(0.5);
  const [testActivity, setTestActivity] = useState(0.5);
  const [testResult, setTestResult] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);

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
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTestClaim = async () => {
    if (!testUserId) return;
    setLoadingTest(true);
    setTestResult(null);

    try {
      const res = await runClaimTest(testUserId, {
        gwdi_score: Number(testGwdi),
        activity: Number(testActivity)
      });
      setTestResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTest(false);
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

        <section className="cards-row admin-top-row">
          <div className="card admin-summary-card">
            <div className="card-header">
              <h3>Claims Summary</h3>
            </div>
            <div className="summary-values">
              <div>
                <span>Processed Users</span>
                <strong>{summary?.processed_users ?? 0}</strong>
              </div>
              <div>
                <span>Claims Approved</span>
                <strong>{summary?.claims_approved ?? 0}</strong>
              </div>
              <div>
                <span>Total Payout</span>
                <strong>₹{summary?.total_payout?.toFixed?.(2) ?? "0.00"}</strong>
              </div>
            </div>
          </div>

          <div className="card admin-test-card">
            <div className="card-header">
              <h3>Run Test Claim</h3>
            </div>
            <p className="muted">Simulate a claim event for a selected user using custom GWDI and activity values.</p>
            <div className="field-group">
              <label>User</label>
              <select value={testUserId} onChange={(e) => setTestUserId(e.target.value)}>
                <option value="">Select a user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.id} ({u.plan || "plan"})
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label>GWDI: {testGwdi.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={testGwdi}
                onChange={(e) => setTestGwdi(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Activity: {testActivity.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={testActivity}
                onChange={(e) => setTestActivity(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={handleRunTestClaim} disabled={!testUserId || loadingTest}>
              {loadingTest ? "Running Test..." : "Run Test Claim"}
            </button>
            {testResult && (
              <div className="test-result">
                <p>
                  <strong>Result:</strong> {testResult.eligible ? "Eligible" : "Not eligible"}
                </p>
                <p>GWDI: {testResult.gwdi_score.toFixed(2)}</p>
                <p>Activity: {testResult.activity.toFixed(2)}</p>
                <p>Payout: ₹{testResult.payout?.toFixed?.(2) ?? "0.00"}</p>
                <p>Reason: {testResult.reason}</p>
                <p>Triggered By: {testResult.triggered_by}</p>
              </div>
            )}
          </div>
        </section>

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
                  <th>Trust</th>
                  <th>Last Claim</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.zone}</td>
                    <td>{u.plan}</td>
                    <td>₹{u.wallet_balance?.toFixed?.(2) ?? "0.00"}</td>
                    <td>{u.trust_score?.toFixed?.(2) ?? "-"}</td>
                    <td>{u.last_claim_time ? new Date(u.last_claim_time?.toDate?.() ?? u.last_claim_time).toLocaleString() : "-"}</td>
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
                  <th>Triggered By</th>
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
                    <td>{c.triggered_by ?? "-"}</td>
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
