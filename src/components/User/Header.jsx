import React, { useState, useEffect } from "react";
import AddressModal from "../User/modals/AddressModal";
import LoginModal from "@/components/User/modals/LoginModal";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  getTranslations,
  getCurrentLanguage,
  formatCurrency,
} from "../../utils/helper/lang_translate";
import { useCart } from "../../contexts/CartContext";
import { useViewport } from "../../contexts/ViewportContext";
import { payload_url } from "../../utils/common_urls";
import brandLogo from "../../../public/assets/user/img/brand-logo.png";
import userLogo from "../../../public/assets/user/img/login-icon.svg";
import { useStoreStatus } from "../../contexts/StoreStatusContext";

const Header = ({ status, onSearch }) => {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedPostcode, setSelectedPostcode] = useState("");
  const [localSearch, setLocalSearch] = useState("");
  const { isSmallestViewport } = useViewport();

  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { clearCart } = useCart();
  const { isMobileViewport } = useViewport();
  const { postCode, setPostCode } = useStoreStatus();

  // Language state
  const [language, setLanguage] = useState(getCurrentLanguage());
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Translations
  const currentLanguage = getTranslations(language);

  // Example price in base currency (USD)
  const examplePrice = 12.5;
  const [convertedPrice, setConvertedPrice] = useState(null);

  // Convert price when language changes
  useEffect(() => {
    const convert = async () => {
      const formatted = await formatCurrency(examplePrice, language, "USD");
      setConvertedPrice(formatted);
    };
    convert();
  }, [language]);

  const logoutUser = () => {
    logout();
    window.location.replace(payload_url);
  };

  const order_type = localStorage.getItem("order_type");

  useEffect(() => {
    if (postCode) {
      setSelectedPostcode(postCode);
    } else {
      const storedPostcode = localStorage.getItem("delivery_postcode");
      if (storedPostcode) {
        setSelectedPostcode(storedPostcode);
        setPostCode(storedPostcode);
      }
    }
  }, [postCode, setPostCode]);

  // Update language
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem("app_language", lang);
    setShowLangDropdown(false);
    window.location.reload();
  };

  const handlePostcodeSelect = (data) => {
    setSelectedPostcode(data.postcode);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    setPostCode(data.postcode);
  };

  const onChangeSearch = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    onSearch(val);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLangDropdown) {
        setShowLangDropdown(false);
      }
      if (showAccountMenu) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showLangDropdown, showAccountMenu]);

  return (
    <>
      <header id="header">
        <div className="container">
          <div className="row">
            {/* Left Side */}
            <div className="col-lg-10 col-sm-10 col-6">
              <div className="header-left-area">
                <div
                  style={{
                    marginRight: isMobileViewport ? "75px" : "40px",
                    width: isMobileViewport ? "5%" : "21%",
                  }}
                >
                  <a
                    href={`${import.meta.env.VITE_APP_BASE_URL}`}
                    onClick={(e) => {
                      if (localStorage.getItem("order_placed") === "true") {
                        clearCart();
                        localStorage.removeItem("order_placed");
                      }
                    }}
                  >
                    <img
                      src={brandLogo}
                      alt="Brand Logo"
                      style={{ width: isMobileViewport ? "80px" : "100%" }}
                    />
                  </a>
                </div>

                {status && (
                  <>
                    {/* Desktop */}
                    <div className="header-middle-area d-none d-sm-flex">
                      <div className="header-search">
                        <div className="form">
                          <img
                            src={`assets/user/img/search-icon.svg`}
                            alt="Search"
                          />
                          <input
                            type="text"
                            className="form-control form-input"
                            placeholder={`${currentLanguage.search_anything}...`}
                            value={localSearch}
                            onChange={onChangeSearch}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="d-sm-none mt-2"></div>
                  </>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="col-lg-2 col-sm-2 col-6">
              <div className="header-login" style={{ position: "relative" }}>
                {/* Mobile search icon */}
                <a
                  className="mobile-search d-sm-none"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowSearchModal(true);
                  }}
                >
                  <img src={`assets/user/img/search-icon.svg`} alt="Search" />
                </a>

                {/* Account/Login */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {isAuthenticated ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAccountMenu((v) => !v);
                      }}
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <img src={userLogo} alt="Account" />
                      <span style={{ marginLeft: "5px" }}>
                        {isMobileViewport
                          ? user?.customer_name?.split(" ")[0]?.length > 4
                            ? `${user.customer_name
                                .split(" ")[0]
                                .slice(0, 4)}...`
                            : user?.customer_name?.split(" ")[0]
                          : user?.customer_name?.split(" ")[0]}
                      </span>
                    </div>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowLoginModal(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: "#624ba1",
                      }}
                    >
                      <img src={userLogo} alt="Login" />
                      <span style={{ marginLeft: "5px" }}>
                        {currentLanguage.login}
                      </span>
                    </a>
                  )}
                </div>

                {/* Account Dropdown Menu */}
                {isAuthenticated && showAccountMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      background: "#fff",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      borderRadius: "8px",
                      padding: "10px",
                      zIndex: 999,
                      marginTop: "5px",
                    }}
                  >
                    <button
                      onClick={logoutUser}
                      className="btn btn-sm btn-danger"
                      style={{
                        border: "none",
                        borderRadius: "6px",
                        padding: "8px 12px",
                        fontSize: "13px",
                      }}
                    >
                      {currentLanguage.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AddressModal
        show={showAddressModal}
        handleClose={() => setShowAddressModal(false)}
        onPostcodeSelect={handlePostcodeSelect}
      />

      <LoginModal
        show={showLoginModal}
        handleClose={() => setShowLoginModal(false)}
      />

      {showSearchModal && (
        <div
          className="modal mobile-search-col fade show d-block"
          id="mobile-search-Modal"
          tabIndex="-1"
          aria-modal="true"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <form
                  className="mobile-search-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <img
                    src="/assets/user/img/close-icon.svg"
                    className="btn-close"
                    alt="Close"
                    onClick={() => setShowSearchModal(false)}
                    style={{ width: "14px", cursor: "pointer" }}
                  />
                  <input
                    type="search"
                    placeholder={`${currentLanguage.search_anything}...`}
                    value={localSearch}
                    onChange={onChangeSearch}
                    className="form-control mt-2"
                  />
                  <button type="submit" className="btn-search">
                    <img src={`assets/user/img/search-icon.svg`} alt="Search" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
