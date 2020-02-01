import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { Currency } from '../utils/currencies';

const prettifyNumber = (number: number): number =>
  Math.round((number + Number.EPSILON) * 100) / 100;

interface PathwayProps {
  currencyCombinationName: string;
  currencyOne: Currency;
  currencyTwo: Currency;
}

export const Pathway: React.FC<PathwayProps> = ({
  currencyCombinationName,
  currencyOne,
  currencyTwo,
}) => {
  const { data: haveData } = useSWR(
    `/api/pathway/${currencyOne.shorthand}/${currencyTwo.shorthand}`,
  );
  const { data: wantData } = useSWR(
    `/api/pathway/${currencyTwo.shorthand}/${currencyOne.shorthand}?reverseRatio=true`,
  );

  const haveRatio = haveData?.ratio;
  const wantRatio = wantData?.ratio;
  const profitMargin =
    haveRatio && wantRatio && Math.floor((1 - haveRatio / wantRatio) * 100);

  return (
    <PathwayCard key={currencyCombinationName}>
      <PathwayWrapper>
        <Exchange>
          <CurrencyIcon src={currencyOne.iconUrl} /> 1 <Arrow>←</Arrow>
          <CurrencyIcon src={currencyTwo.iconUrl} />
          {haveRatio ? prettifyNumber(haveRatio) : '?'}
        </Exchange>
        <Exchange>
          <CurrencyIcon src={currencyOne.iconUrl} /> 1<Arrow>→</Arrow>
          <CurrencyIcon src={currencyTwo.iconUrl} />
          {wantRatio ? prettifyNumber(wantRatio) : '?'}
        </Exchange>
      </PathwayWrapper>
      <ProfitMargin>
        <span>{profitMargin || '?'}%</span>
      </ProfitMargin>
    </PathwayCard>
  );
};

const PathwayCard = styled.div`
  display: flex;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  width: max-content;
`;

const PathwayWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
`;

const Exchange = styled.div`
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
