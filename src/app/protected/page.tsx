"use client"; 

import { supabase } from "@/utils/supabase/client";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { flashcards } from "../game/flashcard_array";
import { createDeck, sendData } from "@/utils/sendData";
import { Deck } from "@/types/Deck";
import { FlashCard } from "@/types/FlashCard";
import { getADeck, getData } from "@/utils/getData";
import { signOutAction } from "../actions";
import ShareDeckForm from "./recievePage";
import RecieveDeckForm from "./sharePage";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();
  const [deckList, setdeckList] = useState<Deck[] | null>(null);
  const [inputValue, setInputValue] = useState<number>(1);
  const [cardsList, setCardsList] = useState<FlashCard[] | null>(null);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(Number(value)); 
  };

  useEffect(() => {
    
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
      } else {
        const temp = data.user as User;
        setUser(temp ? { id: temp.id, email: temp.email } : null);
        setLoading(false);
      }
    
    }

    //GETS DECKS
    const deckListGet = async () => {
      const test = await getData("Deck") as Deck[];
      setdeckList(test)
    }
  
    
      deckListGet();
      fetchUser();

  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }
  const testupload = async () => {

    try{
      if(user) {
        //Create an empty deck
        const data = (await createDeck(user.id, 'tester'))[0] as Deck;
        console.log(data)
        

        //Upload An array of cards
        const CardsWithUID = flashcards.map(item => ({...item, owner_id: user.id}) )
        const cards = (await sendData('FlashCard',CardsWithUID)) as FlashCard[];
        console.log(cards)

        //We only want the ids for link
        const ArrayofCardID = (await cards).map(item => item.card_id);

        //Create the CardsToDeck object to prepare for upload
        const ConnectedCards = ArrayofCardID.map(card_id => ({
          card_id, 
          owner_id: user.id, 
          deck_id: data.deck_id
        }));

        //Upload the link!
        const connectCardsTodeck = sendData('CardsToDeck', ConnectedCards );
        console.log(connectCardsTodeck);
        
      }
    } catch(e ){
      console.error(e)
    }
  };

  const testget = async () => {
    try{
      if(user) {
        //Get CARDS from a DECK ID
        console.log(inputValue)
        const data = await getADeck(inputValue);
        setCardsList(data);
        console.log(cardsList)
      }
    } catch(e ){
      console.error(e)
    }
  };

  
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
        <h2 className="font-bold text-2xl mb-4">Your decks (refresh to update)</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(deckList, null, 2)}
        </pre>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
        <h2 className="font-bold text-2xl mb-4">Your cards from deck (enter deck id below and click get)</h2>
          {JSON.stringify(cardsList, null, 2)}
        </pre>
        <button onClick={testupload} id="testupload" className="w-full px-4 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors">
                      upload (from flashcards file)
                    </button>

                          <input
        type="number"
        id="inputField"
        value={inputValue} 
        onChange={handleInputChange} 
        className="border p-2 rounded"
      />
                          <button onClick={testget} id="testget" className="w-full px-4 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors">
                      get (enter deckid above, refresh page to refresh the deck list)
                    </button>
                    <button onClick={signOutAction} id="SignOut" data-testid="SignOutButton" className="w-full px-4 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors">
                      Sign Out
                    </button>
      </div>
      <div>
      </div>
      <div className="mt-8">
        <RecieveDeckForm />
        <ShareDeckForm uuid={user?.id ??  ""} />
      </div>
    </div>
  );
}