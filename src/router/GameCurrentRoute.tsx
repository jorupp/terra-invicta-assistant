/* src/router/GameCurrentRoute.tsx */
import { Route } from 'react-router-dom';
import { GameCurrentPage } from '../pages/GameCurrentPage';

export const GameCurrentRoute = () => (
  <Route path="/game/current" element={<GameCurrentPage />} />
);