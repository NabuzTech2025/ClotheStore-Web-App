import React, { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { useStoreStatus } from "@/contexts/StoreStatusContext";
import { getUserMe } from "@/api/UserServices";
import { useAuth } from "@/auth/AuthProvider";
import {
  getTranslations,
  getCurrentLanguage,
  formatCurrencySync,
} from "../../utils/helper/lang_translate";
import AddressModal from "./modals/AddressModal";

const CartButton = () => {
  const { cartItems, itemCount, cartTotal, showcartButton } = useCart();
  const { isOpen, setPostCode } = useStoreStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [pendingCartOpen, setPendingCartOpen] = useState(false);
  const { logout } = useAuth();

  // Get current language and translation object
  const language = getCurrentLanguage();
  const currentLanguage = getTranslations(language);

  useEffect(() => {
    const modalElement = document.getElementById("cartModal");
    if (!modalElement) return;

    const handleShow = () => setIsModalOpen(true);
    const handleHide = () => setIsModalOpen(false);

    modalElement.addEventListener("show.bs.modal", handleShow);
    modalElement.addEventListener("hidden.bs.modal", handleHide);

    return () => {
      modalElement.removeEventListener("show.bs.modal", handleShow);
      modalElement.removeEventListener("hidden.bs.modal", handleHide);
    };
  }, []);

  const handleForceLogout = () => {
    logout();
  };

  const openCartModal = () => {
    const modalElement = document.getElementById("cartModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  };

  const handlePostcodeSelect = (data) => {
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    setPostCode(data.postcode); // Update context to sync with Header

    // Close address modal
    setShowAddressModal(false);

    // Open cart modal after address is selected
    if (pendingCartOpen) {
      setPendingCartOpen(false);
      // Use setTimeout to ensure address modal is fully closed before opening cart modal
      setTimeout(() => {
        openCartModal();
      }, 100);
    }
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    setPendingCartOpen(false); // Reset pending state if modal is closed without selection
  };

  const handleShowCart = (e) => {
    e.preventDefault();
    // const fetchUser = async () => {
    //   try {
    //     await getUserMe();
    //   } catch (error) {
    //     handleForceLogout();
    //   }
    // };
    // fetchUser();

    if (!isOpen) {
      alert("Store is currently closed. You cannot place an order now.");
      return;
    }

    // Postcode check removed - open cart modal directly
    openCartModal();
  };

  if (isModalOpen || itemCount === 0) return null;

  // Get delivery fee from localStorage or use default
  const deliveryFee = parseFloat(localStorage.getItem("delivery_fee")) || 0;
  const orderType = localStorage.getItem("order_type") || "delivery";
  const finalDeliveryFee = orderType === "pickup" ? 0 : deliveryFee;

  // Calculate grand total using cartTotal from context
  const grandTotal =
    cartTotal.subtotal - cartTotal.discountAmount + finalDeliveryFee;

  return (
    <>
      <div
        id="caetButton"
        className={`viewcart-area ${
          itemCount > 0 && showcartButton ? "viewcart-area-active" : ""
        }`}
      >
        <div className="cart-totalprice">
          <img src={`./assets/images/addCart-icon.png`} alt="Cart" />
          <h5>
            <span>
              {itemCount}{" "}
              {itemCount === 1 ? currentLanguage.item : currentLanguage.items}
            </span>
            {/* Currency and amount formatted by language */}
            {formatCurrencySync(grandTotal, language)}
          </h5>
        </div>
        {
          <a
            href="#"
            onClick={handleShowCart}
            style={{
              pointerEvents: isOpen ? "auto" : "none",
              opacity: isOpen ? 1 : 0.5,
              cursor: isOpen ? "pointer" : "not-allowed",
            }}
          >
            {currentLanguage.view_cart}{" "}
            <img src={`assets/user/img/right-wht-arrow.svg`} alt="Arrow" />
          </a>
        }
      </div>
      <AddressModal
        show={showAddressModal}
        handleClose={handleAddressModalClose}
        onPostcodeSelect={handlePostcodeSelect}
      />
    </>
  );
};

export default CartButton;
