/* src/hooks/useNodeData.ts */
import { useEffect, useState } from 'react';
import { ScoreService, CouncilService } from '../services'; // existing services

type Node = 'councilors' | 'existing' | 'find';

export const useNodeData = (node: Node) => {
  const [data, setData] = useState<Record<string, any>>(null);

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