// import React, { useEffect, useState } from "react";
// import { useCart } from "../../../contexts/CartContext";
// import { getDisscount } from "@/api/UserServices";
// import AddressModal from "./AddressModal";
// import EditCartModel from "@/components/User/modals/EditCartModel";
// import { useStoreStatus } from "@/contexts/StoreStatusContext";
// import { useAuth } from "@/auth/AuthProvider";
// import { useNavigate } from "react-router-dom";
// import { currentLanguage } from "../../../utils/helper/lang_translate";
// import { useCommonData } from "../../../contexts/CommonContext";
// import {
//   useViewport,
//   ViewportProvider,
// } from "../../../contexts/ViewportContext";
// import { currentCurrency } from "../../../utils/helper/currency_type";
// import AddNoteModal from "./AddNote";

// const CartModal = () => {
//   const {
//     cartItems,
//     removeFromCart,
//     updateQuantity,
//     setSelectedProduct,
//     setShowEditProductModal,
//     cartTotal,
//     setShowCartButton,
//     clearCart,
//     orderNote,
//     setOrderNote,
//     generateCartItemKey,
//   } = useCart();

//   const [discountPercent, setDiscountPercent] = useState(0);
//   const [deliveryFee, setDeliveryFee] = useState(3);
//   const [orderType, setOrderType] = useState("delivery");
//   const [postcode, setPostcode] = useState("");
//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const [showNoteModal, setShowNoteModal] = useState(false);
//   const { isAuthenticated } = useAuth();

//   const { isMobileViewport } = useViewport();
//   const { isOpen } = useStoreStatus();

//   const { selectedPostCodeData } = useCommonData();
//   const navigate = useNavigate();
//   const modalElement = document.getElementById("cartModal");
//   const viewcartArea = document.getElementById("caetButton");
//   let modal;
//   if (modalElement) {
//     modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
//   }

//   // Clean up modal backdrop when component unmounts
//   useEffect(() => {
//     return () => {
//       const backdrops = document.querySelectorAll(".modal-backdrop");
//       backdrops.forEach((backdrop) => backdrop.remove());
//       document.body.classList.remove("modal-open");
//       document.body.style.overflow = "";
//     };
//   }, []);

//   useEffect(() => {
//     const modalEl = document.getElementById("cartModal");
//     const fetchData = () => {
//       const storedOrderType = localStorage.getItem("order_type") || "delivery";
//       setOrderType(storedOrderType);
//       getDisscount(import.meta.env.VITE_STORE_ID).then((discounts) => {
//         const type = storedOrderType.toUpperCase();
//         const discount = discounts.find((d) => d.code === `${type}_DISCOUNT`);
//         if (discount?.type === "percentage") setDiscountPercent(discount.value);
//       });
//       if (storedOrderType === "pickup") {
//         setDeliveryFee(0);
//       } else {
//         setPostcode(localStorage.getItem("delivery_postcode") || "");
//         setDeliveryFee(parseFloat(localStorage.getItem("delivery_fee")) || 0);
//       }
//     };

//     modalEl?.addEventListener("shown.bs.modal", fetchData);
//     return () => {
//       modalEl?.removeEventListener("shown.bs.modal", fetchData);
//     };
//   }, []);

//   useEffect(() => {
//     if (showAddressModal) {
//       document.body.style.overflow = "hidden";
//     } else {
//       document.body.style.overflow = "";
//     }

//     return () => {
//       document.body.style.overflow = "";
//     };
//   }, [showAddressModal]);

//   useEffect(() => {
//     if (cartItems.length === 0) {
//       setOrderNote("");
//     }
//   }, [cartItems]);

//   const handlePostcodeSelect = (data) => {
//     setPostcode(data.postcode);
//     setDeliveryFee(data.delivery_fee);
//     localStorage.setItem("delivery_postcode", data.postcode);
//     localStorage.setItem("delivery_fee", data.delivery_fee.toString());
//   };

//   const getCartItemKey = (item) => {
//     // Use the uniqueKey if available, otherwise generate one
//     return (
//       item.uniqueKey ||
//       generateCartItemKey(item.id, item.selectedVariant?.id, item.extras)
//     );
//   };

//   const handleCheckout = () => {
//     // Clean up modal before navigation
//     const backdrops = document.querySelectorAll(".modal-backdrop");
//     backdrops.forEach((backdrop) => backdrop.remove());
//     document.body.classList.remove("modal-open");
//     document.body.style.overflow = "";

