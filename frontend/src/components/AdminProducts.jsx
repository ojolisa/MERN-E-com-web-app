import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminProducts.css";

function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    images: [""],
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.getAll({ limit: 100 });
      setProducts(response.products || response);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.products.getAdminCategories();
      setCategories(response.categories || response || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        images: newProduct.images.filter((img) => img.trim() !== ""),
      };

      const response = await api.post("/products", productData);
      setProducts([response.data, ...products]);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        brand: "",
        stock: "",
        images: [""],
      });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    try {
      const response = await api.put(`/products/${productId}`, updates);
      setProducts(
        products.map((product) =>
          product._id === productId ? response.data : product
        )
      );
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter((product) => product._id !== productId));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive) ||
      (statusFilter === "lowstock" && product.stock < 10);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-products">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-products">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          ← Back to Dashboard
        </button>
        <h1>Product Management</h1>
        <button
          className="add-product-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showAddForm && (
        <div className="add-product-form">
          <h3>Add New Product</h3>
          <form onSubmit={handleAddProduct}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Brand"
                value={newProduct.brand}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, brand: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Price"
                step="0.01"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
                required
              />
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="url"
                placeholder="Image URL"
                value={newProduct.images[0]}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, images: [e.target.value] })
                }
              />
            </div>
            <textarea
              placeholder="Product Description"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
              rows="3"
              required
            />
            <div className="form-actions">
              <button type="submit" className="submit-btn">
                Add Product
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="products-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-boxes">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lowstock">Low Stock</option>
          </select>
        </div>
      </div>

      <div className="products-stats">
        <div className="stat">
          <span className="stat-label">Total Products:</span>
          <span className="stat-value">{filteredProducts.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Active:</span>
          <span className="stat-value">
            {filteredProducts.filter((p) => p.isActive).length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Low Stock:</span>
          <span className="stat-value">
            {filteredProducts.filter((p) => p.stock < 10).length}
          </span>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="image-placeholder">📦</div>
              )}
              <div className="product-status">
                <span
                  className={`status-badge ${
                    product.isActive ? "active" : "inactive"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
                {product.stock < 10 && (
                  <span className="status-badge low-stock">Low Stock</span>
                )}
              </div>
            </div>

            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <p className="product-brand">{product.brand}</p>
              <p className="product-category">{product.category}</p>
              <div className="product-price">${product.price}</div>
              <div className="product-stock">Stock: {product.stock}</div>
              <div className="product-rating">
                ⭐ {product.rating?.average?.toFixed(1) || "N/A"}(
                {product.rating?.count || 0})
              </div>
            </div>

            <div className="product-actions">
              <button
                className="action-btn edit-btn"
                onClick={() => setEditingProduct(product._id)}
                title="Edit Product"
              >
                ✏️
              </button>
              <button
                className="action-btn delete-btn"
                onClick={() => handleDeleteProduct(product._id, product.name)}
                title="Delete Product"
              >
                🗑️
              </button>
              <button
                className="action-btn toggle-btn"
                onClick={() =>
                  handleUpdateProduct(product._id, {
                    isActive: !product.isActive,
                  })
                }
                title={product.isActive ? "Deactivate" : "Activate"}
              >
                {product.isActive ? "🔒" : "🔓"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
