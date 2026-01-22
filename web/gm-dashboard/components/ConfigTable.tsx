"use client";

import { useMemo, useState } from "react";

type ConfigRecord = {
  id: string;
  name: string;
  value: string;
  scope: string;
  owner: string;
  updated: string;
};

type ColumnDefinition = {
  key: keyof ConfigRecord;
  label: string;
};

const columns: ColumnDefinition[] = [
  { key: "name", label: "Config Name" },
  { key: "value", label: "Value" },
  { key: "scope", label: "Scope" },
  { key: "owner", label: "Owner" },
  { key: "updated", label: "Updated" },
  { key: "id", label: "Change ID" },
];

const configs: ConfigRecord[] = [
  {
    id: "cfg-1124",
    name: "Festival XP Boost",
    value: "1.5x",
    scope: "Events",
    owner: "Live Ops",
    updated: "Tonight 20:00 UTC",
  },
  {
    id: "cfg-1198",
    name: "Gem Pack A",
    value: "$7.99",
    scope: "Shop",
    owner: "Monetization",
    updated: "Tomorrow 09:00 UTC",
  },
  {
    id: "cfg-1202",
    name: "Detection Tier",
    value: "Tier 3",
    scope: "Anti-cheat",
    owner: "Security",
    updated: "Staged 30%",
  },
  {
    id: "cfg-1215",
    name: "PVP Matchmaking",
    value: "Expanded",
    scope: "Gameplay",
    owner: "Systems",
    updated: "Rolling 50%",
  },
];

const uniqueValues = (items: ConfigRecord[], key: keyof ConfigRecord) =>
  Array.from(new Set(items.map((item) => String(item[key]))));

export default function ConfigTable() {
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [sortBy, setSortBy] = useState<keyof ConfigRecord>("name");

  const filteredConfigs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return configs
      .filter((config) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          [config.name, config.value, config.scope, config.owner]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesScope =
          scopeFilter === "All" || config.scope === scopeFilter;
        const matchesOwner =
          ownerFilter === "All" || config.owner === ownerFilter;

        return matchesQuery && matchesScope && matchesOwner;
      })
      .sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];
        return String(valueA).localeCompare(String(valueB));
      });
  }, [query, scopeFilter, ownerFilter, sortBy]);

  const scopeOptions = uniqueValues(configs, "scope");
  const ownerOptions = uniqueValues(configs, "owner");

  return (
    <div className="table-card">
      <div className="table-controls" aria-label="Configuration filters">
        <div className="table-controls__search">
          <label className="field">
            <span className="field__label">Search</span>
            <input
              type="search"
              placeholder="Search configs, values, owners"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="table-controls__filters">
          <label className="field">
            <span className="field__label">Scope</span>
            <select
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
            >
              <option value="All">All</option>
              {scopeOptions.map((scope) => (
                <option key={scope} value={scope}>
                  {scope}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Owner</span>
            <select
              value={ownerFilter}
              onChange={(event) => setOwnerFilter(event.target.value)}
            >
              <option value="All">All</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="field__label">Sort by</span>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as keyof ConfigRecord)
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
      <div className="table-wrapper" aria-label="Configuration records table">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.map((config) => (
              <tr key={config.id}>
                <td>{config.name}</td>
                <td>{config.value}</td>
                <td>{config.scope}</td>
                <td>{config.owner}</td>
                <td>{config.updated}</td>
                <td>{config.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
