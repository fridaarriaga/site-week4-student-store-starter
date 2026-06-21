import "./SubNavbar.css"

function SubNavbar({ activeCategory, setActiveCategory, searchInputValue, handleOnSearchInputChange }) {

  const categories = [
    { label: "All Categories", value: "All Categories" },
    { label: "Clothing", value: "clothing" },
    { label: "School", value: "school" },
    { label: "Electronics", value: "electronics" },
    { label: "Accessories", value: "accessories" },
    { label: "Other", value: "other" }
  ]

  return (
    <nav className="SubNavbar">

      <div className="content">

        <div className="row">
          <div className="search-bar">
            <input
              type="text"
              name="search"
              placeholder="Search"
              value={searchInputValue}
              onChange={handleOnSearchInputChange}
            />
            <i className="material-icons">search</i>
          </div>
        </div>

        <div className="row">
          <ul className={`category-menu`}>
            {categories.map((cat) => (
              <li className={activeCategory === cat.value ? "is-active" : ""} key={cat.value}>
                <button onClick={() => setActiveCategory(cat.value)}>{cat.label}</button>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </nav>
  )
}

export default SubNavbar;