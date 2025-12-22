import PortfolioTable from '../Components/portifolioTable';
import { portfolio } from '../Data/portifolio';

export default function Home() {
  return (
    <main className='p-6'>
      <h1 className='text-xl font-semibold mb-4'>
        Portfolio Dashboard
      </h1>
      <PortfolioTable data={portfolio}/>
    </main>
  )
}