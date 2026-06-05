import PortfolioTable from "../Components/portifolioTable";
import { portfolio } from "../Data/portifolio";

export default function Home() {
  return (
    <main>
      <PortfolioTable data={portfolio} />
    </main>
  );
}
