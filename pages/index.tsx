import styled from 'styled-components';

import { popularCurrencyCombinations } from '../src/utils/currencies';
import { Pathway } from '../src/components/Pathway';

const Home: React.FC = () => {
  return (
    <PathwaysGrid>
      {Object.entries(popularCurrencyCombinations).map(
        ([currencyCombinationName, [currencyOne, currencyTwo]]) => (
          <Pathway
            key={currencyCombinationName}
            currencyCombinationName={currencyCombinationName}
            currencyOne={currencyOne}
            currencyTwo={currencyTwo}
          />
        ),
      )}
    </PathwaysGrid>
  );
};

const PathwaysGrid = styled.div`
  display: grid;
  grid-auto-flow: dense;
  grid-template-columns: repeat(auto-fill, minmax(300px, min-content));
  grid-gap: 16px;
`;

export default Home;
