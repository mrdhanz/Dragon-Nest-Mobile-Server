export default function ServersPage() {
  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">Server Fleet</div>
          <p>Track regional shards, maintenance windows, and population spikes.</p>
        </div>
        <div className="actions">
          <button className="button">Schedule Maintenance</button>
          <button className="button button--primary">Deploy Hotfix</button>
        </div>
      </div>
      <div className="table-wrapper" aria-label="Server status table">
        <table className="table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Cluster</th>
              <th>Players</th>
              <th>Latency</th>
              <th>Status</th>
              <th>Next Window</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>NA-East</td>
              <td>Shard 12</td>
              <td>18,204</td>
              <td>42 ms</td>
              <td>
                <span className="status-pill status-pill--online">Healthy</span>
              </td>
              <td>Tonight 01:00 UTC</td>
            </tr>
            <tr>
              <td>EU-West</td>
              <td>Shard 07</td>
              <td>14,482</td>
              <td>68 ms</td>
              <td>
                <span className="status-pill status-pill--warning">Degraded</span>
              </td>
              <td>Tomorrow 22:00 UTC</td>
            </tr>
            <tr>
              <td>AP-South</td>
              <td>Shard 03</td>
              <td>21,115</td>
              <td>83 ms</td>
              <td>
                <span className="status-pill status-pill--danger">At Risk</span>
              </td>
              <td>Today 16:00 UTC</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
