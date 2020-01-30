import styled from 'styled-components';
// import useSWR from 'swr';

import { popularCurrencyCombinations } from '../src/utils/currencies';

// interface StashItem {
//   name: string;
//   amount: number;
// }

const Home = () => {
  // const { data, error } = useSWR<StashItem[]>('/api/stash');
  // const { data, error } = useSWR<StashItem[]>('/api/pathways');
  // if (error) return <h1>Error fetching stash currency</h1>;
  // if (!data) return <h1>Loading...</h1>;

  return (
    <PathwaysGrid>
      {Object.entries(popularCurrencyCombinations).map(
        ([currencyCombinationName, [currencyOne, currencyTwo]]) => (
          <PathwaysCard key={currencyCombinationName}>
            <Pathways>
              <Pathway>
                1 <CurrencyIcon src={currencyOne.iconUrl} />
                <Arrow>→</Arrow>
                <CurrencyIcon src={currencyTwo.iconUrl} /> 1
              </Pathway>
              <Pathway>
                1 <CurrencyIcon src={currencyOne.iconUrl} />
                <Arrow>←</Arrow>
                <CurrencyIcon src={currencyTwo.iconUrl} /> 1
              </Pathway>
            </Pathways>
            <ProfitMargin>
              <span>40%</span>
            </ProfitMargin>
          </PathwaysCard>
        ),
      )}
    </PathwaysGrid>
  );
};

const PathwaysGrid = styled.div`
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-gap: 16px;
`;

const PathwaysCard = styled.div`
  display: flex;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  width: max-content;
`;

const Pathways = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const Pathway = styled.div`
  display: flex;
  align-items: center;
  font-size: 24px;
`;

const CurrencyIcon = styled.img`
  width: 30px;
`;

const Arrow = styled.span`
  margin: 0 8px;
`;

const ProfitMargin = styled.div`
  display: flex;
  align-items: center;
  font-size: 28px;
  padding: 8px;
  color: white;
  background-color: #81c784;
`;

export default Home;
