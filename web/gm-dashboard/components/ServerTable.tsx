"use client";

import { useMemo, useState } from "react";

type ServerStatus = "Healthy" | "Degraded" | "At Risk" | "Offline";

type ServerRecord = {
  id: string;
  region: string;
  version: string;
  status: ServerStatus;
  players: number;
  latency: number;
  updated: string;
};

type ColumnDefinition = {
  key: keyof ServerRecord;
  label: string;
};

const columns: ColumnDefinition[] = [
  { key: "id", label: "Server ID" },
  { key: "status", label: "Status" },
  { key: "region", label: "Region" },
  { key: "version", label: "Version" },
  { key: "players", label: "Players" },
  { key: "latency", label: "Latency" },
  { key: "updated", label: "Last Update" },
];

const servers: ServerRecord[] = [
  {
    id: "srv-na-12",
    region: "NA-East",
    version: "1.8.2",
    status: "Healthy",
    players: 18204,
    latency: 42,
    updated: "2 min ago",
  },
  {
    id: "srv-eu-07",
    region: "EU-West",
    version: "1.8.1",
    status: "Degraded",
    players: 14482,
    latency: 68,
    updated: "7 min ago",
  },
  {
    id: "srv-ap-03",
    region: "AP-South",
    version: "1.8.2",
    status: "At Risk",
    players: 21115,
    latency: 83,
    updated: "12 min ago",
  },
  {
    id: "srv-na-05",
    region: "NA-West",
    version: "1.8.0",
    status: "Offline",
    players: 0,
    latency: 0,
    updated: "45 min ago",
  },
];

const statusClassName: Record<ServerStatus, string> = {
  Healthy: "status-pill status-pill--online",
  Degraded: "status-pill status-pill--warning",
  "At Risk": "status-pill status-pill--danger",
  Offline: "status-pill status-pill--muted",
};

const uniqueValues = (items: ServerRecord[], key: keyof ServerRecord) =>
  Array.from(new Set(items.map((item) => String(item[key]))));

export default function ServerTable() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [sortBy, setSortBy] = useState<keyof ServerRecord>("region");

  const filteredServers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return servers
      .filter((server) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [server.id, server.region, server.version, server.status]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesStatus =
          statusFilter === "All" || server.status === statusFilter;
        const matchesRegion =
          regionFilter === "All" || server.region === regionFilter;

        return matchesQuery && matchesStatus && matchesRegion;
      })
      .sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];
        if (typeof valueA === "number" && typeof valueB === "number") {
          return valueB - valueA;
        }
        return String(valueA).localeCompare(String(valueB));
      });
  }, [query, statusFilter, regionFilter, sortBy]);

  const regionOptions = uniqueValues(servers, "region");
  const statusOptions = uniqueValues(servers, "status");

  return (
    <div className="table-card">
      <div className="table-controls" aria-label="Server filters">
        <div className="table-controls__search">
          <label className="field">
            <span className="field__label">Search</span>
            <input
              type="search"
              placeholder="Search by server ID, region, version"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="table-controls__filters">
          <label className="field">
            <span className="field__label">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Region</span>
            <select
              value={regionFilter}
              onChange={(event) => setRegionFilter(event.target.value)}
            >
              <option value="All">All</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Sort by</span>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as keyof ServerRecord)
              }
            >
              {columns.map((column) => (
                <option key={column.key} value={column.key}>
                  {column.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="table-wrapper" aria-label="Server status table">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredServers.map((server) => (
              <tr key={server.id}>
                <td>{server.id}</td>
                <td>
                  <span className={statusClassName[server.status]}>
                    {server.status}
                  </span>
                </td>
                <td>{server.region}</td>
                <td>{server.version}</td>
                <td>{server.players.toLocaleString()}</td>
                <td>{server.latency ? `${server.latency} ms` : "-"}</td>
                <td>{server.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
