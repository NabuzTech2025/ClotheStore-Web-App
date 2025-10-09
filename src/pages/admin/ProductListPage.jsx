import { useState, useEffect } from "react";
import ProductTable from "../../components/Admin/ProductTable";
import {
  addProduct,
  getCategory,
  getTax,
  uploadImage,
} from "@/api/AdminServices";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CgAdd } from "react-icons/cg";
import Swal from "sweetalert2";
import { currentCurrency } from "../../utils/helper/currency_type";

const ProductListPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedCategoryId, setCategoryId] = useState("");
  const [selectedTaxId, setSelectedTaxId] = useState("");
  const [selectedType, setSelectedType] = useState("simple");
  const [isActive, setIsActive] = useState(true);
  const [reloadTable, setReloadTable] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [taxList, setTaxList] = useState([]);
  const [variants, setVariants] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const openModal = async () => {
    try {
      const [resTax, resCategory] = await Promise.all([
        getTax(localStorage.getItem("store_id")),
        getCategory(localStorage.getItem("store_id")),
      ]);
      setTaxList(resTax.data);
      setCategoryData(resCategory.data || []);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setName("");
    setProductCode("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setSelectedTaxId("");
    setSelectedType("simple");
    setIsActive(true);
    setVariants([]);
    setSelectedImage(null);
    setImagePreview("");
    setUploadingImage(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadingImage(true);

    let imageUrl = "";

    if (selectedImage) {
      try {
        const formData = new FormData();
        formData.append("file", selectedImage);
        const imageResponse = await uploadImage(formData);
        if (imageResponse.data?.image_url) {
          imageUrl = imageResponse.data.image_url;
          console.log("Image uploaded successfully. URL:", imageUrl);
        } else {
          throw new Error("Invalid response format - missing image_url");
        }
      } catch (error) {
        console.error("Failed to upload image:", error);
        Swal.fire("Error", `Failed to upload image: ${error.message}`, "error");
        setUploadingImage(false);
        return;
      }
    }

    const storeId = localStorage.getItem("store_id");
    if (!storeId) {
      Swal.fire("Error", "Store ID not found. Please login again.", "error");
      setUploadingImage(false);
      return;
    }

    const payload = {
      name: name,
      item_code: productCode,
      category_id: Number(selectedCategoryId),
      image_url: imageUrl,
      type: selectedType,
      price: selectedType === "simple" ? parseFloat(price) : 0,
      store_id: parseInt(storeId), // Use dynamic store_id
      tax_id: Number(selectedTaxId),
      isActive: true,
      description: description,
      variants:
        selectedType === "variable"
          ? variants.map((variant) => ({
              name: variant.name,
              price: parseFloat(variant.price),
              description: variant.description,
            }))
          : [],
    };

    try {
      await addProduct(payload);
      setSuccessMsg("Product added successfully! ✅");
      setReloadTable((prev) => !prev);
      closeModal();
    } catch (error) {
      console.error("Failed to add product:", error);
      Swal.fire("Error", "Failed to add product", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", price: "", description: "" }]);
  };

  const removeVariant = (index) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleDecimalChange =
    (setter, maxDecimals = 2) =>
    (e) => {
      const val = e.target.value;
      const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
      if (val === "" || regex.test(val)) {
        setter(val);
      }
    };

  return (
    <div>
      {successMsg && (
        <div className="alert alert-success alert-dismissible fade show">
          {successMsg}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMsg("")}
          ></button>
        </div>
      )}

      <div className="page-header">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-10">
              <div className="page-header-title">
                <h2 className="mb-0">Product Management</h2>
              </div>
            </div>
            <div className="col-2 text-end">
              <button className="btn btn-primary" onClick={openModal}>
                <i className="fas fa-plus me-2"></i>Add New
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <ProductTable
            reload={reloadTable}
            onSuccess={(msg) => setSuccessMsg(msg)}
          />
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header d-flex justify-content-between align-items-center">
                  <h5 className="modal-title mb-0">Add New Product</h5>
                  <div className="d-flex align-items-center">
                    {imagePreview ? (
                      <div className="position-relative me-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "2px solid #f0f0f0",
                          }}
                        />
                        <label
                          htmlFor="image-upload"
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                        >
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="btn btn-sm btn-outline-secondary mb-0"
                      >
                        <CgAdd />
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Product Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Product Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={productCode}
                          onChange={(e) => setProductCode(e.target.value)}
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Category <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={selectedCategoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {categoryData.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">
                          Description <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">
                          Tax <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={selectedTaxId}
                          onChange={(e) => setSelectedTaxId(e.target.value)}
                        >
                          <option value="">Select Tax</option>
                          {taxList.map((tax) => (
                            <option key={tax.id} value={tax.id}>
                              {tax.name} ({tax.percentage}%)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* <div className="mb-3">
                        <label className="form-label">Status <span className="text-danger">*</span></label>
                        <select 
                          className="form-select" 
                          value={isActive} 
                          onChange={(e) => setIsActive(e.target.value === "true")} 
                          required
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div> */}

                      <div className="mb-3">
                        <label className="form-label">
                          Product Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          required
                        >
                          <option value="simple">Simple</option>
                          <option value="variable">Variable</option>
                        </select>
                      </div>

                      {selectedType === "simple" && (
                        <div className="mb-3">
                          <label className="form-label">
                            Price <span className="text-danger">*</span>
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">
                              {currentCurrency.symbol}
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              className="form-control"
                              value={price}
                              // onChange={(e) => setPrice(e.target.value)}
                              onChange={handleDecimalChange(setPrice)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {selectedType === "variable" && (
                        <div className="mb-3">
                          <label className="form-label">Variants</label>
                          {variants.map((variant, index) => (
                            <div key={index} className="card p-3 mb-3 border">
                              <input
                                type="text"
                                className="form-control mb-2"
                                placeholder="Variant Name"
                                value={variant.name}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                                required
                              />
                              <div className="input-group mb-2">
                                <span className="input-group-text">
                                  {currentCurrency.symbol}
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control"
                                  placeholder="Price"
                                  value={variant.price}
                                  // onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const regex = /^\d*\.?\d{0,2}$/;
                                    if (val === "" || regex.test(val)) {
                                      handleVariantChange(index, "price", val);
                                    }
                                  }}
                                  required
                                />
                              </div>
                              <textarea
                                className="form-control mb-2"
                                placeholder="Description"
                                value={variant.description}
                                onChange={(e) =>
                                  handleVariantChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeVariant(index)}
                              >
                                Remove Variant
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={addVariant}
                          >
                            <i className="fas fa-plus me-1"></i> Add Variant
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