//     if (!isAuthenticated) {
//       navigate("/guest-login");
//       return;
//     }

//     if (orderType === "delivery" && !postcode) {
//       setShowAddressModal(true);
//       return;
//     }

//     navigate("/update-address", {
//       state: {
//         orderType,
//         postcode,
//         deliveryFee,
//       },
//     });
//   };

//   const handleCloseModal = () => {
//     // Programmatically hide the Bootstrap modal
//     const modal = bootstrap.Modal.getInstance(
//       document.getElementById("cartModal")
//     );
//     if (modal) {
//       modal.hide();
//     }
//     // Clean up backdrop
//     const backdrops = document.querySelectorAll(".modal-backdrop");
//     backdrops.forEach((backdrop) => backdrop.remove());
//     document.body.classList.remove("modal-open");
//     document.body.style.overflow = "";
//     if (cartItems.length === 0) {
//       setOrderNote("");
//     }
//   };

//   const min_order_amount =
//     Number(selectedPostCodeData.minimum_order_amount) -
//     Number(cartTotal.subtotal);

//   const handleAddNoteClick = () => {
//     setShowNoteModal(true);
//     setShowCartButton(false);
//     if (modal) {
//       modal.hide();
//     }
//   };

//   const handleNoteModalClose = () => {
//     setShowNoteModal(false);
//     setShowCartButton(true);
//     // Show the cart modal again
//     if (modal) {
//       modal.show();
//     }
//   };

//   const handleNoteSave = (note) => {
//     setOrderNote(note);
//     setShowNoteModal(false);
//     setShowCartButton(true);
//     if (modal) {
//       modal.show();
//     }
//   };

//   return (
//     <>
//       <div
//         className={`modal cart-modal-popup fade ${
//           showAddressModal ? "d-none" : ""
//         }`}
//         id="cartModal"
//         tabIndex="-1"
//         aria-labelledby="cartModalLabel"
//         aria-hidden="true"
//       >
//         <div className="modal-dialog">
//           <div className="modal-content">
//             <div
//               className="modal-header"
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 // position: "relative",
//               }}
//             >
//               {/* Left side - postcode info */}
//               <div style={{ flex: 1 }}>
//                 {orderType === "delivery" && (
//                   <div className="cart-postcode-col">
//                     <div className="postcode-icon">
//                       <img
//                         src={`assets/user/img/delivery-icon.svg`}
//                         alt="Delivery"
//                       />
//                     </div>
//                     <div className="header-postcode-cnt">
//                       <h3
//                         style={{
//                           fontSize: isMobileViewport ? "12px" : "16px",
//                         }}
//                       >
//                         {postcode}
//                       </h3>
//                       <i className="bi bi-chevron-down"></i>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Right side - buttons */}
//               <div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                 }}
//               >
//                 {/* <button
//                   style={{
//                     backgroundColor: "transparent",
//                     color: "#0C831F",
//                     border: "none",
//                     padding: "8px 16px",
//                     borderRadius: "4px",
//                     fontSize: isMobileViewport ? "12px" : "14px",
//                     fontWeight: "bold",
//                     cursor: "pointer",
//                     transition: "color 0.2s ease",
//                     textDecoration: "underline",
//                     whiteSpace: "nowrap",
//                   }}
//                   onClick={handleAddNoteClick}
//                 >
//                   {orderNote
//                     ? currentLanguage.edit_note
//                     : currentLanguage.add_note}
//                 </button> */}

//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                   aria-label="Close"
//                 >
//                   <img src={`assets/user/img/close-icon.svg`} alt="Close" />
//                 </button>
//               </div>
//             </div>

