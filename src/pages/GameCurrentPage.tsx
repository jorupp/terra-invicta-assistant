import { useRouter } from "next/router";
import { LeftNavTree } from "../components/LeftNavTree";
import { GameContentView } from "../components/GameContentView";

export const GameCurrentPage = () => {
  const router = useRouter();
  const node = router.query.node ? router.query.node : "councilors";

  return (
    <div style={{ display: "flex" }}>
      <LeftNavTree />
      <main style={{ flex: 1, marginLeft: 24 }}>
        <GameContentView node={node} />
      </main>
    </div>
  );
};
