import React, { useState } from 'react';
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

const calculateProfitColor = (profitMargin: number) => {
  if (profitMargin > 30) return '#2e7d32';
  if (profitMargin > 10) return '#43a047';
  if (profitMargin > 0) return '#f57f17';
  return '#f44336';
};

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

  const [showSellAmounts, setShowSellAmounts] = useState(false);

  const haveRatio = haveData?.ratio;
  const wantRatio = wantData?.ratio;
  const profitMargin =
    haveRatio && wantRatio && Math.floor((1 - haveRatio / wantRatio) * 100);

  const exchangeOneSellAmount = Math.floor(
    currencyTwo.preferredSellAmount / haveRatio - 1,
  );
  const exchangeTwoSellAmount = Math.floor(
    currencyTwo.preferredSellAmount / wantRatio + 1,
  );

  const copyToClipboard = (text: string) => {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  };

  return (
    <PathwayCard
      key={currencyOne.shorthand + currencyTwo.shorthand}
      order={profitMargin || profitMargin === 0 ? -profitMargin : 1000}
    >
      <PathwayWrapper>
        <Exchange
          onMouseOver={() => setShowSellAmounts(true)}
          onMouseOut={() => setShowSellAmounts(false)}
          onClick={() =>
            copyToClipboard(
              `~b/o ${exchangeOneSellAmount}/${currencyTwo.preferredSellAmount} ${currencyOne.shorthand}`,
            )
          }
        >
          <CurrencyIcon src={currencyOne.iconUrl} />{' '}
          {!haveRatio ? '?' : showSellAmounts ? exchangeOneSellAmount : '1'}
          <Arrow>←</Arrow>
          <CurrencyIcon src={currencyTwo.iconUrl} />
          {!haveRatio
            ? '?'
            : showSellAmounts
            ? currencyTwo.preferredSellAmount
            : prettifyNumber(haveRatio)}{' '}
        </Exchange>
        <Exchange
          onMouseOver={() => setShowSellAmounts(true)}
          onMouseOut={() => setShowSellAmounts(false)}
          onClick={() =>
            copyToClipboard(
              `~b/o ${currencyTwo.preferredSellAmount}/${exchangeTwoSellAmount} ${currencyTwo.shorthand}`,
            )
          }
        >
          <CurrencyIcon src={currencyOne.iconUrl} />{' '}
          {!wantRatio ? '?' : showSellAmounts ? exchangeTwoSellAmount : '1'}
          <Arrow>→</Arrow>
          <CurrencyIcon src={currencyTwo.iconUrl} />
          {!wantRatio
            ? '?'
            : showSellAmounts
            ? currencyTwo.preferredSellAmount
            : prettifyNumber(wantRatio)}{' '}
        </Exchange>
      </PathwayWrapper>
      <ProfitMargin
        backgroundColor={
          profitMargin ? calculateProfitColor(profitMargin) : '#f44336'
        }
      >
        <ProfitLabel>PROFIT</ProfitLabel>
        <span>{profitMargin || profitMargin === 0 ? profitMargin : '?'}%</span>
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
  cursor: pointer;

  :hover {
    opacity: 0.5;
  }
`;

const CurrencyIcon = styled.img`
  width: 30px;
  margin-right: 4px;
  pointer-events: none;
`;

const Arrow = styled.span`
  margin: 0 8px;
`;

interface ProfitMarginProps {
  backgroundColor: string;
}

const ProfitMargin = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  padding: 8px;
  color: white;
  background-color: ${({ backgroundColor }: ProfitMarginProps) =>
    backgroundColor};
  width: 88px;
`;

const ProfitLabel = styled.span`
  font-size: 14px;
  font-weight: bolder;
`;