//             <div className="modal-body">
//               <div className="cart-content-area">
//                 {min_order_amount > 0 && orderType === "delivery" && (
//                   <div
//                     style={{
//                       marginBottom: "15px",
//                     }}
//                   >
//                     <img
//                       src="assets/images/shop_bag.png"
//                       alt=""
//                       style={{
//                         width: "13px",
//                         height: "15px",
//                         marginLeft: "0px",
//                         marginRight: "5px",
//                         marginBottom: "5px",
//                       }}
//                     />
//                     <span
//                       style={{
//                         fontSize: isMobileViewport ? "10.5px" : "14px",
//                         color: "#303030",
//                       }}
//                     >
//                       Noch{" "}
//                       <span
//                         style={{
//                           color: "#E25454",
//                         }}
//                       >
//                         {min_order_amount.toLocaleString(
//                           currentCurrency.locale,
//                           {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           }
//                         )}
//                       </span>
//                       &nbsp; {currentCurrency.symbol} bis der Mindestbestellwert
//                       erreicht ist
//                     </span>
//                   </div>
//                 )}
//                 {cartItems.length > 0 ? (
//                   <>
//                     <ul className="cart-content-header">
//                       <li className="items-col">
//                         <h5>{currentLanguage.items}</h5>
//                       </li>
//                       <li className="qty-col">
//                         <h5>{currentLanguage.qty}</h5>
//                       </li>
//                       <li className="price-col">
//                         <h5>{currentLanguage.price}</h5>
//                       </li>
//                     </ul>

//                     {cartItems.map((item) => {
//                       const toppingsTotal =
//                         item.extras?.reduce(
//                           (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
//                           0
//                         ) || 0;
//                       // / Calculate main product total and extras total separately
//                       const mainProductTotal =
//                         item.displayPrice * item.quantity;
//                       const totalPrice =
//                         mainProductTotal + toppingsTotal * item.quantity;

//                       return (
//                         <div
//                           className="cart-items-area"
//                           key={getCartItemKey(item)}
//                           style={{ position: "relative" }}
//                         >
//                           <div className="cart-item-col">
//                             <div
//                               style={{
//                                 display: "flex",
//                                 flexDirection: "column",
//                                 gap: "8px",
//                               }}
//                             >
//                               <a
//                                 href="/adria#"
//                                 onClick={(e) => {
//                                   e.preventDefault();
//                                   removeFromCart(
//                                     item.id,
//                                     item.selectedVariant?.id || null,
//                                     item.extras || [],
//                                     item.uniqueKey
//                                   );
//                                 }}
//                               >
//                                 <img
//                                   src={`assets/user/img/red-close-icon.svg`}
//                                   alt="Remove"
//                                 />
//                               </a>
//                             </div>
//                             {!isMobileViewport &&
//                               (item.type !== "simple" ||
//                                 (item.extras && item.extras.length > 0)) && (
//                                 <a
//                                   href="/adria#"
//                                   className="text-decoration-underline text-primary cart-edit-text"
//                                   style={{
//                                     fontSize: "11px",
//                                     textAlign: "center",
//                                     marginTop: "40px",
//                                   }}
//                                   onClick={(e) => {
//                                     e.preventDefault();
//                                     const productWithExtras = {
//                                       ...item,
//                                       enriched_topping_groups:
//                                         item.enriched_topping_groups || [],
//                                     };
//                                     setSelectedProduct(productWithExtras);
//                                     setShowEditProductModal(true);
//                                   }}
//                                 >
//                                   {currentLanguage.edit}
//                                 </a>
//                               )}

//                             <div className="cart-item-text">
//                               <h6>{item.name}</h6>
//                               <span>
//                                 {item.quantity} ×{" "}
//                                 {item.selectedVariant?.name || "Standard"} [
//                                 {currentCurrency.symbol}
//                                 {item.displayPrice.toLocaleString("en-GB", {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 })}
//                                 ]
//                               </span>

//                               {item.extras?.length > 0 &&
//                                 item.extras.map((t, i) => (
//                                   <div key={t.id || i}>
//                                     <span>
//                                       {t.quantity} × {t.name} [
//                                       {currentCurrency.symbol}
//                                       {(t.price * t.quantity).toLocaleString(
//                                         "en-GB",
//                                         {
//                                           minimumFractionDigits: 2,
//                                           maximumFractionDigits: 2,
//                                         }
//                                       )}
//                                       ]
//                                     </span>
//                                   </div>
//                                 ))}
//                             </div>
//                           </div>

//                           <div className="cart-items-counter">
//                             <div className="cart-counter-text">
//                               <span
//                                 onClick={() => {
//                                   if (item.quantity === 1) {
//                                     removeFromCart(
//                                       item.id,
//                                       item.selectedVariant?.id || null,
//                                       item.extras || [],
//                                       item.uniqueKey
//                                     );
//                                   } else {
//                                     updateQuantity(
//                                       item.id,
//                                       item.selectedVariant?.id || null,
//                                       item.quantity - 1,
//                                       item.extras,
//                                       item.uniqueKey
//                                     );
//                                   }
//                                 }}
//                               >
//                                 <img
//                                   src={`assets/user/img/minus-icon.svg`}
//                                   alt="Decrease"
//                                 />
//                               </span>

