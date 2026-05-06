import { Route } from "next/router"; // use useRouter in pages, but Route component uses next/router imports
import { GameCurrentPage } from "../pages/GameCurrentPage";

export const GameCurrentRoute = () => (
  <Route path="/game/current" element={<GameCurrentPage />} />
);
