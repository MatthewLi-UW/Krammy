import { Deck } from '@/types/Deck';
import { FlashCard } from '@/types/FlashCard';
import { fetchSharedLinkData, getADeck } from '@/utils/getData';
import { createDeck, joinSharedDeck, sendData } from '@/utils/sendData';
import React, { useState } from 'react';




const ShareDeckForm = ({ uuid }: { uuid: string }) => {
    const [shareToken, setShareToken] = useState('');
    const [error, setError] = useState('');
    const [cardsList, setCardsList] = useState<FlashCard[] | null>(null);
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        const data = await fetchSharedLinkData(shareToken);
        
        if (data.access_type === 'READ') {
          const cardData = await getADeck(data.deck_id);
          setCardsList(cardData);
        } else {
          const cardData = await getADeck(data.deck_id);
          const joinedDeckData = await joinSharedDeck(uuid ,data.deck_id)
          setCardsList(cardData);
        }
  
        setError(''); 
      } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
          }
        throw new Error("An unknown error occurred.");

      }
    };

    const handleAdditionalAction = async () => {
      try {

        // Create an empty deck
        const data = (await createDeck(uuid, 'copiedtester'))[0] as Deck; 


        // Ensure cardsList is an array
        const cards = cardsList ? cardsList : [];

        // We want the card data for the link
        const ArrayofCardFaces = cards.map(({ front, back }) => ({ front, back }));

        const CardsWithUID = ArrayofCardFaces.map(item => ({...item, owner_id: uuid}) )
        const dupedCardList = (await sendData('FlashCard',CardsWithUID)) as FlashCard[];

        //We only want the ids for link
        const ArrayofCardID = (await dupedCardList).map(item => item.card_id);

        //Create the CardsToDeck object to prepare for upload
        const ConnectedCards = ArrayofCardID.map(card_id => ({
          card_id, 
          owner_id: uuid, 
          deck_id: data.deck_id
        }));
    
        // Upload the link!
        const connectCardsTodeck = await sendData('CardsToDeck', ConnectedCards);
    
        
      } catch (error) {
        console.error('Error in additional action:', error);
      }
    };
    
  return (
    <div>
      <h2>Enter Share UUID</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={shareToken}
          onChange={(e) => setShareToken(e.target.value)}
          placeholder="Enter share token"
        />
        <button type="submit">Fetch Deck</button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {cardsList && (
        <div>
          <h3>Deck Details</h3>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(cardsList, null, 2)}
        </pre>
        </div>
      )}

<button onClick={handleAdditionalAction} className="mt-4 p-2 bg-blue-500 text-white rounded">
        Download deck to my account.
      </button>
    </div>
  );
};

export default ShareDeckForm;