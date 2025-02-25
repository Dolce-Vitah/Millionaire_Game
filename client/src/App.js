import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import GameScreen from "./components/GameScreen";
import Lobby from "./components/Lobby";
import HostGameScreen from "./components/HostGameScreen";
import PlayerGameScreen from "./components/PlayerGameScreen";
import FinalLeaderboard from "./components/FinalLeaderboard";

const App = () => {
  return (
      <Router>
        <Routes>        
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/hostGame" element={<HostGameScreen />} />
          <Route path="/playerGame" element={<PlayerGameScreen />} />
          <Route path="/finalLeaderboard" element={<FinalLeaderboard />} />
        </Routes>        
      </Router>  
  );
};

export default App;
