import React, { useRef, useEffect, useState } from "react";
import { useViewport } from "../../contexts/ViewportContext";
import { useCart } from "../../contexts/CartContext";

const ProductCategory = ({
  categories,
  onSelect,
  selectedCategoryId,
  isInitialized,
  loading = false,
  allProducts = {}, // Add this prop to receive products
}) => {
  const refs = useRef({});
  const scrollTimeoutRef = useRef(null);
  const { isMobileViewport } = useViewport();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const categoryListRef = useRef(null);
  const { itemCount } = useCart();

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
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    if (
      selectedCategoryId &&
      refs.current[selectedCategoryId] &&
      isInitialized
    ) {
      scrollTimeoutRef.current = setTimeout(() => {
        const element = refs.current[selectedCategoryId];
        if (element) {
          const container = element.closest(".hm-category-list");
          if (container) {
            const containerRect = container.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            if (
              elementRect.left < containerRect.left ||
              elementRect.right > containerRect.right
            ) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
                inline: "center",
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

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  if (loading || !categories?.length) {
    return (
      <ul className="sidebar hm-category-list active">
        {[...Array(5)].map((_, index) => (
          <li key={`skeleton-${index}`}>
            <div
              style={{
                background: "#e0e0e0",
                borderRadius: "20px",
                minWidth: "140px",
                height: "180px",
                animation: "pulse 1.5s ease-in-out infinite",
              }}
            />
          </li>
        ))}
      </ul>
    );
  }

  if (!categories?.length) return null;

  return (
    <ul
      ref={categoryListRef}
      className="sidebar hm-category-list active"
      style={{
        ...(isMobileViewport && {
          transition: "height 0.3s ease-in-out",
        }),
      }}
    >
      {categories.map((category) => {
        return (
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
            >
              <img
                className="img-fluid"
                src={
                  category.image_url
                    ? `${category.image_url.split("?")[0]}`
                    : "assets/images/default-category.png"
                }
                alt={category.name}
              />
              <h6>{category.name}</h6>
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default ProductCategory;
