/* src/elements/GameContentView.tsx */
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { CouncilList, NewCouncilForm } from '../components/CouncilForms';
import { useNodeData } from '../hooks/useNodeData';

export const GameContentView = () => {
  const { node } = useParams<{ node?: string }>();
  const history = useHistory();
  const [data, setData] = useState<Record<string, any>>(null);

  // Default to councilors if no node supplied
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
