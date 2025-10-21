// import React, { useEffect, useState } from "react";
// import { getStoreDisscount } from "../../api/UserServices";
// import "../../../ui/css/hero_section.css";

// const Hero = () => {
//   const [discounts, setDiscounts] = useState({
//     delivery: { value: 0, code: "" },
//     pickup: { value: 0, code: "" },
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDiscounts = async () => {
//       try {
//         const response = await getStoreDisscount();
//         console.log("Discount Data: =-->", response);

//         if (response.data && Array.isArray(response.data)) {
//           const discountData = {
//             delivery: { value: 0, code: "" },
//             pickup: { value: 0, code: "" },
//           };

//           response.data.forEach((discount) => {
//             if (discount.code === "DELIVERY_DISCOUNT") {
//               discountData.delivery = {
//                 value: discount.value,
//                 code: discount.code,
//               };
//             } else if (discount.code === "PICKUP_DISCOUNT") {
//               discountData.pickup = {
//                 value: discount.value,
//                 code: discount.code,
//               };
//             }
//           });

//           setDiscounts(discountData);
//         }
//       } catch (error) {
//         console.error("Error fetching discounts:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDiscounts();
//   }, []);

//   return (
//     <section id="hero-section">
//       <div className="container-fluid">
//         <div className="row">
//           <div className="col-lg-12 hero-col" style={{ position: "relative" }}>
//             <img
//               className="img-fluid"
//               src={`assets/user/img/brand-banner.jpg`}
//               alt="Restaurant Banner"
//             />

//             {/* Discount Banner Overlay */}
//             {!loading && (
//               <div className="discount-banner">
//                 {discounts.delivery.value > 0 && (
//                   <div className="discount-badge delivery color1">
//                     <span className="discount-text">
//                       {discounts.delivery.value}% off Lieferung
//                     </span>
//                   </div>
//                 )}
//                 {discounts.pickup.value > 0 && (
//                   <div className="discount-badge pickup color2">
//                     <span className="discount-text">
//                       {discounts.pickup.value}% off Abholung
//                     </span>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Loading state */}
//             {loading && (
//               <div className="discount-banner">
//                 <div className="discount-badge delivery color1 loading">
//                   <span className="discount-text">Loading...</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;

// components/Hero.js
import React, { useEffect, useState } from "react";
import { getStoreDisscount } from "../../api/UserServices";
import {
  getTranslations,
  getCurrentLanguage,
} from "../../utils/helper/lang_translate";
import "../../../ui/css/hero_section.css";

const Hero = () => {
  const [discounts, setDiscounts] = useState({
    delivery: { value: 0, code: "" },
    pickup: { value: 0, code: "" },
  });
  const [loading, setLoading] = useState(true);

  // Get current language and translations
  const [language, setLanguage] = useState(getCurrentLanguage());
  const currentLanguage = getTranslations(language);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = getCurrentLanguage();
      setLanguage(newLang);
    };

    // Listen for language change event
    window.addEventListener("languageChange", handleLanguageChange);

    // Also listen for storage changes (in case language is changed in another tab)
    window.addEventListener("storage", (e) => {
      if (e.key === "app_language") {
        handleLanguageChange();
      }
    });

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await getStoreDisscount();

        if (response.data && Array.isArray(response.data)) {
          const discountData = {
            delivery: { value: 0, code: "" },
            pickup: { value: 0, code: "" },
          };

          response.data.forEach((discount) => {
            if (discount.code === "DELIVERY_DISCOUNT") {
              discountData.delivery = {
                value: discount.value,
                code: discount.code,
              };
            } else if (discount.code === "PICKUP_DISCOUNT") {
              discountData.pickup = {
                value: discount.value,
                code: discount.code,
              };
            }
          });

          setDiscounts(discountData);
        }
      } catch (error) {
        console.error("Error fetching discounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  return (
    <section id="hero-section">
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12 hero-col" style={{ position: "relative" }}>
            <img
              className="img-fluid"
              src={`https://magskrimages.s3.amazonaws.com/391d1a58339c4888a3eeb91ea9245082.jpg`}
              alt="Restaurant Banner"
            />

            {/* Discount Banner Overlay */}
            {/* {!loading && (
              <div className="discount-banner">
                {discounts.delivery.value > 0 && (
                  <div className="discount-badge delivery color1">
                    <span className="discount-text">
                      {discounts.delivery.value}%{" "}
                      off Delivery
                    </span>
                  </div>
                )}
                {discounts.pickup.value > 0 && (
                  <div className="discount-badge pickup color2">
                    <span className="discount-text">
                      {discounts.pickup.value}%{" "}
                      off Pickup
                    </span>
                  </div>
                )}
              </div>
            )} */}

            {/* Loading state */}
            {/* {loading && (
              <div className="discount-banner">
                <div className="discount-badge delivery color1 loading">
                  <span className="discount-text">
                    Loading...
                  </span>
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
