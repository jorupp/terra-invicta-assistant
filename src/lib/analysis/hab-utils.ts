/**
 * Helper functions for hab-related calculations
 */

export function getSolarMultiplier(id: number | undefined): number | undefined {
  if (!id) return undefined;

  // TODO: find something in data files or something to drive this - or maybe it's dynamic based on semi-major axis + latitude???
  // anyway for now, just hard-code
  switch (id) {
    case 4834:
    case 4835:
    case 4838:
    case 4840:
      return 3.34;
    case 4841:
      return 4.98;
    case 4847:
      return 0.762;
    case 4846:
      return 0.773;
    case 4855:
      return 0.781;
    case 4885:
    case 4886:
    case 4889:
    case 4891:
    case 4896:
    case 4875:
    case 4884:
    case 4877:
    case 4894:
    case 4887:
    case 4897:
    case 4880:
    case 4895:
    case 4882:
    case 4879:
    case 4874:
    case 4876:
    case 4837:
    case 4836:
    case 4839:
      return 0.162; // all the mars surface ones
    case 4830:
      return 6.04; // Low Mercury
    case 4855:
      return 0.781; // Low Luna
  }

  return undefined;
}

export function getMineMultiplier(id: number | undefined): number {
  if (!id) return 2;

  // TODO: find something in data files or something to drive this - or maybe it's dynamic based on distance + gravity???
  // some from https://wiki.hoodedhorse.com/Terra_Invicta/Habs
  switch (id) {
    // some random asteroids/comets
    case 166:
    case 186:
    case 117:
    case 167:
    case 108:
    case 247:
    case 238:
    case 373:
    case 200:
    case 236:
    case 220:
      return 0.5077;
    case 6: // Luna
      return 0.5077;
    case 7: // Mars
      return 0.9342;
    case 102: // Ceres
      return 0.7699;
    case 3: // Mercury
      return 1.9641;
    // case 1: // Callisto
    //   return 0.9123;
    // case 1: // Io
    //   return 1.4960;
    // case 1: // Titan
    //   return 0.8865;
    // case 1: // Pluto
    //   return 1.5029 ;
  }

  return 2;
}
