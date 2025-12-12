// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
// REMOVE OR COMMENT OUT THIS LINE:
// import SingleMusicDetail from './components/SingleMusicDetail'; 

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Main Layout */}
                    <Route path="/" element={<HomePage />} />
                    
                    {/* COMMENT OUT OR DELETE THIS ROUTE: */}
                    {/* <Route path="/music/:id" element={<SingleMusicDetail />} /> */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;