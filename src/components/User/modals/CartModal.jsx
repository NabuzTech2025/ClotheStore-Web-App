import { useEffect, useState } from "react";
import { useCart } from "../../../contexts/CartContext";
import { getDisscount } from "@/api/UserServices";
import AddressModal from "./AddressModal";
import EditCartModel from "@/components/User/modals/EditCartModel";
import { useStoreStatus } from "@/contexts/StoreStatusContext";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import {
  getTranslations,
  getCurrentLanguage,
  formatCurrencySync,
} from "../../../utils/helper/lang_translate";
import { useCommonData } from "../../../contexts/CommonContext";
import { useViewport } from "../../../contexts/ViewportContext";
import AddNoteModal from "./AddNote";

const CartModal = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    setSelectedProduct,
    setShowEditProductModal,
    cartTotal,
    setShowCartButton,
    clearCart,
    orderNote,
    setOrderNote,
    generateCartItemKey,
  } = useCart();

  const [discountPercent, setDiscountPercent] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(5);
  const [orderType, setOrderType] = useState("delivery");
  const [postcode, setPostcode] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const { isMobileViewport } = useViewport();
  const { isOpen } = useStoreStatus();

  const { selectedPostCodeData } = useCommonData();
  const navigate = useNavigate();
  const modalElement = document.getElementById("cartModal");
  let modal;
  if (modalElement) {
    modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
  }

  const language = getCurrentLanguage();
  const currentLanguage = getTranslations(language);

  const format = (amount) => formatCurrencySync(amount, language);

  // Clean up modal backdrop when component unmounts
  useEffect(() => {
    return () => {
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const modalEl = document.getElementById("cartModal");
    const fetchData = () => {
      const storedOrderType = localStorage.getItem("order_type") || "delivery";
      setOrderType(storedOrderType);
      getDisscount(import.meta.env.VITE_STORE_ID).then((discounts) => {
        const type = storedOrderType.toUpperCase();
        const discount = discounts.find((d) => d.code === `${type}_DISCOUNT`);
        if (discount?.type === "percentage") setDiscountPercent(discount.value);
      });
      if (storedOrderType === "pickup") {
        setDeliveryFee(0);
      } else {
        setPostcode(localStorage.getItem("delivery_postcode") || "");
        setDeliveryFee(5);
      }
    };

    modalEl?.addEventListener("shown.bs.modal", fetchData);
    return () => {
      modalEl?.removeEventListener("shown.bs.modal", fetchData);
    };
  }, []);

  useEffect(() => {
    if (showAddressModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAddressModal]);

  useEffect(() => {
    if (cartItems.length === 0) {
      setOrderNote("");
    }
  }, [cartItems]);

  const handlePostcodeSelect = (data) => {
    setPostcode(data.postcode);
    setDeliveryFee(5);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee.toString());
  };

  const getCartItemKey = (item) => {
    return (
      item.uniqueKey ||
      generateCartItemKey(item.id, item.selectedVariant?.id, item.extras)
    );
  };

  const handleCheckout = () => {
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    if (!isAuthenticated) {
      navigate("/guest-login");
      return;
    }

    navigate("/update-address", {
      state: {
        orderType,
        postcode,
        deliveryFee,
      },
    });
  };

  const handleCloseModal = () => {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("cartModal")
    );
    if (modal) {
      modal.hide();
    }
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    if (cartItems.length === 0) {
      setOrderNote("");
    }
  };

  const min_order_amount =
    Number(selectedPostCodeData.minimum_order_amount) -
    Number(cartTotal.subtotal);

  const handleAddNoteClick = () => {
    setShowNoteModal(true);
    setShowCartButton(false);
    if (modal) {
      modal.hide();
    }
  };

  const handleNoteModalClose = () => {
    setShowNoteModal(false);
    setShowCartButton(true);
    if (modal) {
      modal.show();
    }
  };

  const handleNoteSave = (note) => {
    setOrderNote(note);
    setShowNoteModal(false);
    setShowCartButton(true);
    if (modal) {
      modal.show();
    }
  };

  return (
    <>
      <div
        className={`modal cart-modal-popup fade ${
          showAddressModal ? "d-none" : ""
        }`}
        id="cartModal"
        tabIndex="-1"
        aria-labelledby="cartModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div
              className="modal-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ flex: 1 }}></div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <img src={`assets/user/img/close-icon.svg`} alt="Close" />
                </button>
              </div>
            </div>

            <div className="modal-body">
              <div className="cart-content-area">
                {cartItems.length > 0 ? (
                  <>
                    <ul className="cart-content-header">
                      <li className="items-col">
                        <h5>{currentLanguage.items}</h5>
                      </li>
                      <li className="qty-col">
                        <h5>{currentLanguage.qty}</h5>
                      </li>
                      <li className="price-col">
                        <h5>{currentLanguage.price}</h5>
                      </li>
                    </ul>

                    {cartItems.map((item) => {
                      const toppingsTotal =
                        item.extras?.reduce(
                          (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
                          0
                        ) || 0;
                      const mainProductTotal =
                        item.displayPrice * item.quantity;
                      const totalPrice =
                        mainProductTotal + toppingsTotal * item.quantity;

                      return (
                        <div
                          className="cart-items-area"
                          key={getCartItemKey(item)}
                          style={{ position: "relative" }}
                        >
                          <div className="cart-item-col">
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              <a
                                href="/adria#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFromCart(
                                    item.id,
                                    item.selectedVariant?.id || null,
                                    item.extras || [],
                                    item.uniqueKey
                                  );
                                }}
                              >
                                <img
                                  src={`assets/user/img/red-close-icon.svg`}
                                  alt="Remove"
                                />
                              </a>
                            </div>

                            <div className="cart-item-text">
                              <h6>{item.name}</h6>

                              {/* Display selected variant if exists */}
                              {item.selectedVariant && (
                                <span
                                  style={{
                                    display: "block",
                                    fontSize: "13px",
                                    color: "#666",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Size: {item.selectedVariant.name} -{" "}
                                  {format(item.displayPrice)}
                                </span>
                              )}

                              {/* Display extras/toppings */}
                              {item.extras?.length > 0 &&
                                item.extras.map((t, i) => (
                                  <div key={t.id || i}>
                                    <span
                                      style={{
                                        fontSize: "12px",
                                        color: "#888",
                                      }}
                                    >
                                      + {t.quantity} × {t.name} [
                                      {format(t.price * t.quantity)}]
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div className="cart-items-counter">
                            <div className="cart-counter-text">
                              <span
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    removeFromCart(
                                      item.id,
                                      item.selectedVariant?.id || null,
                                      item.extras || [],
                                      item.uniqueKey
                                    );
                                  } else {
                                    updateQuantity(
                                      item.id,
                                      item.selectedVariant?.id || null,
                                      item.quantity - 1,
                                      item.extras,
                                      item.uniqueKey
                                    );
                                  }
                                }}
                              >
                                <img
                                  src={`assets/user/img/minus-icon.svg`}
                                  alt="Decrease"
                                />
                              </span>

                              <qty>{item.quantity}</qty>

                              <span
                                onClick={() =>
                                  updateQuantity(
                                    item.id,
                                    item.selectedVariant?.id || null,
                                    item.quantity + 1,
                                    item.extras,
                                    item.uniqueKey
                                  )
                                }
                              >
                                <img
                                  src={`assets/user/img/plus-icon.svg`}
                                  alt="Increase"
                                />
                              </span>
                            </div>
                          </div>

                          <div className="cart-items-price">
                            <h4>{format(totalPrice)}</h4>

                            {isMobileViewport &&
                              (item.type !== "simple" ||
                                (item.extras && item.extras.length > 0)) && (
                                <a
                                  href="/adria#"
                                  className="text-decoration-underline text-primary"
                                  style={{
                                    fontSize: "12px",
                                    position: "absolute",
                                    bottom: "10px",
                                    right: "0",
                                    textAlign: "right",
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const productWithExtras = {
                                      ...item,
                                      enriched_topping_groups:
                                        item.enriched_topping_groups || [],
                                    };
                                    setSelectedProduct(productWithExtras);
                                    setShowEditProductModal(true);
                                  }}
                                ></a>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="empty-cart-message">
                    <p>{currentLanguage.your_cart_is_empty}</p>
                  </div>
                )}
              </div>
            </div>

            {cartItems.length > 0 && (
              <div className="modal-footer placeorder-cart">
                <div className="cart-area-total">
                  <ul>
                    <li>
                      <h6>{currentLanguage.subtotal}</h6>
                      <span>{format(cartTotal.subtotal)}</span>
                    </li>
                    {cartTotal.discountAmount > 0 && (
                      <li>
                        <h6>
                          {currentLanguage.discount}{" "}
                          <label>
                            {currentLanguage.saved} {discountPercent}%
                          </label>
                        </h6>
                        <span>{format(cartTotal.discountAmount)}</span>
                      </li>
                    )}

                    {deliveryFee > 0 && orderType === "delivery" && (
                      <li>
                        <h6>{currentLanguage.delivery_charges}</h6>
                        <span>{format(deliveryFee)}</span>
                      </li>
                    )}

                    <li>
                      <h6>{currentLanguage.total}</h6>
                      <span>
                        {format(
                          cartTotal.subtotal -
                            cartTotal.discountAmount +
                            deliveryFee
                        )}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="placeorder-cart">
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="10 14 4 8 10 2"></polyline>
              </svg>
            </button>
            <div
              className="cart-area-footer"
              style={{
                backgroundColor:
                  min_order_amount > 0 && orderType === "delivery"
                    ? "#cfcecc"
                    : "#624BA1",
                cursor:
                  min_order_amount > 0 && orderType === "delivery"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <div className="cart-totalprice">
                <img
                  src={`assets/user/img/blk-cart-icon.svg`}
                  alt="Cart"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <h5 style={{ color: "white" }}>
                  <span>
                    {cartTotal.itemCount} {currentLanguage.items_added}
                  </span>
                  {format(
                    cartTotal.subtotal - cartTotal.discountAmount + deliveryFee
                  )}
                </h5>
              </div>

              <a
                onClick={() => {
                  if (orderType === "delivery" && min_order_amount > 0) return;
                  handleCheckout();
                }}
                style={{
                  cursor:
                    orderType === "delivery" && min_order_amount > 0
                      ? "not-allowed"
                      : "pointer",
                  color: "white",
                }}
              >
                Continue
                <img
                  src={`assets/user/img/right-blk-arrow.svg`}
                  alt="Order"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </a>
            </div>
          </div>
        )}
      </div>

      <AddressModal
        show={showAddressModal}
        handleClose={() => {
          setShowAddressModal(false);
          const cartModal = document.getElementById("cartModal");
          if (cartModal) {
            const modal = new bootstrap.Modal(cartModal);
            modal.show();
          }
        }}
        onPostcodeSelect={handlePostcodeSelect}
      />
      <EditCartModel />

      <AddNoteModal
        orderNote={orderNote}
        show={showNoteModal}
        handleClose={handleNoteModalClose}
        onSave={handleNoteSave}
      />
    </>
  );
};

export default CartModal;
