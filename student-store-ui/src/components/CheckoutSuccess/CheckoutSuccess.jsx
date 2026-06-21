import "./CheckoutSuccess.css"
import { formatPrice } from "../../utils/format"

const CheckoutSuccess = ({ order, setOrder }) => {
  const handleOnClose = () => {
    setOrder(null)
  }

  const renderReceipt = () => (
    <>
      <p className="header">Order #{order.id}</p>
      <ul className="purchase">
        {order.items.map((item) => (
          <li key={item.id}>
            Product #{item.productId} x {item.quantity} - {formatPrice(item.lineTotal)}
          </li>
        ))}
        <li>Total: {formatPrice(order.total)}</li>
      </ul>
    </>
  )

  return (
    <div className="CheckoutSuccess">
      <h3>
        Checkout Info{" "}
        <span className={`icon button`}>
          <i className="material-icons md-48">fact_check</i>
        </span>
      </h3>
      {order ? (
        <div className="card">
          <header className="card-head">
            <h4 className="card-title">Receipt</h4>
          </header>
          <section className="card-body">{renderReceipt()}</section>
          <footer className="card-foot">
            <button className="button is-success" onClick={handleOnClose}>
              Shop More
            </button>
            <button className="button" onClick={handleOnClose}>
              Exit
            </button>
          </footer>
        </div>
      ) : (
        <div className="content">
          <p>
            A confirmation email will be sent to you so that you can confirm this order. Once you have confirmed the
            order, it will be delivered to your dorm room.
          </p>
        </div>
      )}
    </div>
  )
}

export default CheckoutSuccess
