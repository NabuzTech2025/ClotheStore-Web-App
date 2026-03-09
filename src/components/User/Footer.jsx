// components/Footer.js
import React from "react";
import { useViewport } from "../../contexts/ViewportContext";
import { Link } from "react-router-dom";
import { currentCurrency } from "../../utils/helper/currency_type";

const Footer = () => {
  const { isMobileViewport } = useViewport();
  const copyrightText =
    import.meta.env.VITE_APP_COPYRIGHT_TEXT || "Default Copyright Text";
  return (
    <footer
      className={`text-center pb-5  ${
        isMobileViewport ? "text-sm" : "text-[16px]"
      }`}
    >
      <a
        href="https://www.instagram.com/rrfootballshirts"
        target="_blank"
        style={{
          marginRight: "10px",
        }}
      >
        <img
          style={{
            width: "30px",
            height: "30px",
          }}
          src={`assets/images/instagram.png`}
          alt="instagram"
        />
        <h5>Instagram</h5>
      </a>
      {currentCurrency.show && (
        <Link
          to="/privacypolicy"
          target="_blank"
          className="text-black font-bold"
        ></Link>
      )}
    </footer>
  );
};

export default Footer;
