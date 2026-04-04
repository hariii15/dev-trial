export default function ClaimsTable({ claims }) {
  if (!claims?.length) return (
    <div className="card">
      <h3>Claims History</h3>
      <p className="muted">No claims yet.</p>
    </div>
  );

  const getGwdiClass = (gwdi) => {
    if (gwdi < 0.3) return 'gwdi-low';
    if (gwdi <= 0.6) return 'gwdi-medium';
    return 'gwdi-high';
  };

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
            <th>Triggered By</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((c) => (
            <tr key={c.id}>
              <td>{new Date(c.timestamp?.toDate?.() ?? c.timestamp).toLocaleString()}</td>
              <td className={getGwdiClass(c.gwdi_score)}>{c.gwdi_score?.toFixed?.(3)}</td>
              <td>₹{c.payout?.toFixed?.(2)}</td>
              <td>{c.reason}</td>
              <td>{c.triggered_by}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
