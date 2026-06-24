import "./SubNavbar.css"
import { useNavigate } from "react-router-dom"

function SubNavbar({
  activeCategory,
  setActiveCategory,
  searchDraftValue,
  handleOnSearchInputChange,
  handleOnSearchSubmit
}) {
  const navigate = useNavigate()

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    handleOnSearchSubmit()
    navigate("/")
  }

  const categories = [
    { label: "All Categories", value: "All Categories" },
    { label: "Clothing", value: "clothing" },
    { label: "Apparel", value: "apparel" },
    { label: "Books", value: "books" },
    { label: "Snacks", value: "snacks" },
    { label: "Supplies", value: "supplies" },
    { label: "Accessories", value: "accessories" },
    { label: "Other", value: "other" }
  ]

  return (
    <nav className="SubNavbar">

      <div className="content">

        <div className="row">
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              name="search"
              placeholder="Search"
              value={searchDraftValue}
              onChange={handleOnSearchInputChange}
            />
            <button
              type="submit"
              className="search-button"
              aria-label="Search products"
            >
              <i className="material-icons">search</i>
            </button>
          </form>
        </div>

        <div className="row">
          <ul className={`category-menu`}>
            {categories.map((cat) => (
              <li className={activeCategory === cat.value ? "is-active" : ""} key={cat.value}>
                <button
                  onClick={() => {
                    setActiveCategory(cat.value)
                    navigate("/")
                  }}
                >
                  {cat.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </nav>
  )
}

export default SubNavbar;