//                               <qty>{item.quantity}</qty>

//                               <span
//                                 onClick={() =>
//                                   updateQuantity(
//                                     item.id,
//                                     item.selectedVariant?.id || null,
//                                     item.quantity + 1,
//                                     item.extras,
//                                     item.uniqueKey
//                                   )
//                                 }
//                               >
//                                 <img
//                                   src={`assets/user/img/plus-icon.svg`}
//                                   alt="Increase"
//                                 />
//                               </span>
//                             </div>
//                           </div>

//                           <div className="cart-items-price">
//                             <h4>
//                               {currentCurrency.symbol}
//                               {totalPrice.toLocaleString(
//                                 currentCurrency.locale,
//                                 {
//                                   minimumFractionDigits: 2,
//                                   maximumFractionDigits: 2,
//                                 }
//                               )}
//                             </h4>

//                             {/* Mobile Edit Button - Positioned at bottom-right corner */}
//                             {isMobileViewport &&
//                               (item.type !== "simple" ||
//                                 (item.extras && item.extras.length > 0)) && (
//                                 <a
//                                   href="/adria#"
//                                   className="text-decoration-underline text-primary"
//                                   style={{
//                                     fontSize: "12px",
//                                     position: "absolute",
//                                     bottom: "10px",
//                                     right: "0",
//                                     textAlign: "right",
//                                   }}
//                                   onClick={(e) => {
//                                     e.preventDefault();
//                                     const productWithExtras = {
//                                       ...item,
//                                       enriched_topping_groups:
//                                         item.enriched_topping_groups || [],
//                                     };
//                                     setSelectedProduct(productWithExtras);
//                                     setShowEditProductModal(true);
//                                   }}
//                                 >
//                                   {currentLanguage.edit}
//                                 </a>
//                               )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </>
//                 ) : (
//                   <div className="empty-cart-message">
//                     <p>{currentLanguage.your_cart_is_empty}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {cartItems.length > 0 && (
//               <div className="modal-footer">
//                 <div className="cart-area-total">
//                   <ul>
//                     <li>
//                       <h6>{currentLanguage.subtotal}</h6>
//                       <span>
//                         {currentCurrency.symbol}{" "}
//                         {cartTotal.subtotal.toLocaleString(
//                           currentCurrency.locale,
//                           {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           }
//                         )}
//                       </span>
//                     </li>

//                     {cartTotal.discountAmount > 0 && (
//                       <li>
//                         <h6>
//                           {currentLanguage.discount}{" "}
//                           <label>
//                             {currentLanguage.saved} {discountPercent}%
//                           </label>
//                         </h6>
//                         <span>
//                           {currentCurrency.symbol}{" "}
//                           {cartTotal.discountAmount.toLocaleString(
//                             currentCurrency.locale,
//                             {
//                               minimumFractionDigits: 2,
//                               maximumFractionDigits: 2,
//                             }
//                           )}
//                         </span>
//                       </li>
//                     )}

//                     {deliveryFee > 0 && orderType === "delivery" && (
//                       <li>
//                         <h6>{currentLanguage.delivery_charges}</h6>
//                         <span>
//                           {currentCurrency.symbol}{" "}
//                           {deliveryFee.toLocaleString(currentCurrency.locale, {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2,
//                           })}
//                         </span>
//                       </li>
//                     )}

