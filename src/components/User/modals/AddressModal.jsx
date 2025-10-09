import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { getStorePostcodes } from "../../../api/UserServices";
import { currentLanguage } from "../../../utils/helper/lang_translate";
import { useCommonData } from "../../../contexts/CommonContext";
import { currentCurrency } from "../../../utils/helper/currency_type";
import { useStoreStatus } from "../../../contexts/StoreStatusContext";

const AddressModal = ({ show, handleClose, onPostcodeSelect }) => {
  const [postcodes, setPostcodes] = useState([]);
  const [selectedPostcode, setSelectedPostcode] = useState("");
  const { setPostCodeDataINContext } = useCommonData();
  const { allPostCodes, setAllPostCodes } = useStoreStatus();

  useEffect(() => {
    if (!show || postcodes.length > 0) return; // Don't fetch again if already loaded
    getStorePostcodes(import.meta.env.VITE_STORE_ID).then((data) => {
      setPostcodes(data);
      const savedPostcode = localStorage.getItem("delivery_postcode");
      if (savedPostcode && data.find((p) => p.postcode === savedPostcode)) {
        setSelectedPostcode(savedPostcode);
      }
    });
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedData = postcodes.find((p) => p.postcode === selectedPostcode);
    setPostCodeDataINContext(selectedData);
    if (selectedData) {
      localStorage.setItem("delivery_postcode", selectedData.postcode);
      localStorage.setItem("delivery_fee", selectedData.delivery_fee || 0);
      onPostcodeSelect(selectedData);
      handleClose();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      className="centre-modal-popup"
      backdrop="static"
      keyboard={false}
      centered
    >
      <div className="modal-content">
        <Modal.Header>
          <button type="button" className="btn-close" onClick={handleClose}>
            <img src={`assets/user/img/close-icon.svg`} alt="Close" />
          </button>
          <h5>
            {currentLanguage.select_your} {currentLanguage.address}
          </h5>
        </Modal.Header>

        <Modal.Body>
          <form className="delivery-address-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <img src={`assets/user/img/location-icon.svg`} alt="Location" />
              <select
                className="form-select form-select-lg"
                value={selectedPostcode}
                onChange={(e) => setSelectedPostcode(e.target.value)}
                required
              >
                <option value="">
                  {currentLanguage.select_your} {currentLanguage.postCode}
                </option>
                {postcodes.map((p) => (
                  <option key={p.id} value={p.postcode}>
                    {p.postcode} ({currentLanguage.delivery_fee}:{" "}
                    {currentCurrency.symbol}
                    {p.delivery_fee.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-address-submit">
              <img src={`assets/user/img/right-arrow-icon.svg`} alt="Submit" />
            </button>
          </form>
        </Modal.Body>
      </div>
    </Modal>
  );
};

export default AddressModal;
