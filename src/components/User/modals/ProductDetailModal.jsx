import React, { useState } from 'react';
import { useCart } from '../../../contexts/CartContext';
import { currentCurrency } from '../../../utils/helper/currency_type';
import { currentLanguage } from '../../../utils/helper/lang_translate';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ProductDetailModal = ({ product, isOpen, onClose }) => {
  const { addToCart, cartItems } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0, visible: false });
  const [isHovering, setIsHovering] = useState(false);

  if (!isOpen || !product) return null;

  const format = (price) => {
    return `${currentCurrency.symbol}${price.toFixed(2)}`;
  };

  const handleAddToCart = () => {
    console.log("ProductDetailModal - Product being added:", product);
    console.log("ProductDetailModal - Quantity:", quantity);
    console.log("ProductDetailModal - Calling addToCart with:", { product, variant: null, quantity, extras: [] });
    
    // Pass the converted price to cart (same as ProductItem)
    const productWithConvertedPrice = {
      ...product,
      convertedPrice: product.price // Use the price that's displayed in modal
    };
    
    addToCart(productWithConvertedPrice, null, quantity, []);
    onClose();
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const images = product.images || ["/assets/images/t-shirt.png"];
  const currentImage = images[selectedImage] || "/assets/images/t-shirt.png";

  return (
    <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{product.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="row">
              {/* Product Images */}
              <div className="col-md-6">
                <div className="product-image-container" style={{ position: 'relative' }}>
                  {/* Left: Main Product Image */}
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="img-fluid product-zoom-image"
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'zoom-in',
                      
                    }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      
                      // Constrain lens within image bounds
                      const lensSize = 100;
                      const constrainedX = Math.max(0, Math.min(x - lensSize/2, rect.width - lensSize));
                      const constrainedY = Math.max(0, Math.min(y - lensSize/2, rect.height - lensSize));
                      
                      // Update lens position
                      setLensPosition({ 
                        x: constrainedX, 
                        y: constrainedY, 
                        visible: true 
                      });
                      
                      // Update zoomed view with live tracking
                      const zoomedView = document.getElementById('zoomed-view');
                      if (zoomedView) {
                        const xPercent = (x / rect.width) * 100;
                        const yPercent = (y / rect.height) * 100;
                        zoomedView.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
                      }
                    }}
                    onTouchMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const touch = e.touches[0];
                      const x = touch.clientX - rect.left;
                      const y = touch.clientY - rect.top;
                      
                      // Constrain lens within image bounds
                      const lensSize = 100;
                      const constrainedX = Math.max(0, Math.min(x - lensSize/2, rect.width - lensSize));
                      const constrainedY = Math.max(0, Math.min(y - lensSize/2, rect.height - lensSize));
                      
                      // Update lens position
                      setLensPosition({ 
                        x: constrainedX, 
                        y: constrainedY, 
                        visible: true 
                      });
                      
                      // Update zoomed view with live tracking
                      const zoomedView = document.getElementById('zoomed-view');
                      if (zoomedView) {
                        const xPercent = (x / rect.width) * 100;
                        const yPercent = (y / rect.height) * 100;
                        zoomedView.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
                      }
                    }}
                    onMouseEnter={() => {
                      setIsHovering(true);
                      const zoomedView = document.getElementById('zoomed-view');
                      if (zoomedView) {
                        zoomedView.style.display = 'block';
                        zoomedView.style.opacity = '1';
                      }
                      // Hide text content during tracking
                      const productDetails = document.getElementById('product-details');
                      if (productDetails) {
                        productDetails.style.display = 'none';
                      }
                    }}
                    onTouchStart={() => {
                      setIsHovering(true);
                      const zoomedView = document.getElementById('zoomed-view');
                      if (zoomedView) {
                        zoomedView.style.display = 'block';
                        zoomedView.style.opacity = '1';
                      }
                      // Hide text content during tracking
                      const productDetails = document.getElementById('product-details');
                      if (productDetails) {
                        productDetails.style.display = 'none';
                      }
                    }}
                    onMouseLeave={() => {
                      setIsHovering(false);
                      const zoomedView = document.getElementById('zoomed-view');
                      if (zoomedView) {
                        zoomedView.style.display = 'none';
                        zoomedView.style.opacity = '0';
                      }
                      setLensPosition({ x: 0, y: 0, visible: false });
                      // Show text content again
                      const productDetails = document.getElementById('product-details');
                      if (productDetails) {
                        productDetails.style.display = 'block';
                      }
                    }}
                    onTouchEnd={() => {
                      setIsHovering(false);
                      const zoomedView = document.getElementById('zoomed-view');
                      if (zoomedView) {
                        zoomedView.style.display = 'none';
                        zoomedView.style.opacity = '0';
                      }
                      setLensPosition({ x: 0, y: 0, visible: false });
                      // Show text content again
                      const productDetails = document.getElementById('product-details');
                      if (productDetails) {
                        productDetails.style.display = 'block';
                      }
                    }}
                  />
                  
                  {/* Blue Transparent Dotted Lens */}
                  {lensPosition.visible && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${lensPosition.x}px`,
                        top: `${lensPosition.y}px`,
                        width: '100px',
                        height: '100px',
                        border: '2px dashed #007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        borderRadius: '4px',
                        pointerEvents: 'none',
                        zIndex: 999,
                        transition: 'all 0.05s ease-out',
                        boxShadow: '0 0 10px rgba(0, 123, 255, 0.3)'
                      }}
                    />
                  )}
                  
                  {/* Right: Zoomed Portion with Live Tracking */}
                  <div 
                      id="zoomed-view"
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: window.innerWidth <= 768 ? '-200px' : '-450px',
                        width: window.innerWidth <= 768 ? '200px' : '400px',
                        height: window.innerWidth <= 768 ? '200px' : '400px',
                        backgroundImage: `url(${currentImage})`,
                        backgroundSize: window.innerWidth <= 768 ? '400px 400px' : '800px 800px',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: '0% 0%',
                        borderRadius: '8px',
                        border: '2px solid #007bff',
                        display: 'none',
                        opacity: '0',
                        zIndex: 1000,
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                        transition: 'opacity 0.2s ease-out'
                      }}
                    />
                  
                  {/* Image Thumbnails */}
                  {images.length > 1 && (
                    <div className="image-thumbnails mt-3">
                      <div className="row">
                        {images.map((image, index) => (
                          <div key={index} className="col-3 mb-2">
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className={`img-thumbnail cursor-pointer ${
                                selectedImage === index ? 'border-primary' : ''
                              }`}
                              style={{
                                width: '100%',
                                height: '60px',
                                objectFit: 'cover',
                                cursor: 'pointer'
                              }}
                              onClick={() => setSelectedImage(index)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="col-md-6" id="product-details">
                <div className="product-details">
                  <h3 className="product-name ">{product.name}</h3>
                  
                  <div className="product-price ">
                    <span className="price-display" style={{ fontSize: '24px', fontWeight: 'bold', color: '#624ba1' }}>
                      {format(product.price)}
                    </span>
                  </div>

                  <div className="product-description ">
                    <h6>Description:</h6>
                    <p className="text-muted">
                      {product.description || 'No description available for this product.'}
                    </p>
                  </div>

                  {/* Quantity Selector */}
                  <div className="quantity-selector ">
                    <h6>Quantity:</h6>
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        style={{ width: '40px', height: '40px' }}
                      >
                        -
                      </button>
                      <span className="mx-3" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {quantity}
                      </span>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => handleQuantityChange(1)}
                        style={{ width: '40px', height: '40px' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="add-to-cart-section">
                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={handleAddToCart}
                      style={{
                        backgroundColor: '#624ba1',
                        borderColor: '#624ba1',
                        padding: '12px 24px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      <img 
                        src="/assets/user/img/blk-cart-icon.svg" 
                        alt="Cart" 
                        style={{ width: "16px", height: "16px", marginRight: "8px" }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