//                     <li>
//                       <h6>{currentLanguage.total}</h6>
//                       <span>
//                         {currentCurrency.symbol}{" "}
//                         {(
//                           cartTotal.subtotal -
//                           cartTotal.discountAmount +
//                           deliveryFee
//                         ).toLocaleString(currentCurrency.locale, {
//                           minimumFractionDigits: 2,
//                           maximumFractionDigits: 2,
//                         })}
//                       </span>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {cartItems.length > 0 && (
//           <div className="placeorder-cart">
//             {orderType === "delivery" && (
//               <div className="placeorder-location">
//                 <img src={`assets/user/img/location-icon.svg`} alt="Location" />
//                 <h6>{postcode}</h6>
//                 <a href="#" onClick={() => setShowAddressModal(true)}>
//                   {postcode
//                     ? currentLanguage.change_postcode
//                     : currentLanguage.postCode}
//                 </a>
//               </div>
//             )}
//             <div
//               className="cart-area-footer"
//               style={{
//                 backgroundColor:
//                   !isOpen || (min_order_amount > 0 && orderType === "delivery")
//                     ? "#cfcecc"
//                     : "#ffc43b",
//                 cursor:
//                   !isOpen || (min_order_amount > 0 && orderType === "delivery")
//                     ? "not-allowed"
//                     : "pointer",
//               }}
//             >
//               <div className="cart-totalprice">
//                 <img src={`assets/user/img/blk-cart-icon.svg`} alt="Cart" />
//                 <h5>
//                   <span>
//                     {cartTotal.itemCount} {currentLanguage.items_added}
//                   </span>
//                   {(
//                     cartTotal.subtotal -
//                     cartTotal.discountAmount +
//                     deliveryFee
//                   ).toLocaleString(currentCurrency.locale, {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}{" "}
//                   {currentCurrency.symbol}
//                 </h5>
//               </div>

//               <a
//                 onClick={() => {
//                   if (
//                     !isOpen ||
//                     (orderType === "delivery" && min_order_amount > 0)
//                   )
//                     return;
//                   handleCheckout();
//                 }}
//                 style={{
//                   cursor:
//                     !isOpen ||
//                     (orderType === "delivery" && min_order_amount > 0)
//                       ? "not-allowed"
//                       : "pointer",
//                 }}
//               >
//                 {currentLanguage.view_cart}{" "}
//                 <img src={`assets/user/img/right-blk-arrow.svg`} alt="Order" />
//               </a>
//             </div>
//           </div>
//         )}
//       </div>

//       <AddressModal
//         show={showAddressModal}
//         handleClose={() => {
//           setShowAddressModal(false);
//           const cartModal = document.getElementById("cartModal");
//           if (cartModal) {
//             const modal = new bootstrap.Modal(cartModal);
//             modal.show();
//           }
//         }}
//         onPostcodeSelect={handlePostcodeSelect}
//       />
//       <EditCartModel />

//       <AddNoteModal
//         orderNote={orderNote}
//         show={showNoteModal}
//         handleClose={handleNoteModalClose} // Now properly shows viewcart area
//         onSave={handleNoteSave} // Now properly shows viewcart area
//       />
//     </>
//   );
// };

// export default CartModal;

