import React, { useState } from "react";
import { useCart } from "../../contexts/CartContext";

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const [zoom, setZoom] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    console.log("Product being added to cart:", product);
    console.log("Product price:", product.price);
    addToCart(product, null, 1, []);
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✖</button>

        <div className="modal-body">
          {/* Left Side: Image with zoom */}
          <div
            className={`image-container ${zoom ? "zoomed" : ""}`}
            onClick={() => setZoom(!zoom)}
          >
            <img
              src="/assets/images/t-shirt.png"
              alt={product.name}
              style={{ 
                width: "100%", 
                height: "400px", 
                objectFit: "cover",
                maxWidth: "100%",
                height: "auto"
              }}
            />
          </div>

          {/* Right Side: Details */}
          <div className="details">
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <h3>Price: £{product.price}</h3>

            <button className="add-cart" onClick={handleAddToCart}>Add to Cart</button>

            {product.history && (
              <div className="history">
                <h4>Purchase History</h4>
                <ul>
                  {product.history.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
