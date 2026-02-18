import { SaveFile } from "../savefile";

export function analyzeHabSites(saveFile: SaveFile) {
  const habSites = saveFile.gamestates["PavonisInteractive.TerraInvicta.TIHabSiteState"].map(
    ({
      Key: { value: id },
      Value: {
        parentBody: { value: parentBodyId },
        water_day,
        volatiles_day,
        metals_day,
        nobles_day,
        fissiles_day,
      },
    }) => ({ id, parentBodyId, water_day, volatiles_day, metals_day, nobles_day, fissiles_day }),
  );
  const habSitesById = new Map<number, (typeof habSites)[0]>(habSites.map((site) => [site.id, site]));

  return { habSites, habSitesById };
}
