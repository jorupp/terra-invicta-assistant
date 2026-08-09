import { useRouter } from "next/router";
import { CouncilList, NewCouncilForm } from "../components/CouncilForms";
import { useNodeData } from "../hooks/useNodeData";

export const GameContentView = () => {
  const router = useRouter();
  const [data, setData] = useState<Record<string, any>>(null);

  const node = router.query.node ? router.query.node : "councilors";

  useEffect(() => {
    if (node) {
      setData(useNodeData(node));
    }
  }, [node]);

  switch (node) {
    case "existing":
      return <CouncilList data={data} />;
    case "find":
      return <NewCouncilForm data={data} />;
    default:
      return (
        <div>
          <h3>Councilors Overview</h3>
          <p>Score: {data?.score ?? "N/A"}</p>
        </div>
      );
  }
};
