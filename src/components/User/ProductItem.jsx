import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import ProductDetailModal from "./modals/ProductDetailModal";

const ProductItem = ({ product }) => {
  const { cartItems } = useCart();

  const [showDetailModal, setShowDetailModal] = useState(false);

  // ✅ Quantity calculation - show total quantity for this product
  const quantity = cartItems
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleProductClick = () => {
    // Open product detail modal instead of adding to cart directly
    setShowDetailModal(true);
  };


  return (
    <div className="col">
      <div className="product-cnt-col">
        {/* Product image */}
        <div
          className="prdct-img"
          onClick={handleProductClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src={product.image_url.split("?")[0]}
            alt={product.name}
            style={{ width: "100%", borderRadius: "8px" }}
            // onError={(e) => {
            //   e.target.src = "/assets/images/t-shirt.png";
            // }}
          />
        </div>

        {/* Product text */}
        <div className="prdct-text">
          <h4>{product.name}</h4>
          <p className="text-sm text-gray-700">{product.description}</p>
        </div>

        <div className="prdct-col-footer">
          {/* ✅ PRICE (original) */}
          {product.type === "simple" ? (
            <h5>£{product.price}</h5>
          ) : (
            <div className="variant-select">
              {product.variants && product.variants.length > 0 ? (
                <h5>£{product.variants[0].price}</h5>
              ) : (
                <h5>£{product.price}</h5>
              )}
            </div>
          )}

          {/* ADD BUTTON */}
          <div className="prdct-col-counter" style={{ position: "relative" }}>
            {quantity > 0 && (
              <div
                className="quantity-display"
                style={{
                  position: "absolute",
                  top: "-8px",
                  left: "-8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#FCB906", // Yellow color
                  color: "#624BA1",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  zIndex: "10",

                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {quantity}
              </div>
            )}
            <button
              className="add-btn"
              onClick={handleProductClick}
              style={{
                backgroundColor: quantity > 0 ? "green" : "",
                color: quantity > 0 ? "white" : "",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "url('./assets/images/addCart-icon.png')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "20px 20px",
              }}
            ></button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={product}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default ProductItem;
