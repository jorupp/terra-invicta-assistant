"use client";

import { ShowEffects } from "@/components/showEffects";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Analysis } from "@/lib/analysis";
import { MissionDataName, TraitDataName } from "@/lib/template-types-generated";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { TraitIcons } from "@/components/icons";
import { twMerge } from "tailwind-merge";
import { orgTransferFactor, ScoreResult } from "./councilor-scoring";

export function CouncilorTableHeader({ hasOrgs }: { hasOrgs?: boolean }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Modified Stats</TableHead>
        {hasOrgs && <TableHead>Org Tiers</TableHead>}
        <TableHead>Monthly Effects</TableHead>
        <TableHead>Priorities</TableHead>
        <TableHead>Science</TableHead>
        <TableHead>Missions</TableHead>
        <TableHead>Score</TableHead>
        <TableHead>NM Score</TableHead>
        <TableHead>CP Cap</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function OrgTableHeader({ costHeader }: { costHeader?: string }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Org Name</TableHead>
        <TableHead>Requirements</TableHead>
        <TableHead>Tier</TableHead>
        {costHeader ? <TableHead>{costHeader}</TableHead> : <TableHead>Purchase / Transfer</TableHead>}
        <TableHead>Monthly</TableHead>
        <TableHead>Effects</TableHead>
        <TableHead>Score</TableHead>
        <TableHead>NM Score</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function CouncilorTableRow({
  councilor,
  stats,
  label,
  hasOrgs,
  highlightMissionClassName,
}: {
  councilor: Analysis["playerCouncilors"][number] & { score?: ScoreResult };
  stats: Analysis["playerCouncilors"][number]["effectsWithOrgsAndAugments"];
  label: string;
  hasOrgs?: boolean;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
}) {
  const admin = Math.min(25, Math.max(0, (stats.administration || 0) + (stats.Administration || 0)));
  const orgTiers = councilor.orgs.reduce((a, b) => a + b.tier, 0);
  const cpCap =
    Math.min(25, Math.max(0, stats.persuasion || 0) + Math.max(0, stats.Persuasion || 0)) +
    Math.min(25, Math.max(0, stats.command || 0) + Math.max(0, stats.Command || 0)) +
    Math.min(25, Math.max(0, stats.administration || 0) + Math.max(0, stats.Administration || 0));
  return (
    <TableRow key={`${councilor.id}-${label}`}>
      <TableCell>{label}</TableCell>
      <TableCell>
        <ShowEffects
          persuasion={stats.persuasion}
          command={stats.command}
          investigation={stats.investigation}
          espionage={stats.espionage}
          administration={stats.administration}
          science={stats.science}
          security={stats.security}
          Persuasion={stats.Persuasion}
          Command={stats.Command}
          Investigation={stats.Investigation}
          Espionage={stats.Espionage}
          Administration={stats.Administration}
          Science={stats.Science}
          Security={stats.Security}
          ApparentLoyalty={stats.ApparentLoyalty}
          Loyalty={stats.Loyalty}
          maxLoyalty={stats.maxLoyalty}
          xpModifier={stats.xpModifier}
          xp={stats.xp}
          traitTemplateNames={stats.traitTemplateNames}
          typeTemplateName={stats.typeTemplateName}
          playerIntel={stats.playerIntel}
          playerMaxIntel={stats.playerMaxIntel}
          lastRecordedLoyalty={stats.lastRecordedLoyalty}
        />
      </TableCell>
      {hasOrgs && (
        <TableCell>
          <ShowEffects tier={stats.tier} highlightTier={orgTiers < admin} />
        </TableCell>
      )}
      <TableCell>
        <ShowEffects
          incomeBoost_month={stats.incomeBoost_month}
          incomeMoney_month={stats.incomeMoney_month}
          incomeInfluence_month={stats.incomeInfluence_month}
          incomeOps_month={stats.incomeOps_month}
          incomeMissionControl={stats.incomeMissionControl}
          incomeResearch_month={stats.incomeResearch_month}
          projectCapacityGranted={stats.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects
            economyBonus={stats.economyBonus}
            welfareBonus={stats.welfareBonus}
            environmentBonus={stats.environmentBonus}
            knowledgeBonus={stats.knowledgeBonus}
            governmentBonus={stats.governmentBonus}
            unityBonus={stats.unityBonus}
            militaryBonus={stats.militaryBonus}
            oppressionBonus={stats.oppressionBonus}
            spoilsBonus={stats.spoilsBonus}
            spaceDevBonus={stats.spaceDevBonus}
            spaceflightBonus={stats.spaceflightBonus}
            MCBonus={stats.MCBonus}
            miningBonus={stats.miningBonus}
          />
        </span>
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects councilorTechBonus={stats.councilorTechBonus} techBonuses={stats.techBonuses} />
        </span>
      </TableCell>
      <TableCell>
        <span className="text-wrap leading-6 -my-2 inline-block">
          <ShowEffects
            missionsGrantedNames={stats.missionsGrantedNames}
            highlightMissionClassName={highlightMissionClassName}
          />
        </span>
      </TableCell>
      {councilor.score === undefined ? null : (
        <>
          <TableCell>
            <Tooltip>
              <TooltipTrigger>{councilor.score.value?.toFixed(2)}</TooltipTrigger>
              <TooltipContent align="end" className="max-w-auto">
                <pre className="p-2">{councilor.score.details}</pre>
              </TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>{councilor.score.noMissionScore?.toFixed(2)}</TableCell>
          <TableCell>{cpCap?.toFixed(0)}</TableCell>
        </>
      )}
    </TableRow>
  );
}

export function OrgTableRow({
  org,
  playerNationIds,
  playerTraits,
  highlightMissionClassName,
  isTakeover,
}: {
  org: Analysis["playerAvailableOrgs"][number] & {
    type?: string;
    score?: ScoreResult;
    councilor?: string;
    councilorId?: number;
  };
  playerNationIds: Set<number>;
  playerTraits: Set<string>;
  highlightMissionClassName?: (missionName: MissionDataName) => string | undefined;
  isTakeover?: boolean;
}) {
  const missingRequiredTraits = org.template?.requiredOwnerTraits?.filter((t) => !playerTraits.has(t)) || [];
  function traitIcon(trait: TraitDataName, Fallback: typeof PlusCircleIcon) {
    return TraitIcons[trait] || Fallback;
  }
  return (
    <TableRow
      key={org.id}
      className={twMerge(org.isAdminOrg ? "bg-green-100" : "", org.type === "unassigned" ? "bg-yellow-100" : "")}
    >
      <TableCell>{org.displayName}</TableCell>
      <TableCell>
        {org.template?.requiresNationality && (
          <span className="mr-1" title={`Required Nation: ${org.homeNationName || ""}`}>
            {playerNationIds.has(org.homeNationId || -1) ? (
              <PlusCircleIcon className="inline h-4 w-4 stroke-green-700 -mt-1 bg-transparent" />
            ) : (
              <MinusCircleIcon className="inline h-4 w-4 stroke-destructive -mt-1" />
            )}
          </span>
        )}
        {org.template?.requiredOwnerTraits && (
          <span className="mr-1" title={"Required Traits: " + org.template.requiredOwnerTraits.join(", ")}>
            {missingRequiredTraits.length === 0
              ? org.template.requiredOwnerTraits.map((trait, ix) => {
                  const Icon = traitIcon(trait, PlusCircleIcon);
                  return <Icon key={ix} className="inline h-4 w-4 stroke-green-700 -mt-1" />;
                })
              : missingRequiredTraits.map((trait, ix) => {
                  const Icon = traitIcon(trait, MinusCircleIcon);
                  return <Icon key={ix} className="inline h-4 w-4 stroke-destructive -mt-1" />;
                })}
          </span>
        )}
        {org.template?.prohibitedOwnerTraits && (
          <span className="mr-1" title={"Prohibited Traits: " + org.template.prohibitedOwnerTraits.join(", ")}>
            {org.template.prohibitedOwnerTraits.map((trait, ix) => {
              const Icon = traitIcon(trait, MinusCircleIcon);
              return <Icon key={ix} className="inline h-4 w-4 stroke-blue-700 -mt-1" />;
            })}
          </span>
        )}
      </TableCell>
      <TableCell>
        <ShowEffects tier={org.tier} />
      </TableCell>
      <TableCell>
        {org.type === "unassigned" && "T "}
        {org.type === "available" || org.type === "unassigned" ? (
          <ShowEffects
            costMoney={(org.costMoney || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
            costInfluence={(org.costInfluence || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
            costOps={(org.costOps || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
            costBoost={(org.costBoost || 0) * (org.type === "available" ? 1 : orgTransferFactor)}
          />
        ) : org.type == "stealable" && isTakeover ? (
          (() => {
            const target = org as any as Analysis["playerStealableOrgs"][number];
            return (
              <>
                {target.councilor ?? "Unassigned"} from {target.faction?.displayName}, Admin: {target.admin} +
                takeoverDefense: {target.takeoverDefense}
              </>
            );
          })()
        ) : org.type === "used" ? (
          <>{org.councilor ?? "Unassigned"}</>
        ) : null}
      </TableCell>
      <TableCell>
        <ShowEffects
          incomeBoost_month={org.incomeBoost_month}
          incomeMoney_month={org.incomeMoney_month}
          incomeInfluence_month={org.incomeInfluence_month}
          incomeOps_month={org.incomeOps_month}
          incomeMissionControl={org.incomeMissionControl}
          incomeResearch_month={org.incomeResearch_month}
          projectCapacityGranted={org.projectCapacityGranted}
        />
      </TableCell>
      <TableCell>
        <ShowEffects
          persuasion={org.persuasion}
          command={org.command}
          investigation={org.investigation}
          espionage={org.espionage}
          administration={org.administration}
          science={org.science}
          security={org.security}
          economyBonus={org.economyBonus}
          welfareBonus={org.welfareBonus}
          environmentBonus={org.environmentBonus}
          knowledgeBonus={org.knowledgeBonus}
          governmentBonus={org.governmentBonus}
          unityBonus={org.unityBonus}
          militaryBonus={org.militaryBonus}
          oppressionBonus={org.oppressionBonus}
          spoilsBonus={org.spoilsBonus}
          spaceDevBonus={org.spaceDevBonus}
          spaceflightBonus={org.spaceflightBonus}
          MCBonus={org.MCBonus}
          miningBonus={org.miningBonus}
          techBonuses={org.template?.techBonuses}
          missionsGrantedNames={org.template?.missionsGrantedNames || []}
          highlightMissionClassName={highlightMissionClassName}
        />
      </TableCell>
      {org.score === undefined ? null : (
        <>
          <TableCell>
            <Tooltip>
              <TooltipTrigger>{org.score.value?.toFixed(2)}</TooltipTrigger>
              <TooltipContent align="end" className="max-w-auto">
                <pre className="p-2">{org.score.details}</pre>
              </TooltipContent>
            </Tooltip>
          </TableCell>
          <TableCell>{org.score.noMissionScore?.toFixed(2)}</TableCell>
        </>
      )}
    </TableRow>
  );
}
