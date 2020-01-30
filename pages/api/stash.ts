import fetch from 'isomorphic-unfetch';

export default async (req, res) => {
  const response = await fetch(
    'https://www.pathofexile.com/character-window/get-stash-items?accountName=ludise&realm=pc&league=Hardcore+Metamorph&tabs=0&tabIndex=1&public=false',
    { headers: { Cookie: `POESESSID=${process.env.POESESSID};` } },
  );
  if (response.status !== 200) {
    return res.status(500).send('Something broke');
  }

  const { items } = await response.json();
  const formattedItems = items.map(({ typeLine, stackSize }) => ({
    name: typeLine,
    amount: stackSize,
  }));

  return res.status(200).json(formattedItems);
};
