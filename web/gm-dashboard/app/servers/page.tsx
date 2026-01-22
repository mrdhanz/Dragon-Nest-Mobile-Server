import ServerTable from "../../components/ServerTable";

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
      <ServerTable />
    </div>
  );
}
