import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProductCard from "./ProductCard";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.products.getAll({
        limit: 6,
        sortBy: "rating",
        sortOrder: "desc",
      });
      setFeaturedProducts(response.products || []);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h2 className="hero-title">Discover Amazing Products</h2>
            <p className="hero-subtitle">
              Shop the latest trends and find everything you need in one place
            </p>
            <Link to="/products" className="btn btn-primary btn-large">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products" id="products">
        <div className="container">
          <div className="section-header">
            <h3 className="section-title">Featured Products</h3>
            <Link to="/products" className="view-all-btn">
              View All Products →
            </Link>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="products-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))
              ) : (
                <div className="no-products">
                  <h4>No products available</h4>
                  <p>Check back later for amazing deals!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h3 className="section-title">Why Choose Us</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h4>Free Shipping</h4>
              <p>Free delivery on orders over $50</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h4>Secure Payment</h4>
              <p>Your payment information is safe</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">↩️</div>
              <h4>Easy Returns</h4>
              <p>30-day return policy</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h4>Quality Products</h4>
              <p>Carefully curated selection</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
