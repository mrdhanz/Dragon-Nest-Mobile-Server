export default function HomePage() {
  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">Operations Overview</div>
          <p>Monitor live servers, player health, and recent admin actions.</p>
        </div>
        <div className="actions">
          <button className="button">Export Snapshot</button>
          <button className="button button--primary">Create Incident</button>
        </div>
      </div>
      <div className="table-wrapper" aria-label="Active alerts">
        <table className="table">
          <thead>
            <tr>
              <th>Alert</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Opened</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Latency spike</td>
              <td>NA-East</td>
              <td>Network Ops</td>
              <td>
                <span className="status-pill status-pill--warning">Investigating</span>
              </td>
              <td>6 min ago</td>
            </tr>
            <tr>
              <td>Login queue overflow</td>
              <td>AP-South</td>
              <td>GM Team</td>
              <td>
                <span className="status-pill status-pill--danger">Major</span>
              </td>
              <td>18 min ago</td>
            </tr>
            <tr>
              <td>Patch rollout</td>
              <td>EU-West</td>
              <td>Release</td>
              <td>
                <span className="status-pill status-pill--online">Stable</span>
              </td>
              <td>45 min ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
