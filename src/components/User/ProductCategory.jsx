import React, { useRef, useEffect, useState } from "react";
import { ProductCategorySkeleton } from "../../../ui/Loader/ProductCategorySkeleton";
import { currentLanguage } from "../../utils/helper/lang_translate";
import { useViewport } from "../../contexts/ViewportContext";
import { useCart } from "../../contexts/CartContext";

const ProductCategory = ({
  categories,
  onSelect,
  selectedCategoryId,
  isInitialized,
  loading = false,
}) => {
  const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "";
  const refs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const { isMobileViewport } = useViewport();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const categoryListRef = useRef(null);
  const { itemCount } = useCart();

  // Header visibility detection - separate from your scroll functionality
  useEffect(() => {
    if (!isMobileViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    // Try multiple possible header selectors
    const headerElement =
      document.querySelector("header") ||
      document.querySelector(".header") ||
      document.querySelector("#hero") ||
      document.querySelector('[class*="header"]');

    if (headerElement) {
      observer.observe(headerElement);
    }

    return () => {
      if (headerElement) {
        observer.unobserve(headerElement);
      }
    };
  }, [isMobileViewport, itemCount]);

  useEffect(() => {
    if (categoryListRef.current && isMobileViewport) {
      const viewportHeight = window.innerHeight;
      let availableHeight;
      if (itemCount > 0) {
        availableHeight = isHeaderVisible
          ? viewportHeight * 0.51 // 40% of viewport when header visible
          : viewportHeight * 0.8;
      } else {
        availableHeight = isHeaderVisible
          ? viewportHeight * 0.63 // 40% of viewport when header visible
          : viewportHeight * 0.95;
      }
    }
  }, [isHeaderVisible, isMobileViewport, itemCount]);

  // YOUR EXISTING SCROLL FUNCTIONALITY - UNCHANGED
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Only scroll if the component is initialized and there's a user interaction
    // Avoid scrolling on initial load
    if (
      selectedCategoryId &&
      refs.current[selectedCategoryId] &&
      isInitialized
    ) {
      scrollTimeoutRef.current = setTimeout(() => {
        const element = refs.current[selectedCategoryId];
        if (element) {
          // Check if the element is already visible in the viewport
          const container = element.closest(".hm-category-list");
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            // Only scroll if element is not fully visible
            if (
              elementRect.left < containerRect.left ||
              elementRect.right > containerRect.right
            ) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "start",
              });
            }
          }
        }
      }, 100);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [selectedCategoryId, isInitialized]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (loading || !categories?.length) {
    return <ProductCategorySkeleton />;
  }

  if (!categories?.length)
    return <div>{currentLanguage.no_categories_available}</div>;

  return (
    <ul
      ref={categoryListRef}
      className="sidebar hm-category-list active"
      style={{
        // Only add height for mobile, don't interfere with existing styles
        ...(isMobileViewport && {
          transition: "height 0.3s ease-in-out",
          overflowY: "auto",
        }),
      }}
    >
      {categories.map((category) => (
        <li
          key={`cat-${category.id}`}
          ref={(el) => (refs.current[category.id] = el)}
        >
          <a
            href="#"
            className={selectedCategoryId === category.id ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              onSelect(category.id);
            }}
            data-category-id={category.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              padding: "10px",
            }}
          >
            <img
              className="img-fluid"
              src={
                category.image_url
                  ? `${
                      category.image_url.split("?")[0] || "default-category.png"
                    }`
                  : "assets/images/default-category.png"
              }
              alt={category.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                marginBottom: "5px",
              }}
            />
            <h6
              style={{
                margin: 0,
                // Apply different styles based on mobile and text type
                ...(isMobileViewport && {
                  maxWidth: "80px",
                  wordWrap: "break-word",
                  whiteSpace: "normal",
                  lineHeight: "1.2",
                }),
              }}
              title={category.name}
            >
              {isMobileViewport
                ? (() => {
                    const words = category.name.split(" ");
                    const hasLongWord = words.some((word) => word.length > 10);

                    if (hasLongWord) {
                      return words.map((word, index) => (
                        <React.Fragment key={index}>
                          {word.length > 10
                            ? `${word.substring(0, 10)}...`
                            : word}
                          {index < words.length - 1 && <br />}
                        </React.Fragment>
                      ));
                    } else {
                      return category.name;
                    }
                  })()
                : category.name}
            </h6>
          </a>
        </li>
      ))}
    </ul>
  );
};

export default ProductCategory;
