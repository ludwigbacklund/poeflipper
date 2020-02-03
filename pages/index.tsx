import styled from 'styled-components';
import groupBy from 'lodash/groupBy';

import { popularCurrencyCombinations } from '../src/utils/currencies';
import { Pathway } from '../src/components/Pathway';
import { Fragment } from 'react';

const popularCurrencyCombinationsGroupedByCurrency = groupBy(
  popularCurrencyCombinations,
  currencyCombo => currencyCombo[1].name,
);

const Home: React.FC = () => {
  return (
    <Pathways>
      {Object.entries(popularCurrencyCombinationsGroupedByCurrency).map(
        ([currencyName, currencyCombination]) => (
          <Fragment key={currencyName}>
            <PathwaysGroupHeader>{currencyName}</PathwaysGroupHeader>
            <PathwaysGroup key={currencyName}>
              {currencyCombination.map(([currencyOne, currencyTwo]) => (
                <Pathway
                  key={currencyOne.shorthand + currencyTwo.shorthand}
                  currencyOne={currencyOne}
                  currencyTwo={currencyTwo}
                />
              ))}
            </PathwaysGroup>
          </Fragment>
        ),
      )}
    </Pathways>
  );
};

const Pathways = styled.div`
  display: flex;
  flex-direction: column;
`;

const PathwaysGroupHeader = styled.h1`
  font-size: 28px;
  margin: 0 0 8px 0;
`;

const PathwaysGroup = styled.div`
  display: flex;
  margin-bottom: 24px;
  overflow: auto;
`;

export default Home;