import React, { useEffect, useState } from "react";
import { useCart } from "../../../contexts/CartContext";
import { getDisscount } from "@/api/UserServices";
import AddressModal from "./AddressModal";
import EditCartModel from "@/components/User/modals/EditCartModel";
import { useStoreStatus } from "@/contexts/StoreStatusContext";
import { useAuth } from "@/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
// --- UPDATE: Use dynamic language and currency ---
import {
  getTranslations,
  getCurrentLanguage,
  formatCurrencySync,
} from "../../../utils/helper/lang_translate";
import { useCommonData } from "../../../contexts/CommonContext";
import {
  useViewport,
  ViewportProvider,
} from "../../../contexts/ViewportContext";
// --- REMOVE: currentLanguage and currentCurrency imports ---
// import { currentLanguage } from "../../../utils/helper/lang_translate";
// import { currentCurrency } from "../../../utils/helper/currency_type";
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
  const [deliveryFee, setDeliveryFee] = useState(3);
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
  const viewcartArea = document.getElementById("caetButton");
  let modal;
  if (modalElement) {
    modal = window.bootstrap.Modal.getOrCreateInstance(modalElement);
  }

  // --- UPDATE: Get current language and translation object ---
  const language = getCurrentLanguage();
  const currentLanguage = getTranslations(language);

  // --- UPDATE: Currency formatting helper ---
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
        // setDeliveryFee(parseFloat(localStorage.getItem("delivery_fee")) || 0);
        setDeliveryFee(3);
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
    // setDeliveryFee(data.delivery_fee);
    setDeliveryFee(3);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee.toString());
  };

  const getCartItemKey = (item) => {
    // Use the uniqueKey if available, otherwise generate one
    return (
      item.uniqueKey ||
      generateCartItemKey(item.id, item.selectedVariant?.id, item.extras)
    );
  };

  const handleCheckout = () => {
    // Clean up modal before navigation
    const backdrops = document.querySelectorAll(".modal-backdrop");
    backdrops.forEach((backdrop) => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    if (!isAuthenticated) {
      navigate("/guest-login");
      return;
    }

    // Postcode check removed - navigate directly to checkout
    navigate("/update-address", {
      state: {
        orderType,
        postcode,
        deliveryFee,
      },
    });
  };

  const handleCloseModal = () => {
    // Programmatically hide the Bootstrap modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("cartModal")
    );
    if (modal) {
      modal.hide();
    }
    // Clean up backdrop
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
    // Show the cart modal again
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
              {/* Left side - postcode info commented out */}
              <div style={{ flex: 1 }}>
                {/* Postcode display commented out
                {orderType === "delivery" && (
                  <div className="cart-postcode-col">
                    <div className="postcode-icon">
                      <img
                        src={`assets/user/img/delivery-icon.svg`}
                        alt="Delivery"
                      />
                    </div>
                    <div className="header-postcode-cnt">
                      <h3
                        style={{
                          fontSize: isMobileViewport ? "12px" : "16px",
                        }}
                      >
                        {postcode}
                      </h3>
                      <i className="bi bi-chevron-down"></i>
                    </div>
                  </div>
                )} */}
              </div>

              {/* Right side - buttons */}
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
                {/* Minimum order message commented out
                {min_order_amount > 0 && orderType === "delivery" && (
                  <div
                    style={{
                      marginBottom: "15px",
                    }}
                  >
                    <img
                      src="assets/images/shop_bag.png"
                      alt=""
                      style={{
                        width: "13px",
                        height: "15px",
                        marginLeft: "0px",
                        marginRight: "5px",
                        marginBottom: "5px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: isMobileViewport ? "10.5px" : "14px",
                        color: "#303030",
                      }}
                    >
                      Noch{" "}
                      <span
                        style={{
                          color: "#E25454",
                        }}
                      >
                        {format(min_order_amount)}
                      </span>
                      &nbsp; bis der Mindestbestellwert erreicht ist
                    </span>
                  </div>
                )} */}
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
                      // Calculate main product total and extras total separately
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
                            {!isMobileViewport &&
                              (item.type !== "simple" ||
                                (item.extras && item.extras.length > 0)) && (
                                <a
                                  href="/adria#"
                                  className="text-decoration-underline text-primary cart-edit-text"
                                  style={{
                                    fontSize: "11px",
                                    textAlign: "center",
                                    marginTop: "40px",
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
                                >
                                  {currentLanguage.edit}
                                </a>
                              )}

                            <div className="cart-item-text">
                              <h6>{item.name}</h6>
                              {/* <span>
                                {item.quantity} ×{" "}
                                {item.selectedVariant?.name || "Standard"} [
                                {format(item.displayPrice)}]
                              </span> */}

                              {item.extras?.length > 0 &&
                                item.extras.map((t, i) => (
                                  <div key={t.id || i}>
                                    <span>
                                      {t.quantity} × {t.name} [
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

                            {/* Mobile Edit Button - Positioned at bottom-right corner */}
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
                                >
                                  {currentLanguage.edit}
                                </a>
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
              <div className="modal-footer">
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
            {/* Postcode display commented out
            {orderType === "delivery" && (
              <div className="placeorder-location">
                <img src={`assets/user/img/location-icon.svg`} alt="Location" />
                <h6>{postcode}</h6>
                <a href="#" onClick={() => setShowAddressModal(true)}>
                  {postcode
                    ? currentLanguage.change_postcode
                    : currentLanguage.postCode}
                </a>
              </div>
            )} */}

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
                  !isOpen || (min_order_amount > 0 && orderType === "delivery")
                    ? "#cfcecc"
                    : "#624BA1",
                cursor:
                  !isOpen || (min_order_amount > 0 && orderType === "delivery")
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
                  if (
                    !isOpen ||
                    (orderType === "delivery" && min_order_amount > 0)
                  )
                    return;
                  handleCheckout();
                }}
                style={{
                  cursor:
                    !isOpen ||
                    (orderType === "delivery" && min_order_amount > 0)
                      ? "not-allowed"
                      : "pointer",
                  color: "white",
                }}
              >
                {/* {currentLanguage.view_cart}{" "} */}
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
