"use client";

import { Analysis } from "@/lib/analysis";

export default function CurrentGameComponent({ analysis }: { analysis: Analysis }) {
  return (
    <div>
      <h2>Current Game Component</h2>
      <h3>Faction: {analysis.playerFaction.displayName}</h3>

      <h3>Available orgs:</h3>
      <ul>
        {analysis.playerAvailableOrgs.concat(analysis.playerUnassignedOrgs).map((org) => (
          <li key={org.id}>
            {org.displayName} (ID: {org.id})
          </li>
        ))}
      </ul>
    </div>
  );
}
