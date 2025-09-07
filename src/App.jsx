import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import Navigation from './components/Navigation/Navigation';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import AboutUsSection from './components/AboutUsSection/AboutUsSection';
import ClientReviews from './components/ClientReviews';
import Features from './components/Features';
import Footer from './components/Footer/Footer';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import ProductDetail from './components/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState(localStorage.getItem('language') || 'fr');

  const handleLanguageChange = (newLang) => {
    setCurrentLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const MainPage = () => (
    <>
      <Navigation
        isLoggedIn={false}
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
      />
      <Hero currentLanguage={currentLanguage} />
      <ProductGrid 
        currentLanguage={currentLanguage}
      />
      <AboutUsSection />
      <ClientReviews currentLanguage={currentLanguage} />
      <Features currentLanguage={currentLanguage} />
      <Footer />
    </>
  );

  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route 
            path="/products/:id" 
            element={
              <ProductDetail 
                currentLanguage={currentLanguage}
              />
            } 
          />
          <Route 
            path="/cart" 
            element={
              <Cart 
                currentLanguage={currentLanguage}
              />
            } 
          />
          <Route path="/adminpanel" element={<AdminPanel />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
