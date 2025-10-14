import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import {
  updateAddresses,
  getUserAddresses,
  getUserMe,
  userAddresses,
} from "@/api/UserServices";
import Header from "@/components/User/Header";
import Footer from "@/components/User/Footer";
import { useCart } from "../../contexts/CartContext";
import { currentLanguage } from "../../utils/helper/lang_translate";
import { currentCurrency } from "../../utils/helper/currency_type";

const UserAddress = () => {
  const [formData, setFormData] = useState({
    type: "shipping",
    line1: "",
    area: "",
    city: "",
    // zip: "00000", // Postcode field removed
    country: currentCurrency.name,
    phone: "",
    customer_name: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [postcode, setPostcode] = useState(null);
  const [user, setUser] = useState(null);
  const { showPostCode } = useCart();

  useEffect(() => {
    const storedPostcode = localStorage.getItem("delivery_postcode");
    const order_type = localStorage.getItem("order_type");
    setPostcode(storedPostcode);

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        const userResponse = await getUserMe();
        setUser(userResponse);
        const response = await getUserAddresses();
        setAddresses(response.data);

        if (response.data.length > 0) {
          const first = response.data[0];
          setSelectedAddressId(first.id);
          setFormData({
            type: "shipping",
            line1: first.line1,
            area: first.area || "",
            city: first.city || "",
            zip: "00000", // Postcode field removed
            country: first.country,
            phone: first.phone,
            customer_name: first.customer_name,
          });
        }

        setInitialized(true);
      } catch (err) {
        console.error("Error In User Address page ===>", err);
        if (err.response.statusText == "Unauthorized") {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        type: "shipping",
        line1: formData.line1,
        city: formData.city,
        zip: formData.zip, // Postcode field removed
        country: formData.country,
        phone: formData.phone,
        user_id: user.id,
        customer_name: formData.customer_name,
      };

      if (formData.area) {
        payload.area = formData.area;
      }

      if (addresses.length === 0) {
        await userAddresses(payload);
      } else {
        await updateAddresses(payload, selectedAddressId);
      }

      const updatedAddresses = await getUserAddresses();
      setAddresses(updatedAddresses.data);
      navigate("/checkout");
    } catch (err) {
      console.error("Error updating address:", err);
      setError(
        err.response?.data?.detail || err.message || "Failed to update address"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header status={false} />

      {/* ✅ Loader */}
      {loading && !initialized && (
        <div
          id="spinner"
          className="show position-fixed translate-middle w-100 vh-100 top-50 start-50 d-flex align-items-center justify-content-center"
          style={{
            zIndex: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.3)", // halka transparent background
            backdropFilter: "blur(1px)", // blur effect
            WebkitBackdropFilter: "blur(1px)", // Safari support
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* ✅ Form Section */}
      <section id="register-area" style={{ minHeight: "70vh" }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {!loading && initialized && (
                <div className="registration-form">
                  <h5>
                    {currentLanguage.update_your_info || "Update your info"}
                  </h5>
                  <form onSubmit={handleSubmit}>
                    <h6>
                      <span>
                        {currentLanguage.edit_address_details ||
                          "Edit Address Details"}
                      </span>
                    </h6>
                    {error && (
                      <p
                        style={{
                          color: error.includes("success") ? "green" : "red",
                        }}
                      >
                        {error}
                      </p>
                    )}

                    <p>
                      <label>
                        {currentLanguage.customer_name || "Customer Name"} *
                      </label>
                      <input
                        type="text"
                        name="customer_name"
                        value={formData.customer_name}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    <p>
                      <label>{currentLanguage.Addres || "Address"}*</label>
                      <input
                        type="text"
                        name="line1"
                        placeholder="Address"
                        value={formData.line1}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    <p>
                      <label>{currentLanguage.city || "City"} *</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Stadt"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    {/* Postcode field commented out */}
                    <p>
                      <label>{currentLanguage.postCode || "Postcode"} *</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        required
                        disabled
                      />
                    </p>

                    {/* <p>
                      <label>{currentLanguage.country || "Country"} *</label>
                      <input
                        type="text"
                        name="country"
                        placeholder="lAND"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      />
                    </p> */}

                    <p>
                      <label>
                        {currentLanguage.your_phone || "Your Phone"} *
                      </label>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </p>

                    <p>
                      <button type="submit" disabled={submitting}>
                        {submitting
                          ? `${currentLanguage.updating}...`
                          : currentLanguage.view_cart}
                      </button>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UserAddress;
