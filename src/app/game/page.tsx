'use client';

/*
THIS FILE HANDLES THE OVERALL FLASHCARD ALTERNATING PROCESS
*/

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FlashcardStack from "../game/stack";
import Header from "../components/header";
import { supabase } from "@/utils/supabase/client";
import { User } from "@/types/user";
import { FlashCard } from "@/types/FlashCard"; // Make sure this type exists
import VerticalList from './vertical_list';

export default function Game() {
  const [user, setUser] = useState<{ id: string; email: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deckLoading, setDeckLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [deckName, setDeckName] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId');

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/sign-in");
        return;
      } else {
        const temp = data.user as User;
        setUser(temp ? { 
          id: temp.id, 
          email: temp.email,
          image: temp.user_metadata?.avatar_url || undefined
        } : null);
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    const fetchDeckCards = async () => {
      if (!deckId) return;

      setDeckLoading(true);

      try {
        // Get the deck information
        const { data: deckData, error: deckError } = await supabase
          .from('Deck')
          .select('deck_name')
          .eq('deck_id', deckId)
          .single();

        if (deckError) throw deckError;
        if (deckData) setDeckName(deckData.deck_name);

        // Get the card IDs for this deck from CardsToDeck
        const { data: cardLinks, error: cardLinksError } = await supabase
          .from('CardsToDeck')
          .select('card_id')
          .eq('deck_id', deckId);

        if (cardLinksError) throw cardLinksError;

        const cardIds = cardLinks.map((link) => link.card_id);

        if (cardIds.length > 0) {
          // Fetch the flashcards using the card IDs
          const { data: cardsData, error: cardsError } = await supabase
            .from('FlashCard')
            .select('*')
            .in('card_id', cardIds);

          if (cardsError) throw cardsError;

          setFlashcards(cardsData || []);
        } else {
          // No cards found
          setFlashcards([]);
        }
      } catch (error) {
        console.error("Error fetching deck cards:", error);
      } finally {
        setDeckLoading(false);
      }
    };

    if (!loading) {
      fetchDeckCards();
    }
  }, [deckId, loading]);

  if (loading || deckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-light">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-beige-light">
      {/* Header component */}
      <Header user={user} />
      
      {/* Flashcard section */}
      <div className="flex flex-col items-center justify-center p-4 pt-6 min-h-[80vh]">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8">
          {deckName || "Flashcard Deck"}
        </h2>
        
        <div className="w-full max-w-5xl md:max-w-6xl lg:max-w-7xl px-2 md:px-6">
          {flashcards.length > 0 ? (
            <div className="w-full">
              <FlashcardStack 
                flashcards={flashcards} 
                deckId={deckId || undefined}
              />
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow-md w-full">
              <p className="text-xl text-gray-600 mb-6">No flashcards found in this deck.</p>
              <Link href="/upload" className="text-teal-600 hover:underline text-lg font-medium">
                Create some flashcards
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Vertical list section - appears on scroll */}
      <div className="w-full bg-beige-light py-10 mt-16">
        <VerticalList 
          flashcards={flashcards}
          deckName={deckName}
        />
      </div>
    </main>
  );
}