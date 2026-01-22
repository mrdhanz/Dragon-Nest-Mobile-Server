export default function PlayersPage() {
  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">Player Operations</div>
          <p>Review escalations, bans, and player support workflows.</p>
        </div>
        <div className="actions">
          <button className="button">Open Support Queue</button>
          <button className="button button--primary">Issue Reward</button>
        </div>
      </div>
      <div className="table-wrapper" aria-label="Player escalation table">
        <table className="table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Region</th>
              <th>Case</th>
              <th>Priority</th>
              <th>Owner</th>
              <th>Last Touch</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SkyRider#4421</td>
              <td>NA-East</td>
              <td>Chargeback dispute</td>
              <td>
                <span className="status-pill status-pill--danger">High</span>
              </td>
              <td>GM Lina</td>
              <td>2 min ago</td>
            </tr>
            <tr>
              <td>Moonkeeper#8890</td>
              <td>EU-West</td>
              <td>Guild rename</td>
              <td>
                <span className="status-pill status-pill--online">Normal</span>
              </td>
              <td>GM Tariq</td>
              <td>14 min ago</td>
            </tr>
            <tr>
              <td>RiftWalker#1337</td>
              <td>AP-South</td>
              <td>Anti-cheat appeal</td>
              <td>
                <span className="status-pill status-pill--warning">Review</span>
              </td>
              <td>GM Yuna</td>
              <td>31 min ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
