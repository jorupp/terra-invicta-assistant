/* src/elements/LeftNavTree.tsx */
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { TreeView, TreeNode, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tooltip from '@mui/material/Tooltip';

// Static tree definition
const treeData = {
  id: 'councilors',
  label: 'Councilors',
  subtitle: 'Score: 1234', // placeholder for score
  children: [
    { id: 'existing', label: 'Existing Council' },
    { id: 'find', label: 'Find new' },
    // add more sub‑items as needed
  ],
};

export const LeftNavTree = () => {
  const history = useHistory();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['councilors'])); // default expanded node

  const handleExpandChange = (nodeId: string, isExpanded: boolean) => {
    if (isExpanded) {
      setExpanded(prev => new Set([...prev, nodeId]);
    } else {
      setExpanded(prev => {
        const set = new Set(prev);
        set.delete(nodeId);
        return set;
      });
    }
    // Update URL to keep selection across navigation
    const params = new URLSearchParams(history.location.search);
    if (isExpanded) {
      params.set('node', nodeId);
    } else {
      params.delete('node');
    }
    history.push(`${history.location.pathname}?${params.toString()}`);
  };

  const renderNode = (node: typeof treeData) => (
    <TreeNode
      key={node.id}
      nodeData={node}
      expanded={expanded.has(node.id)}
      onExpandChange={(_event, data) => handleExpandChange(data.nodeId, true)} // collapse handled by same function
    >
      <Tooltip title={node.subtitle}>
        <Box>{node.label}</Box>
      </Tooltip>
    </TreeNode>
  );

  return (
    <Box width={240} marginRight={12}>
      <TreeView
        defaultExpanded={['councilors']}
        onNodeExpandChange={(_event, data) => handleExpandChange(data.nodeId, data.isExpanded!)}
      >
        {renderNode(treeData)}
      </TreeView>
    </Box>
  );
};

/* src/elements/GameContentView.tsx */
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { CouncilList, NewCouncilForm } from '../components/CouncilForms'; // assume these exist
import { useNodeData } from '../hooks/useNodeData';

export const GameContentView = () => {
  const { node } = useParams<{ node?: string }>(); // defaults to undefined
  const history = useHistory();
  const [data, setData] = useState<any>(null);

  // Default to councilors if no node specified
  const selectedNode = node ? node : 'councilors';

  useEffect(() => {
    if (selectedNode) {
      setData(useNodeData(selectedNode));
    }
  }, [selectedNode]);

  switch (selectedNode) {
    case 'existing':
      return <CouncilList data={data} />;
    case 'find':
      return <NewCouncilForm data={data} />;
    default: // councilors overview
      return (
        <div>
          <h3>Councilors Overview</h3>
          <p>Score: {data?.score ?? 'N/A'}</p>
        </div>
      );
  }
};

/* src/elements/TreeData.ts */
export const treeData = {
  id: 'councilors',
  label: 'Councilors',
  subtitle: 'Score: 1234', // placeholder
  children: [
    { id: 'existing', label: 'Existing Council' },
    { id: 'find', label: 'Find new' },
  ],
};

/* src/hooks/useNodeData.ts */
import { useEffect, useState } from 'react';
import { ScoreService, CouncilService } from '../services'; // existing services

export const useNodeData = (node: string) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (node === 'councilors') {
        const score = await ScoreService.getCurrentScore();
        setData({ score });
      } else if (node === 'existing') {
        const councils = await CouncilService.getAll();
        setData({ councils });
      } else if (node === 'find') {
        const options = await CouncilService.getFindOptions();
        setData({ options });
      }
    };
    load();
  }, [node]);

  return data;
};

/* src/pages/GameCurrentPage.tsx */
import React from 'react';
import { LeftNavTree } from '../elements/LeftNavTree';
import { GameContentView } from '../elements/GameContentView';
import { useParams } from 'react-router-dom';

export const GameCurrentPage = () => {
  const { node } = useParams<{ node?: string }>(); // defaults to undefined
  const selectedNode = node ? node : 'councilors'; // default node

  return (
    <div style={{ display: 'flex' }}>
      <LeftNavTree />
      <main style={{ flex: 1, marginLeft: 24 }}>
        <GameContentView node={selectedNode} />
      </main>
    </div>
  );
};

/* src/router/GameCurrentRoute.tsx */
import { Route } from 'react-router-dom';
import { GameCurrentPage } from '../pages/GameCurrentPage';

export const GameCurrentRoute = () => (
  <Route path="/game/current" element={<GameCurrentPage />} />
);
