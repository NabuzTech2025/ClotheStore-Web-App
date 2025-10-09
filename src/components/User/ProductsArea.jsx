import React, { useState, useEffect, useCallback, useRef } from "react";
import ProductCategory from "./ProductCategory";
import ProductSection from "./ProductSection";
import { getCategory } from "@/api/UserServices";
import { debounce } from "lodash";
import { ProductSectionSkeleton } from "../../../ui/Loader/ProductSectionSkeleton";
import { ProductCategorySkeleton } from "../../../ui/Loader/ProductCategorySkeleton";
import { useStoreStatus } from "../../contexts/StoreStatusContext";
import Footer from "@/components/User/Footer";

import {
  StoreStatusLoadingBadge,
  StoreStatusSkeleton,
} from "../../../ui/Loader/StoreStatusSkeleton";
import { currentLanguage } from "../../utils/helper/lang_translate";
import { useCart } from "../../contexts/CartContext";
import { useCommonData } from "../../contexts/CommonContext";
import sortCategoriesByDisplayOrder from "../../utils/helper/User/sortCategoriesByDisplayOrder";
import { useViewport } from "../../contexts/ViewportContext";
import { BiLoader } from "react-icons/bi";
import { currentCurrency } from "../../utils/helper/currency_type";

const ProductsArea = ({ searchTerm }) => {
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState({});
  const [categoryMeta, setCategoryMeta] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState({ categories: true, products: true });
  const [loadingMore, setLoadingMore] = useState({});
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isUserClick = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const observerRefs = useRef({});
  const { isMobileViewport } = useViewport();
  const [isCategoriesFetched, setIsCategoriesFetched] = useState(false);

  const {
    store,
    isOpen,
    hoursDisplay,
    error: storeError,
    isWSLoading,
    serverTime,
  } = useStoreStatus();

  const { selectedPostCodeData } = useCommonData();

  const { setShowPostCode } = useCart();
  const [orderType, setOrderType] = useState("delivery");

  const ITEMS_PER_PAGE = 20;
  const STORE_ID = import.meta.env.VITE_STORE_ID;
  const APP_BASE_ROUTE = import.meta.env.VITE_APP_NAME || "";

  // Cache management functions
  const getCacheKey = (categoryId, offset) =>
    `products_${APP_BASE_ROUTE}_${categoryId}_${offset}`;
  const getCacheTimeKey = (categoryId) =>
    `products_time_${APP_BASE_ROUTE}_${categoryId}`;
  const getMetaCacheKey = (categoryId) =>
    `products_meta_${APP_BASE_ROUTE}_${categoryId}`;

  const CACHE_MAX_AGE = 1000 * 60 * 5; // 5 minutes

  // Helper function to remove duplicates based on product ID
  const removeDuplicateProducts = (products) => {
    const seen = new Set();
    return products.filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  };

  // Function to load products for a specific category with pagination
  const loadProductsForCategory = async (
    categoryId,
    offset = 0,
    useCache = true
  ) => {
    const cacheKey = getCacheKey(categoryId, offset);
    const cacheTimeKey = getCacheTimeKey(categoryId);
    const metaCacheKey = getMetaCacheKey(categoryId);

    // Check cache first
    if (useCache) {
      const cachedData = localStorage.getItem(cacheKey);
      const cachedTime = localStorage.getItem(cacheTimeKey);
      const cachedMeta = localStorage.getItem(metaCacheKey);

      if (cachedData && cachedTime && cachedMeta) {
        const age = Date.now() - parseInt(cachedTime, 10);
        if (age < CACHE_MAX_AGE) {
          const products = JSON.parse(cachedData);
          const meta = JSON.parse(cachedMeta);

          return { products, meta };
        }
      }
    }

    try {
      const response = await fetch(
        `https://magskr.com/products/limitbycat/${ITEMS_PER_PAGE}?offset=${offset}&store_id=${STORE_ID}&category_id=${categoryId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const products = Array.isArray(data) ? data : [];

      // Create meta information
      const meta = {
        hasMore: products.length === ITEMS_PER_PAGE,
        currentOffset: offset,
        totalLoaded: offset + products.length,
      };

      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify(products));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
      localStorage.setItem(metaCacheKey, JSON.stringify(meta));

      return { products, meta };
    } catch (error) {
      console.error(
        `Error loading products for category ${categoryId}:`,
        error
      );
      return {
        products: [],
        meta: { hasMore: false, currentOffset: offset, totalLoaded: offset },
      };
    }
  };

  // Function to load more products for a category (FIXED VERSION)
  const loadMoreProducts = async (categoryId) => {
    // Prevent multiple simultaneous calls
    if (loadingMore[categoryId]) return;

    setLoadingMore((prev) => ({ ...prev, [categoryId]: true }));

    try {
      const currentMeta = categoryMeta[categoryId] || { currentOffset: 0 };
      const nextOffset = currentMeta.currentOffset + ITEMS_PER_PAGE;

      const { products: newProducts, meta: newMeta } =
        await loadProductsForCategory(categoryId, nextOffset, true);

      if (newProducts.length > 0) {
        setAllProducts((prev) => {
          const existingProducts = prev[categoryId] || [];
          const combinedProducts = [...existingProducts, ...newProducts];

          // Remove duplicates based on product ID
          const uniqueProducts = removeDuplicateProducts(combinedProducts);

          return {
            ...prev,
            [categoryId]: uniqueProducts,
          };
        });

        setCategoryMeta((prev) => ({
          ...prev,
          [categoryId]: {
            ...newMeta,
            totalLoaded:
              (prev[categoryId]?.totalLoaded || 0) + newProducts.length,
          },
        }));
      } else {
        // No more products, update meta to reflect this
        setCategoryMeta((prev) => ({
          ...prev,
          [categoryId]: {
            ...currentMeta,
            hasMore: false,
          },
        }));
      }
    } catch (error) {
      console.error(
        `Error loading more products for category ${categoryId}:`,
        error
      );
    } finally {
      setLoadingMore((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // Intersection Observer for lazy loading (IMPROVED VERSION)
  const setupIntersectionObserver = useCallback(
    (categoryId) => {
      const targetId = `load-more-trigger-${categoryId}`;
      const target = document.getElementById(targetId);

      if (!target) return;

      // Clean up existing observer for this category
      if (observerRefs.current[categoryId]) {
        observerRefs.current[categoryId].disconnect();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              categoryMeta[categoryId]?.hasMore &&
              !loadingMore[categoryId] // Additional check to prevent race conditions
            ) {
              loadMoreProducts(categoryId);
            }
          });
        },
        {
          rootMargin: "100px",
          threshold: 0.1,
        }
      );

      observer.observe(target);
      observerRefs.current[categoryId] = observer;
    },
    [categoryMeta, loadingMore] // Added loadingMore to dependencies
  );

  // Effect to setup observers when categories or products change
  useEffect(() => {
    const timer = setTimeout(() => {
      categories.forEach((category) => {
        if (allProducts[category.id] && categoryMeta[category.id]?.hasMore) {
          setupIntersectionObserver(category.id);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [categories, allProducts, categoryMeta, setupIntersectionObserver]);

  // Cleanup observers on unmount
  useEffect(() => {
    return () => {
      Object.values(observerRefs.current).forEach((observer) => {
        if (observer) observer.disconnect();
      });
    };
  }, []);

  // Scroll spy function
  const handleScrollSpy = useCallback(() => {
    if (isUserClick.current) return;

    const scrollY = window.pageYOffset;
    const stickyHeaderHeight =
      document.getElementById("store-title-area")?.offsetHeight || 0;

    const sections = categories
      .map((category) => {
        const element = document.getElementById(`cat-section-${category.id}`);
        if (element) {
          return {
            id: category.id,
            element: element,
            top: element.offsetTop - stickyHeaderHeight - 400,
            bottom:
              element.offsetTop +
              element.offsetHeight -
              stickyHeaderHeight -
              300,
          };
        }
        return null;
      })
      .filter(Boolean);

    let activeSection = null;

    for (let section of sections) {
      if (scrollY >= section.top && scrollY < section.bottom) {
        activeSection = section;
        break;
      }
    }

    if (!activeSection && sections.length > 0) {
      if (scrollY < sections[0].top) {
        activeSection = sections[0];
      } else {
        activeSection = sections[sections.length - 1];
      }
    }

    if (activeSection && activeSection.id !== selectedCategoryId) {
      setSelectedCategoryId(activeSection.id);

      const categoryElement = document.querySelector(
        `.hm-category-list li a[data-category-id="${activeSection.id}"]`
      ).parentElement;

      if (categoryElement) {
        const container = document.querySelector(".hm-category-list");
        const containerRect = container.getBoundingClientRect();
        const elementRect = categoryElement.getBoundingClientRect();

        const isNotVisible =
          elementRect.left < containerRect.left ||
          elementRect.right > containerRect.right ||
          elementRect.top < containerRect.top ||
          elementRect.bottom > containerRect.bottom;

        if (isNotVisible) {
          const scrollTop =
            container.scrollTop +
            (elementRect.top - containerRect.top) -
            containerRect.height / 2 +
            elementRect.height / 2;

          container.scrollTo({
            top: scrollTop,
            behavior: "smooth",
          });
        }
      }
    }
  }, [categories, selectedCategoryId]);

  const debouncedScrollSpy = useCallback(debounce(handleScrollSpy, 0), [
    handleScrollSpy,
  ]);

  useEffect(() => {
    if (categories.length > 0 && isInitialized) {
      window.addEventListener("scroll", debouncedScrollSpy);
      return () => {
        window.removeEventListener("scroll", debouncedScrollSpy);
        debouncedScrollSpy.cancel();
      };
    }
  }, [categories, isInitialized, debouncedScrollSpy]);

  useEffect(() => {
    return () => {
      debouncedScrollSpy.cancel();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [debouncedScrollSpy]);

  // Load categories
  useEffect(() => {
    if (isCategoriesFetched) return; // avoid refetch

    (async () => {
      try {
        const res = await getCategory(STORE_ID);
        const cats = res.data ?? res;
        setCategories(cats);

        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
          setIsInitialized(true);
        }
      } catch (err) {
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading((l) => ({ ...l, categories: false }));
        setIsCategoriesFetched(true); // mark fetched
      }
    })();
  }, [isCategoriesFetched]);

  // Load initial products for each category (IMPROVED VERSION)
  useEffect(() => {
    const loadInitialProducts = async () => {
      if (categories.length === 0) return;

      try {
        const productsData = {};
        const metaData = {};

        // Load first page of products for each category
        await Promise.all(
          categories.map(async (category) => {
            const { products, meta } = await loadProductsForCategory(
              category.id,
              0,
              true
            );
            // Remove duplicates even in initial load
            productsData[category.id] = removeDuplicateProducts(products);
            metaData[category.id] = meta;
          })
        );

        setAllProducts(productsData);
        setCategoryMeta(metaData);
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading((l) => ({ ...l, products: false }));
      }
    };

    loadInitialProducts();
  }, [categories]);

  // Load order type
  useEffect(() => {
    const storedType = localStorage.getItem("order_type");
    if (storedType === "pickup" || storedType === "delivery") {
      setOrderType(storedType);
    } else {
      localStorage.setItem("order_type", "delivery");
      setOrderType("delivery");
    }
  }, []);

  const handleOrderTypeChange = (type) => {
    setOrderType(type);
    localStorage.setItem("order_type", type);
    if (type === "delivery") {
      setShowPostCode((prev) => !prev);
    } else {
      setShowPostCode((prev) => !prev);
    }
  };

  const handleCategorySelect = (id) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    setSelectedCategoryId(id);
    isUserClick.current = true;

    const titleElement = document.querySelector(
      `#cat-section-${id} .products-categroy-title-row`
    );
    const sectionElement = document.getElementById(`cat-section-${id}`);
    const targetElement = titleElement || sectionElement;

    if (targetElement) {
      const stickyHeaderHeight =
        document.getElementById("store-title-area")?.offsetHeight || 0;
      const elementPosition =
        targetElement.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - stickyHeaderHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }

    setTimeout(() => {
      isUserClick.current = false;
    }, 1000);
  };

  // Clear cache function (utility for debugging)
  const clearProductCache = (categoryId = null) => {
    if (categoryId) {
      // Clear cache for specific category
      for (let i = 0; i < 10; i++) {
        // Clear up to 10 pages of cache
        const offset = i * ITEMS_PER_PAGE;
        localStorage.removeItem(getCacheKey(categoryId, offset));
      }
      localStorage.removeItem(getCacheTimeKey(categoryId));
      localStorage.removeItem(getMetaCacheKey(categoryId));
    } else {
      // Clear all product cache
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (
          key.startsWith(`products_${APP_BASE_ROUTE}_`) ||
          key.startsWith(`products_time_${APP_BASE_ROUTE}_`) ||
          key.startsWith(`products_meta_${APP_BASE_ROUTE}_`)
        ) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  if (storeError && !store) {
    return (
      <div
        className="error-container"
        style={{ padding: "20px", textAlign: "center" }}
      >
        <h3>Unable to load store information</h3>
        <p>{storeError}</p>
      </div>
    );
  }

  if (loading.categories || loading.products) {
    return (
      <>
        <StoreStatusSkeleton />;
        <section id="hm-product-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="hm-content-area">
                  <ProductCategory
                    categories={categories}
                    onSelect={() => {}}
                    selectedCategoryId={null}
                    isInitialized={false}
                    loading={true}
                  />

                  <div className="hm-product-section">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={`category-section-skeleton-${index}`}
                        className="mb-8"
                      >
                        <div className="products-categroy-title-row mb-6">
                          <div
                            className="relative overflow-hidden bg-gray-200 rounded mb-2"
                            style={{ height: "32px", width: "192px" }}
                          >
                            <div
                              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                              style={{
                                animation: "shimmer 2s infinite",
                                animationDelay: `${index * 0.2}s`,
                              }}
                            ></div>
                          </div>
                          <div
                            className="relative overflow-hidden bg-gray-200 rounded"
                            style={{ height: "16px", width: "384px" }}
                          >
                            <div
                              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
                              style={{
                                animation: "shimmer 2s infinite",
                                animationDelay: `${index * 0.2 + 0.2}s`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <ProductSection products={[]} loading={true} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error) return <div className="error">Error: {error}</div>;
  if (!store) return null;

  // Filter products based on search term (IMPROVED VERSION)
  const getFilteredProducts = (categoryId) => {
    const categoryProducts = allProducts[categoryId] || [];
    // Ensure no duplicates even in filtered results
    const uniqueProducts = removeDuplicateProducts(categoryProducts);
    return uniqueProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const sortedCategories = sortCategoriesByDisplayOrder(categories);
  const activeCategories = sortedCategories.filter((category) => {
    const filteredProducts = getFilteredProducts(category.id);
    return filteredProducts.length > 0;
  });

  const showStoreStatus = !isWSLoading && serverTime !== null;

  return (
    <>
      {/* Store Title Area (Sticky Top) - COMMENTED OUT */}
      {/* <section
        id="store-title-area"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 999,
          backgroundColor: "#fff",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div
              className="col-lg-6 col-sm-6 col-6"
              style={{ width: isMobileViewport ? "50%" : "70%" }}
            >
              <div className="store-title-col">
                <div className="restaurant-title">
                  <h1>{store.name}</h1>
                  <h3>
                    {!showStoreStatus ? (
                      <BiLoader
                        style={{
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    ) : isOpen ? (
                      <img
                        className="storeBtn"
                        src={`assets/user/img/open-btn.svg`}
                        alt="Open"
                      />
                    ) : (
                      <img
                        className="storeBtn"
                        src={`assets/user/img/close-btn.svg`}
                        alt="Close"
                      />
                    )}
                    {hoursDisplay}
                  </h3>
                  {orderType === "delivery" &&
                    selectedPostCodeData.minimum_order_amount > 0 && (
                      <div>
                        <img
                          src="assets/images/shop_bag.png"
                          alt=""
                          style={{
                            width: "15px",
                            height: "15px",
                            marginLeft: isMobileViewport ? "0" : "8px",
                            marginRight: "5px",
                            marginBottom: "5px",
                          }}
                        />
                        <span
                          style={{
                            fontSize: isMobileViewport ? "12px" : "16px",
                          }}
                        >
                          Min{" "}
                          {selectedPostCodeData.minimum_order_amount.toLocaleString(
                            currentCurrency.locale,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}{" "}
                          {currentCurrency.symbol}
                        </span>
                      </div>
                    )}
                </div>
                <h5>
                  {store.address}, {store.country}
                </h5>
              </div>
            </div>
            <div className="col-lg-2 col-sm-2 col-2 text-end">
              <div className="select-order-type">
                <div className="order-type-button d-inline-flex">
                  <button
                    type="button"
                    className={`select-type ${
                      orderType === "delivery" ? "active" : ""
                    }`}
                    onClick={() => handleOrderTypeChange("delivery")}
                  >
                    {currentLanguage.delivery}
                  </button>
                  <button
                    type="button"
                    className={`select-type ${
                      orderType === "pickup" ? "active" : ""
                    }`}
                    onClick={() => handleOrderTypeChange("pickup")}
                  >
                    {currentLanguage.pickup}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Product Area */}
      <section id="hm-product-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="hm-content-area">
                <ProductCategory
                  categories={sortedCategories}
                  onSelect={handleCategorySelect}
                  selectedCategoryId={selectedCategoryId}
                  isInitialized={isInitialized}
                  loading={loading.categories}
                />

                {activeCategories.length === 0 && (
                  <div className="no-products-found">
                    <p>{currentLanguage.no_products_found}</p>
                  </div>
                )}

                <div className="hm-product-section">
                  {activeCategories.map((category) => {
                    const filteredProducts = getFilteredProducts(category.id);
                    const hasMore = categoryMeta[category.id]?.hasMore;
                    const isLoadingMore = loadingMore[category.id];

                    return (
                      <div
                        key={category.id}
                        id={`cat-section-${category.id}`}
                        style={{ marginBottom: "2rem" }}
                      >
                        <div className="products-categroy-title-row">
                          <h2>{category.name}</h2>
                          <p>{category.description}</p>
                        </div>

                        <ProductSection
                          products={filteredProducts}
                          loading={false}
                          loadingMore={isLoadingMore}
                        />

                        {/* Load More Trigger */}
                        {hasMore && (
                          <div
                            id={`load-more-trigger-${category.id}`}
                            style={{
                              height: "20px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              margin: "20px 0",
                            }}
                          >
                            {isLoadingMore && (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  color: "#666",
                                }}
                              >
                                <BiLoader
                                  style={{
                                    animation: "spin 1s linear infinite",
                                    fontSize: "20px",
                                  }}
                                />
                                <span>Loading more products...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ProductsArea;
