import ConfigTable from "../../components/ConfigTable";

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
      <ConfigTable />
    </div>
  );
}
