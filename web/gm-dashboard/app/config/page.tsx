export default function ConfigPage() {
  return (
    <div className="card">
      <div className="page-header">
        <div>
          <div className="page-title">Live Configuration</div>
          <p>Manage feature flags, events, and scheduled updates.</p>
        </div>
        <div className="actions">
          <button className="button">Preview Changes</button>
          <button className="button button--primary">Publish Config</button>
        </div>
      </div>
      <div className="table-wrapper" aria-label="Configuration changes table">
        <table className="table">
          <thead>
            <tr>
              <th>Module</th>
              <th>Setting</th>
              <th>Current</th>
              <th>Proposed</th>
              <th>Owner</th>
              <th>Rollout</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Events</td>
              <td>Festival XP Boost</td>
              <td>1.2x</td>
              <td>1.5x</td>
              <td>Live Ops</td>
              <td>Tonight 20:00 UTC</td>
            </tr>
            <tr>
              <td>Shop</td>
              <td>Gem Pack A</td>
              <td>$9.99</td>
              <td>$7.99</td>
              <td>Monetization</td>
              <td>Tomorrow 09:00 UTC</td>
            </tr>
            <tr>
              <td>Anti-cheat</td>
              <td>Detection Tier</td>
              <td>Tier 2</td>
              <td>Tier 3</td>
              <td>Security</td>
              <td>Staged 30%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
