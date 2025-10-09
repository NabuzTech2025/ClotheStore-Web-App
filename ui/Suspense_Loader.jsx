// src/components/Suspense_Loader.jsx
import React from "react";
import { FaFutbol } from "react-icons/fa";

function Suspense_Loader() {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#fff7ed", // warm orange-50
    fontFamily: "'Poppins', sans-serif",
  };

  const iconStyle = {
    fontSize: "3rem",
    color: "#624ba1", // deep orange
    animation: "rotate360 2s linear infinite",
  };

  const textStyle = {
    marginTop: "1rem",
    color: "#624ba1",
    fontSize: "1.25rem",
    fontWeight: "600",
  };

  return (
    <div style={containerStyle}>
      <FaFutbol style={iconStyle} />
      <p style={textStyle}>Loading...</p>

      <style>
        {`
          @keyframes rotate360 {
            0% { 
              transform: rotate(0deg); 
            }
            100% { 
              transform: rotate(360deg); 
            }
          }
        `}
      </style>
    </div>
  );
}

export default Suspense_Loader;
