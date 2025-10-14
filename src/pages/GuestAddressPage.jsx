import React, { useEffect, useState } from "react";
import Footer from "@/components/User/Footer";
import Header from "@/components/User/Header";
import { currentLanguage } from "../utils/helper/lang_translate";
import { currentCurrency } from "../utils/helper/currency_type";
import { useNavigate } from "react-router-dom";
import { setIteminSessionStorage } from "../utils/helper/accessToken";
import { useStoreStatus } from "../contexts/StoreStatusContext";

const GuestAddressPage = () => {
  const [guestShippingAddress, setGuestShippingAddress] = useState({
    type: "shipping",
    line1: "",
    city: "",
    zip: "",
    country: currentCurrency.name,
    phone: "",
    customer_name: "",
    email: "",
  });

  const { postCode, setPostCode } = useStoreStatus();
  const [orderType, setOrderType] = useState(
    localStorage.getItem("order_type")
  );
  const navigate = useNavigate();

  useEffect(() => {
    setGuestShippingAddress((prev) => ({
      ...prev,
      // zip: postCode,
    }));
  }, [postCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuestShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // check if all required fields are filled
    if (
      !guestShippingAddress.customer_name ||
      !guestShippingAddress.line1 ||
      !guestShippingAddress.phone
    ) {
      alert(currentLanguage.form_fill_message);
      return;
    }

    if (orderType === "delivery" && !guestShippingAddress.zip) {
      alert(currentLanguage.form_fill_message);
      return;
    }

    const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (storedCart.length > 0) {
      setIteminSessionStorage({
        tokenName: "guestShippingAddress",
        token: JSON.stringify(guestShippingAddress),
      });
      navigate("/checkout?isGuestLogin=true");
    } else {
      alert(currentLanguage.your_cart_is_empty);
      navigate(-1);
    }
  };

  return (
    <div>
      <Header status={false} />

      <section id="register-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="registration-form">
                <h5>{currentLanguage.update_your_info}</h5>
                <form onSubmit={handleSubmit}>
                  <h6>
                    <span>
                      {currentLanguage.enter_shipping_address ||
                        "Enter Your Shipping Address"}
                    </span>
                  </h6>
                  <p>
                    <label>{currentLanguage.your_name || "Your Name"} *</label>
                    <input
                      type="text"
                      name="customer_name"
                      placeholder="Your Name"
                      value={guestShippingAddress.customer_name}
                      onChange={handleChange}
                      required
                    />
                  </p>
                  <p>
                    <label>
                      {currentLanguage.your_phone || "Phone Number"} *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={guestShippingAddress.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, ""); // only numbers
                        if (value.length <= 15) {
                          // allows up to 15 digits (international standard)
                          setGuestShippingAddress((prev) => ({
                            ...prev,
                            phone: value,
                          }));
                        }
                      }}
                      required
                    />
                  </p>
                  <>
                    <p>
                      <label>
                        {currentLanguage.your_email || "Your Email"}{" "}
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="example@email.com"
                        value={guestShippingAddress.email}
                        onChange={handleChange}
                      />
                    </p>
                    <p>
                      <label>{currentLanguage.Address || "Address"} *</label>
                      <input
                        type="text"
                        name="line1"
                        placeholder="Address"
                        value={guestShippingAddress.line1}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    <p>
                      <label>{currentLanguage.city || "City"} *</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={guestShippingAddress.city}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    {orderType == "delivery" && (
                      <p>
                        <label>
                          {currentLanguage.postCode || "Zip Code"} *
                        </label>
                        <input
                          type="value"
                          name="zip"
                          placeholder="Zip Code"
                          value={guestShippingAddress.zip}
                          onChange={handleChange}
                          required
                        />
                      </p>
                    )}
                  </>

                  {/* <p>
                    <label>{currentLanguage.country || "Country"} *</label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Country"
                      value={guestShippingAddress.country}
                      // onChange={handleChange}
                      required
                      readOnly
                    />
                  </p> */}
                  <p>
                    <button type="submit">Continue</button>
                  </p>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.already_have_account}{" "}
                    <a href={"/login/update-address"}>
                      {currentLanguage.login_here}
                    </a>
                  </p>
                  <p style={{ textAlign: "center", marginTop: "15px" }}>
                    {currentLanguage.dont_have_account}{" "}
                    <a href={"/register"}>{currentLanguage.register_here}</a>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuestAddressPage;
