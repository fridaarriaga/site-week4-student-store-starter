import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import SubNavbar from "../SubNavbar/SubNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import ProductDetail from "../ProductDetail/ProductDetail";
import NotFound from "../NotFound/NotFound";
import KawaiiBanner from "../KawaiiBanner/KawaiiBanner";
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

function App() {

  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [searchDraftValue, setSearchDraftValue] = useState("");
  const [userInfo, setUserInfo] = useState({ customer_id: "" });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  // Toggles sidebar
  const toggleSidebar = () => setSidebarOpen((isOpen) => !isOpen);

  // Functions to change state (used for lifting state)
  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item));
  const handleOnAddToCart = (item) => setCart(addToCart(cart, item));
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item);
  const handleGetTotalCartItems = () => getTotalItemsInCart(cart);

  const handleOnSearchInputChange = (event) => {
    const nextValue = event.target.value
    setSearchDraftValue(nextValue)
    setSearchInputValue(nextValue)
  };

  const handleOnSearchSubmit = () => {
    setSearchInputValue(searchDraftValue)
  }

  const handleOnCheckout = async () => {
    const cartEntries = Object.entries(cart)
    if (!cartEntries.length) {
      setError("Your cart is empty.")
      return
    }

    if (!userInfo.customer_id) {
      setError("Please enter customer ID before checkout.")
      return
    }

    const items = cartEntries.map(([productId, quantity]) => ({
      product_id: Number(productId),
      quantity
    }))

    try {
      setIsCheckingOut(true)
      setError(null)
      const response = await axios.post(`${API_BASE_URL}/orders`, {
        customer_id: String(userInfo.customer_id),
        status: "pending",
        items
      })
      setOrder(response.data)
      setCart({})
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to complete checkout.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsFetching(true)
        setError(null)
        const response = await axios.get(`${API_BASE_URL}/products`)
        setProducts(response.data)
      } catch (err) {
        setError(err?.response?.data?.error || "Unable to fetch products.")
      } finally {
        setIsFetching(false)
      }
    }
    fetchProducts()
  }, [])


  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar
          cart={cart}
          error={error}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          isOpen={sidebarOpen}
          products={products}
          toggleSidebar={toggleSidebar}
          isCheckingOut={isCheckingOut}
          addToCart={handleOnAddToCart}
          removeFromCart={handleOnRemoveFromCart}
          getQuantityOfItemInCart={handleGetItemQuantity}
          getTotalItemsInCart={handleGetTotalCartItems}
          handleOnCheckout={handleOnCheckout}
          order={order}
          setOrder={setOrder}
        />
        <main>
          <KawaiiBanner />
          <SubNavbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchDraftValue={searchDraftValue}
            handleOnSearchInputChange={handleOnSearchInputChange}
            handleOnSearchSubmit={handleOnSearchSubmit}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleOnAddToCart}
                  searchInputValue={searchInputValue}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="/:productId"
              element={
                <ProductDetail
                  cart={cart}
                  error={error}
                  products={products}
                  addToCart={handleOnAddToCart}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="*"
              element={
                <NotFound
                  error={error}
                  products={products}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
 