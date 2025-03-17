import { ACCESS } from '@/types/Access';
import { shareADeck } from '@/utils/sendData';
import React, { useState } from 'react';



const RecieveDeckForm = () => {
  const [deckID, setDeckID] = useState('');
  const [accessType, setAccessType] = useState<'READ' | 'WRITE'>(ACCESS.READ);
  const [shareLink, setShareLink] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reset any previous errors
    try {
      const { shareLink, expiresAt } = await shareADeck(parseInt(deckID), accessType);
      console.log(deckID)
      console.log(accessType)
      setShareLink(shareLink);
      setExpiresAt(expiresAt);
    } catch (err) {
      setError('Failed to generate share link. Please try again.');
    }
  };

  return (
    <div className="share-deck-form">
      <h2 className="font-bold text-2xl mb-4">Generate Share Link</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="deckID" className="text-sm">Deck ID</label>
          <input
            type="text"
            id="deckID"
            value={deckID}
            onChange={(e) => setDeckID(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="text-sm">Access Type</label>
          <select
            value={accessType}
            onChange={(e) => setAccessType(e.target.value as 'READ' | 'WRITE')}
            className="border p-2 rounded"
          >
            <option value={ACCESS.READ}>READ</option>
            <option value={ACCESS.WRITE}>WRITE</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full px-4 py-3 bg-[#B65F3C] text-white rounded-lg hover:bg-[#A35432] transition-colors"
        >
          Generate Share Link
        </button>
      </form>

      {shareLink && (
        <div className="mt-4">
          <h3 className="font-semibold">Your Share Link:</h3>
          <a href={shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
            {shareLink}
          </a>
          <p className="text-sm text-gray-500">Expires at: {new Date(expiresAt).toLocaleString()}</p>
        </div>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default RecieveDeckForm;
