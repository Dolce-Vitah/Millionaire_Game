import React from 'react';
import '../assets/GlowingLogo.css';
import logo from "../assets/main_logo.png";

const GlowingLogo = () => {
  return (
    <div className="logo-container">
      <img className="logo" src={logo} alt="Logo" />      
    </div>
  );
};

export default GlowingLogo;