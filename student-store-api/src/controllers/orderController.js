const prisma = require("../db/db")
const Order = require("../../models/order")

const formatOrderWithItems = (order) => {
  const { order_items, ...orderFields } = order
  return {
    ...orderFields,
    order_items
  }
}

const listOrders = async (req, res) => {
  try {
    const { status } = req.query
    const where = {}

    if (status !== undefined) {
      where.status = String(status).trim().toLowerCase()
    }

    const orders = await Order.list({
      where: Object.keys(where).length ? where : undefined
    })
    return res.status(200).json(orders)
  } catch (err) {
    return res.status(500).json({ error: "Unable to fetch orders" })
  }
}

const getOrderById = async (req, res) => {
  try {
    const id = Number(req.params.order_id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order id" })
    }

    const order = await Order.fetchByIdWithItems(id)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    return res.status(200).json(formatOrderWithItems(order))
  } catch (err) {
    return res.status(500).json({ error: "Unable to fetch order" })
  }
}

const createOrder = async (req, res) => {
  try {
    const {
      customer_id,
      status,
      items
    } = req.body

    if (!customer_id) {
      return res.status(400).json({ error: "customer_id is required" })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items must be a non-empty array" })
    }

    const normalizedItems = []
    for (const item of items) {
      const productId = Number(item.product_id ?? item.productId)
      const quantity = Number(item.quantity)
      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: "Each item must include valid product_id and quantity" })
      }
      normalizedItems.push({ product_id: productId, quantity })
    }

    const order = await prisma.$transaction(async (tx) => {
      const uniqueProductIds = [...new Set(normalizedItems.map((item) => item.product_id))]
      const products = await tx.product.findMany({
        where: {
          id: {
            in: uniqueProductIds
          }
        }
      })

      if (products.length !== uniqueProductIds.length) {
        const missingProductError = new Error("One or more products do not exist")
        missingProductError.code = "PRODUCT_NOT_FOUND"
        throw missingProductError
      }

      const productMap = new Map(products.map((product) => [product.id, product]))
      const itemRows = normalizedItems.map((item) => {
        const product = productMap.get(item.product_id)
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        }
      })

      const createdOrder = await tx.order.create({
        data: {
          customer_id: String(customer_id),
          status: status ? String(status).trim().toLowerCase() : undefined,
          total_price: 0
        }
      })

      await tx.orderItem.createMany({
        data: itemRows.map((row) => ({
          ...row,
          order_id: createdOrder.order_id
        }))
      })

      const total = itemRows.reduce((sum, row) => sum + (row.price * row.quantity), 0)
      await tx.order.update({
        where: { order_id: createdOrder.order_id },
        data: { total_price: total }
      })

      return tx.order.findUnique({
        where: { order_id: createdOrder.order_id },
        include: { order_items: true }
      })
    })

    return res.status(201).json(formatOrderWithItems(order))
  } catch (err) {
    if (err.code === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ error: "One or more products do not exist" })
    }
    return res.status(500).json({ error: "Unable to create order" })
  }
}

const updateOrder = async (req, res) => {
  try {
    const id = Number(req.params.order_id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order id" })
    }

    const {
      customer_id,
      total_price,
      status
    } = req.body
    const data = {}

    if (customer_id !== undefined) data.customer_id = String(customer_id)
    if (total_price !== undefined) {
      const parsedTotalPrice = Number(total_price)
      if (!Number.isFinite(parsedTotalPrice) || parsedTotalPrice < 0) {
        return res.status(400).json({ error: "total_price must be a non-negative number" })
      }
      data.total_price = parsedTotalPrice
    }
    if (status !== undefined) data.status = String(status).trim().toLowerCase()

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "At least one field is required to update" })
    }

    const existing = await Order.fetchById(id)
    if (!existing) {
      return res.status(404).json({ error: "Order not found" })
    }

    const order = await Order.updateById(id, data)
    return res.status(200).json(order)
  } catch (err) {
    return res.status(500).json({ error: "Unable to update order" })
  }
}

const deleteOrder = async (req, res) => {
  try {
    const id = Number(req.params.order_id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order id" })
    }

    const existing = await Order.fetchById(id)
    if (!existing) {
      return res.status(404).json({ error: "Order not found" })
    }

    await Order.deleteById(id)
    return res.status(200).json({ message: "Order deleted" })
  } catch (err) {
    return res.status(500).json({ error: "Unable to delete order" })
  }
}

module.exports = {
  listOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
}
