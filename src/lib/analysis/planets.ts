import { SaveFile } from "../savefile";

export function analyzePlanets(saveFile: SaveFile) {
  const planets = saveFile.gamestates["PavonisInteractive.TerraInvicta.TISpaceBodyState"];
  const sol = planets.find((i) => i.Value.templateName === "Sol")?.Key.value;
  const earth = planets.find((i) => i.Value.templateName === "Earth")?.Key.value;
  if (!sol) {
    throw new Error("Sol planet data not found in save file.");
  }
  if (!earth) {
    throw new Error("Earth planet data not found in save file.");
  }
  const orbitsById = new Map(
    saveFile.gamestates["PavonisInteractive.TerraInvicta.TIOrbitState"].map(({ Value: orbit }) => [
      orbit.ID.value,
      {
        id: orbit.ID.value,
        displayName: orbit.displayName,
        templateName: orbit.templateName,
        barycenterId: orbit.barycenter.value,
      },
    ]),
  );
  const bodiesById = new Map(
    planets.map(({ Value: body }) => [
      body.ID.value,
      {
        id: body.ID.value,
        displayName: body.displayName,
        templateName: body.templateName,
        barycenterId: body.barycenter?.value,
        solarMirrorBonusByFactionId: new Map(body.solarMirrorBonus.map((i) => [i.Key.value, i.Value])),
      },
    ]),
  );

  return { sol, earth, orbitsById, bodiesById, planets };
}
