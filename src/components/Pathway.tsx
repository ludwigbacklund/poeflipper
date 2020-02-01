import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { Currency } from '../utils/currencies';

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

const prettifyNumber = (number: number): number =>
  Math.round((number + Number.EPSILON) * 100) / 100;

interface PathwayProps {
  currencyOne: Currency;
  currencyTwo: Currency;
}

export const Pathway: React.FC<PathwayProps> = ({
  currencyOne,
  currencyTwo,
}) => {
  const { data: haveData } = useSWR(
    `/api/pathway/${currencyOne.shorthand}/${currencyTwo.shorthand}`,
    {
      refreshInterval: getRandomInt(90, 120) * 1000,
    },
  );
  const {
    data: wantData,
  } = useSWR(
    `/api/pathway/${currencyTwo.shorthand}/${currencyOne.shorthand}?reverseRatio=true`,
    { refreshInterval: getRandomInt(90, 120) * 1000 },
  );

  const haveRatio = haveData?.ratio;
  const wantRatio = wantData?.ratio;
  const profitMargin =
    haveRatio && wantRatio && Math.floor((1 - haveRatio / wantRatio) * 100);

  return (
    <PathwayCard
      key={currencyOne.shorthand + currencyTwo.shorthand}
      order={profitMargin ? -profitMargin : 1000}
    >
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
        <ProfitLabel>PROFIT</ProfitLabel>
        <span>{profitMargin || '?'}%</span>
      </ProfitMargin>
    </PathwayCard>
  );
};

interface PathwayCardProps {
  order: number;
}

const PathwayCard = styled.div`
  display: flex;
  width: min-content;
  order: ${({ order }: PathwayCardProps) => order};
  margin: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  padding: 8px;
  color: white;
  background-color: #81c784;
  width: 88px;
`;

const ProfitLabel = styled.span`
  font-size: 14px;
  font-weight: bolder;
`;
