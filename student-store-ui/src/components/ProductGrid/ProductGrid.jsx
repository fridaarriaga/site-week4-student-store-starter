import ProductCard from "../ProductCard/ProductCard"
import "./ProductGrid.css"

function ProductGrid({ addToCart, removeFromCart, getQuantityOfItemInCart, products = [] }) {

  return (
    <div id="Buy" className="ProductGrid">
      <div className="content">
        <div className="grid">

          {!products?.length ? (
            <div className="card">
              <p>No products available</p>
            </div>
          ) : products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              quantity={getQuantityOfItemInCart(product)}
              addToCart={() => addToCart(product)}
              removeFromCart={() => removeFromCart(product)}
            />
          ))}
          
        </div>
      </div>
    </div>
  )

}

export default ProductGrid;