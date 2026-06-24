const express = require("express")
const {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
} = require("../controllers/orderController")

const router = express.Router()

router.get("/", listOrders)
router.get("/:order_id", getOrderById)
router.post("/", createOrder)
router.put("/:order_id", updateOrder)
router.delete("/:order_id", deleteOrder)

module.exports = router
