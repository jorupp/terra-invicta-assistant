import { analyzeData } from "@/lib/analysis";
import RenderCurrentGame from "./renderCurrentGame";

const currentGamePath = process.env.CURRENT_GAME!;
if (!currentGamePath) {
  throw new Error("CURRENT_GAME environment variable is not set.");
}

export default async function CurrentGamePage() {
  // intentially-failing call to analysis so that HMR kicks in when the analysis code changes
  try {
    await (analyzeData as any)();
  } catch {}
  const rnd = Math.random();

  return <RenderCurrentGame renderKey={rnd} />;
}
