import RenderCurrentGame from "./renderCurrentGame";

const currentGamePath = process.env.CURRENT_GAME!;
if (!currentGamePath) {
  throw new Error("CURRENT_GAME environment variable is not set.");
}

export default async function CurrentGamePage() {
  return <RenderCurrentGame />;
}
