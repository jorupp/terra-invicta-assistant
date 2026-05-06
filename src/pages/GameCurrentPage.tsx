/* src/pages/GameCurrentPage.tsx */
import React from 'react';
import { LeftNavTree } from '../elements/LeftNavTree';
import { GameContentView } from '../elements/GameContentView';
import { useParams } from 'react-router-dom';

export const GameCurrentPage = () => {
  const { node } = useParams<{ node?: string }>(); // defaults to undefined
  const selectedNode = node ? node : 'councilors'; // default to councilors if none specified

  return (
    <div style={{ display: 'flex' }}>
      <LeftNavTree />
      <main style={{ flex: 1, marginLeft: 24 }}>
        <GameContentView node={selectedNode} />
      </main>
    </div>
  );
};