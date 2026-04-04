export default function ClaimsTable({ claims }) {
  if (!claims?.length) return (
    <div className="card">
      <h3>Claims History</h3>
      <p className="muted">No claims yet.</p>
    </div>
  );

  return (
    <div className="card">
      <h3>Claims History</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>GWDI</th>
            <th>Payout</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id}>
              <td>{new Date(c.timestamp?.toDate?.() ?? c.timestamp).toLocaleString()}</td>
              <td>{c.gwdi_score?.toFixed?.(3)}</td>
              <td>₹{c.payout?.toFixed?.(2)}</td>
              <td>{c.reason}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
