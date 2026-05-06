import { useRouter } from "next/router";
import { Link } from "next/link";
import { useState } from "react";
import { TreeView, TreeNode, Box } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Tooltip from "@mui/material/Tooltip";

// static tree definition
const treeData = {
  id: "councilors",
  label: "Councilors",
  subtitle: "Score: 12 34",
  children: [
    { id: "existing", label: "Existing Council" },
    { id: "find", label: "Find new" },
  ],
};

export const LeftNavTree = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["councilors"]));

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
    // Update URL to preserve selection across navigation
    const params = new URLSearchParams(router.query);
    if (isExpanded) {
      params.set("node", nodeId);
    } else {
      params.delete("node");
    }
    router.push({
      pathname: router.pathname,
      query: params,
    });
  };

  const renderNode = (node: typeof treeData) => (
    <TreeNode
      key={node.id}
      nodeData={node}
      expanded={expanded.has(node.id)}
      onExpandChange={(_event, data) => handleExpandChange(data.nodeId, true)}
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
