import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">
          <Link to="/">MusicPortal</Link>
        </div>
        <nav className="hidden md:flex space-x-6 items-center">
          <Link className="text-gray-700 hover:text-purple-600 transition-colors" to="/">Home</Link>
          <Link className="text-gray-700 hover:text-purple-600 transition-colors" to="/music-list">Music List</Link>
          <Link className="text-gray-700 hover:text-purple-600 transition-colors" to="/fusion">Fusion</Link>
          <Link className="text-gray-700 hover:text-purple-600 transition-colors" to="/upload">Upload</Link>
          <input
            type="text"
            placeholder="Search music..."
            className="ml-4 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </nav>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-800 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md px-6 py-4 space-y-2">
          <Link className="block text-gray-700 hover:text-purple-600 transition-colors" to="/">Home</Link>
          <Link className="block text-gray-700 hover:text-purple-600 transition-colors" to="/music-list">Music List</Link>
          <Link className="block text-gray-700 hover:text-purple-600 transition-colors" to="/fusion">Fusion</Link>
          <Link className="block text-gray-700 hover:text-purple-600 transition-colors" to="/upload">Upload</Link>
          <input
            type="text"
            placeholder="Search music..."
            className="w-full mt-2 px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      )}
    </header>
  );
};

export default Header;
