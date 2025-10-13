// export default CheckoutPage;
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import {
  getDisscount,
  OrderPlace,
  getUserAddresses,
  OrderPlaceWithGustUser,
} from "../../api/UserServices";
import AddressModal from "@/components/User/modals/AddressModal";
import Header from "@/components/User/Header";
import Footer from "@/components/User/Footer";
import PaymentMethodSelector from "../../components/User/PaymentMethodSelector";
import OrderSuccess from "@/components/User/OrderSuccess";
import { useLocation } from "react-router-dom";
import {
  getCurrentLanguage,
  getTranslations,
  formatCurrencySync,
} from "../../utils/helper/lang_translate";
import { useViewport } from "../../contexts/ViewportContext";
import { currentCurrency } from "../../utils/helper/currency_type";
import { getItemfromSessionStorage } from "../../utils/helper/accessToken";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("delivery");
  const [orderTypeCode, setOrderTypeCode] = useState(1);
  const [postcode, setPostcode] = useState("53604");
  const [deliveryFee, setDeliveryFee] = useState(3);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountId, setDiscountId] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [addresses, setAddresses] = useState(null);
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const { isMobileViewport } = useViewport();
  const [searchParams] = useSearchParams();
  const isGuestLogin = searchParams.get("isGuestLogin");

  // --- Language & formatting helper ---
  const language = getCurrentLanguage();
  const currentLanguage = getTranslations(language);
  const format = (amount) => formatCurrencySync(amount, language);

  useEffect(() => {
    const storedCart = localStorage.getItem("cartItems");
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const addressRes = await getUserAddresses();
        setAddresses(addressRes.data[0]);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    if (orderType === "delivery") {
      fetchAddresses();
    }
  }, []);

  useEffect(() => {
    const ot = localStorage.getItem("order_type") || "delivery";
    setOrderType(ot);
    setOrderTypeCode(ot === "pickup" ? 2 : 1);
    getDisscount(import.meta.env.VITE_STORE_ID).then((ds) => {
      const code = `${ot.toUpperCase()}_DISCOUNT`;
      const d = ds.find((x) => x.code === code);
      if (d) {
        setDiscountPercent(d.value);
        setDiscountId(d.id);
      }
    });

    if (ot === "pickup") {
      setDeliveryFee(0);
    } else {
      const pc = localStorage.getItem("delivery_postcode") || "";
      const df = parseFloat(localStorage.getItem("delivery_fee")) || 0;
      setPostcode(pc);
      setDeliveryFee(3);
    }
  }, []);

  const getCartItemKey = (item) => {
    const toppingsKey =
      item.extras
        ?.map((extra) => `${extra.id}:${extra.quantity}`)
        .sort()
        .join("|") || "";
    return `${item.id}-${item.selectedVariant?.id || "base"}-${toppingsKey}`;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const basePrice = item.selectedVariant ? item.displayPrice : item.price;
      const toppingTotal =
        item.extras?.reduce(
          (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
          0
        ) || 0;
      return total + (basePrice + toppingTotal) * item.quantity;
    }, 0);
  };

  const calculateTotalTax = () => {
    return cartItems.reduce((total, item) => {
      const taxRate = item.category.tax.percentage || 0;
      const price = item.selectedVariant ? item.displayPrice : item.price;
      return total + (price * item.quantity * taxRate) / 100;
    }, 0);
  };

  const handlePostcodeSelect = (data) => {
    setPostcode(data.postcode);
    localStorage.setItem("delivery_postcode", data.postcode);
    localStorage.setItem("delivery_fee", data.delivery_fee);
    localStorage.setItem("order_type", "delivery");
    setOrderType("delivery");
  };

  const subtotal = calculateSubtotal();
  const totalTax = calculateTotalTax();
  const discountAmount = (discountPercent / 100) * subtotal;
  const grandTotal = subtotal - discountAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    const orderNote = localStorage.getItem("orderNote") || "";
    const guest_address = JSON.parse(
      getItemfromSessionStorage({ tokenName: "guestShippingAddress" })
    );

    const guest_shipping_address = {
      type: guest_address?.type || "shipping",
      line1: guest_address?.line1 || "",
      city: guest_address?.city + " " + guest_address?.zip || "",
      zip: "00000",
      country: guest_address?.country || "",
      phone: guest_address?.phone || "",
      customer_name: guest_address?.customer_name || "",
    };

    const items = cartItems.map((item) => ({
      product_id: item.id,
      variant_id: item.selectedVariant?.id || 0,
      quantity: item.quantity,
      unit_price: item.selectedVariant ? item.displayPrice : item.price,
      note: "",
      toppings:
        item.extras?.map((t) => ({
          topping_id: t.id,
          quantity: t.quantity || 1,
        })) || [],
    }));

    const body = {
      user_id: user?.id || 0,
      discount_id: null,
      note: orderNote,
      order_type: orderTypeCode,
      order_status: 1,
      approval_status: 1,
      store_id: import.meta.env.VITE_STORE_ID,
      guest_shipping_address:
        isGuestLogin === "true" ? guest_shipping_address : null,
      items,
      payment: {
        payment_method: paymentMethod === "online" ? "online" : "cash",
        status: paymentMethod === "online" ? "paid" : "pending",
        paid_at: new Date().toISOString(),
        order_id: 0,
        amount: grandTotal,
      },
    };

    console.log("Body ======>", body);

    try {
      let resp;
      if (isGuestLogin === "true") {
        body.email = guest_address?.email || null;
        console.log("body ===>", body);
        resp = await OrderPlaceWithGustUser(body);
      } else {
        resp = await OrderPlace(body);
      }
      setOrderId(resp.data.id);
      setOrderSuccess(true);
      localStorage.setItem("order_placed", "true");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("OrderPlace error:", err);
      alert("Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <Header status={false} />
      <section
        className="checkout-area"
        style={{ paddingBottom: isMobileViewport ? "100px" : "0" }}
      >
        <div className="container" style={{ maxWidth: "1170px" }}>
          <div className="row">
            <div className="col-lg-6 col-sm-6 col-12">
              {orderSuccess ? (
                <OrderSuccess orderId={orderId} />
              ) : (
                <PaymentMethodSelector
                  onPaymentMethodChange={(method) => setPaymentMethod(method)}
                  handlePlaceOrder={handlePlaceOrder}
                  grandTotal={grandTotal}
                  placing={placing}
                  orderSuccess={orderSuccess}
                />
              )}
            </div>
            <div className="col-lg-2 d-lg-block d-sm-none"></div>
            <div className="col-lg-4 col-sm-6 col-12">
              <div className="checkout-cart-area">
                <div
                  className="checkout-cart-header"
                  onClick={() =>
                    orderType === "delivery" && setShowAddressModal(true)
                  }
                  style={{
                    cursor: orderType === "delivery" ? "pointer" : "default",
                  }}
                >
                  <span>
                    <img
                      src={`assets/user/img/${
                        orderType === "pickup" || postcode === ""
                          ? ""
                          : "delivery-icon.svg"
                      }`}
                      alt="Delivery"
                      style={{
                        display:
                          orderType === "pickup" || postcode === ""
                            ? "none"
                            : "block",
                      }}
                    />
                  </span>
                  <h5>
                    {/* Postcode display commented out
                    {orderType !== "pickup" && postcode !== "" && (
                      <h3>
                        {postcode}
                        <em>
                          {addresses?.line1} {addresses?.city}{" "}
                          {addresses?.country}
                        </em>
                      </h3>
                    )} */}
                  </h5>
                </div>

                <div
                  className="checkout-cart-item-area"
                  style={{
                    maxHeight: isMobileViewport ? "50vh" : "none",
                    overflowY: isMobileViewport ? "auto" : "visible",
                  }}
                >
                  <ul className="cart-content-header">
                    <li className="items-col">
                      <h5>{currentLanguage.items || "Items"}</h5>
                    </li>
                    <li className="qty-col">
                      <h5>{currentLanguage.qty || "Qty"}</h5>
                    </li>
                    <li className="price-col">
                      <h5>{currentLanguage.price || "Price"}</h5>
                    </li>
                  </ul>

                  {cartItems.map((item) => {
                    const toppingsTotal =
                      item.extras?.reduce(
                        (sum, t) => sum + (t.price || 0) * (t.quantity || 1),
                        0
                      ) || 0;
                    const totalPrice =
                      (item.displayPrice + toppingsTotal) * item.quantity;

                    return (
                      <div
                        className="cart-items-area"
                        key={getCartItemKey(item)}
                      >
                        <div className="cart-item-col">
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
                            <qty>{item.quantity}</qty>
                          </div>
                        </div>
                        <div className="cart-items-price">
                          <h4>{format(totalPrice)}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Totals */}
                <div
                  className={`cehckout-area-total ${
                    isMobileViewport ? "d-none" : "d-block"
                  }`}
                >
                  <ul>
                    <li>
                      <h6>{currentLanguage.subtotal}</h6>
                      <span>{format(subtotal)}</span>
                    </li>
                    {discountAmount > 0 && (
                      <li>
                        <h6>
                          {currentLanguage.discount}{" "}
                          <label>
                            {currentLanguage.saved} {discountPercent}%
                          </label>
                        </h6>
                        <span>{format(discountAmount)}</span>
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
                      <span>{format(grandTotal)}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Desktop Button */}
              <div
                className={`checkout-pay-button mt-3 ${
                  isMobileViewport ? "d-none" : "d-block"
                }`}
                style={{ display: "block" }} // Force show for debugging
              >
                <button
                  className="btn pay-button"
                  onClick={handlePlaceOrder}
                  disabled={
                    placing || orderSuccess || paymentMethod === "online"
                  }
                >
                  {placing ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {currentLanguage.processing}...
                    </>
                  ) : paymentMethod === "online" ? (
                    currentLanguage.pay_now || "Pay Now"
                  ) : (
                    currentLanguage.place_order || "Place Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating Totals and Button */}
      {isMobileViewport && (
        <div
          className="position-fixed w-100 d-block d-lg-none"
          style={{
            bottom: "0",
            left: "0",
            zIndex: 1000,
            backgroundColor: "#fff",
            borderTop: "1px solid #eee",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="cehckout-area-total px-3 py-2"
            style={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <ul style={{ margin: 0, padding: 0 }}>
              <li>
                <h6>{currentLanguage.subtotal}</h6>
                <span>{format(subtotal)}</span>
              </li>
              {discountAmount > 0 && (
                <li>
                  <h6>
                    {currentLanguage.discount}{" "}
                    <label>
                      {currentLanguage.saved} {discountPercent}%
                    </label>
                  </h6>
                  <span>{format(discountAmount)}</span>
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
                <span>{format(grandTotal)}</span>
              </li>
            </ul>
          </div>

          <div className="checkout-pay-button p-3" style={{ display: "block" }}>
            <button
              className="btn pay-button"
              onClick={handlePlaceOrder}
              disabled={placing || orderSuccess || paymentMethod === "online"}
              style={{
                borderRadius: "8px",
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {placing ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {currentLanguage.processing}...
                </>
              ) : paymentMethod === "online" ? (
                currentLanguage.pay_now || "Pay Now"
              ) : (
                currentLanguage.place_order || "Place Order"
              )}
            </button>
          </div>
        </div>
      )}

      <Footer />
      <AddressModal
        show={showAddressModal}
        handleClose={() => setShowAddressModal(false)}
        onPostcodeSelect={handlePostcodeSelect}
      />
    </>
  );
};

export default CheckoutPage;
