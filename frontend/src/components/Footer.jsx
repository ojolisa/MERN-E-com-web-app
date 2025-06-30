function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>ShopEasy</h4>
            <p>Your one-stop shop for everything</p>
          </div>
          <div className="footer-section">
            <h4>Customer Service</h4>
            <a href="#help">Help Center</a>
            <a href="#contact">Contact Us</a>
            <a href="#returns">Returns</a>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#careers">Careers</a>
            <a href="#privacy">Privacy Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 ShopEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
