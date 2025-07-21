'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function ExplorePage() {
  const [queryText, setQueryText] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Ambil semua user dari Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'Users');
      const snapshot = await getDocs(usersCollection);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllUsers(usersData);
    };

    fetchUsers();
  }, []);

  // Ambil history dari localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('searchHistory')) || [];
    setSearchHistory(saved);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    const updatedHistory = [queryText, ...searchHistory.filter(item => item !== queryText)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));

    const filtered = allUsers.filter(
      user =>
        user.name?.toLowerCase() === queryText.toLowerCase() ||
        user.username?.toLowerCase() === queryText.toLowerCase()
    );



    setResults(filtered);
    setSuggestions([]);
    setShowHistory(false);
  };

  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQueryText(value);
    setResults([]);

    if (value.trim()) {
      const filtered = allUsers
        .filter(
          user =>
            user.name?.toLowerCase().includes(value.toLowerCase()) ||
            user.username?.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowHistory(false);
    } else {
      setSuggestions([]);
      setShowHistory(true);
    }
  };

  const handleDeleteHistory = (item) => {
    const updated = searchHistory.filter(q => q !== item);
    setSearchHistory(updated);
    localStorage.setItem('searchHistory', JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleClickSuggestion = (user) => {
    setQueryText(user.name || user.username);
    setSuggestions([]);
    setResults([user]); // tampilkan hanya 1 user yang diklik
  };

  const handleShowAllSuggestions = () => {
    setSuggestions([]);
    setQueryText(''); // kosongkan input supaya tidak membingungkan
    setResults(allUsers); // tampilkan semua user di hasil pencarian
    setShowHistory(false);
  };



  return (
    <div className="pl-64 flex min-h-screen">
      <main className="flex-1 border-x border-gray-200 min-h-screen max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Explore</h1>

        <form onSubmit={handleSearch} className="mb-2 relative">
          <input
            type="text"
            value={queryText}
            onChange={handleQueryChange}
            onFocus={() => queryText === '' && setShowHistory(true)}
            className="w-full border rounded-md px-4 py-2"
            placeholder="Search users..."
          />
          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-3 bg-blue-500 text-white rounded-md"
          >
            Search
          </button>
        </form>

        {showHistory && searchHistory.length > 0 && (
          <div className="bg-white border rounded-md shadow-md mb-4 p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">Recent searches</span>
              <button onClick={clearHistory} className="text-xs text-red-500">Clear all</button>
            </div>
            <ul className="space-y-2">
              {searchHistory.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span
                    onClick={() => handleClickSuggestion(item)}
                    className="cursor-pointer text-sm text-gray-700 hover:underline"
                  >
                    {item}
                  </span>
                  <button onClick={() => handleDeleteHistory(item)} className="text-xs text-gray-400 hover:text-red-500">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="bg-white border rounded-md shadow-md mb-4 p-3">
            <div className="text-sm font-semibold mb-2">Suggestions</div>
            <ul className="space-y-2">
              {suggestions.map(user => (
                <li key={user.id} onClick={() => handleClickSuggestion(user)} className="cursor-pointer flex items-center gap-3 hover:bg-gray-100 p-2 rounded-md">
                  <img src={user.photoURL || '/default-avatar.png'} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </li>
              ))}
              <button
                onClick={handleShowAllSuggestions}
                className="text-sm text-blue-500 hover:underline mt-2"
              >
                Lihat semua
              </button>
            </ul>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Search Results</h2>
            <ul className="space-y-4">
              {results.map(user => (
                <li key={user.id} className="flex items-center justify-between bg-white border p-3 rounded-md hover:shadow">
                  <div className="flex items-center gap-3">
                    <img src={user.photoURL || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Redirect to /profile/${user.username}`)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Profile
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
