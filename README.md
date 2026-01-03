This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Goals

This is a utility designed to be run on a second screen alongside [Terra Invicta](https://store.steampowered.com/app/1176470/Terra_Invicta/) ([wiki](https://wiki.hoodedhorse.com/Terra_Invicta/Terra_Invicta_Official_Wiki)).  It is designed to provide a deeper insight into the current state of a game, and to help with planning and decision making.  It does not aim to replace the in-game UI, nor to allow you to see information that is normally not available to you in the game (ie. locations/skills of non-visible enemy councilors, detailed stats of enemy ships, etc), but provide a more convenient way to view information that is already available in the game.

Things this utility intends to provide:

- Fleets headed towards/around planets/SOIs the player should be interested in (Earth, has player assets in or fleets heading towards) - can save you having to watch for alien ships heading to Earth/Mars/etc. like a hawk.
- Stat summary of available councilors (especially as compared to the ones you already have) - can help you decide who to recruit.
- Stat summary of available orgs (especially as compared to the ones you already have) - can help you decide which orgs to grab.
- Stat summary of _visible_ enemy councilors and their orgs - can help you decide who to target for assassination, turning, trade, or hostile takeover.
- Summary of visible stealable tech.
- Summary of current state of global research (ie. your current relative to the leader/second place).
- Summary of current state of your construction (ie. how long until y).
- (if not too cheaty) Alien hate value.

## Data sources

1. Terra Invicta Save Game - primary source of data, contains most of the information about the current game state.  Default location is `My Games\TerraInvicta\Saves`.
2. Terra Invicta Game Files - secondary source of data, contains static information about councilors, orgs, techs, ships, etc.  Default location is `steamapps\common\Terra Invicta\TerraInvicta_Data\StreamingAssets\Templates`.

