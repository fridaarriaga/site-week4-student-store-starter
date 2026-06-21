const express = require("express")
const Product = require("../models/product")
const Order = require("../models/order")

const app = express()
const PORT = process.env.PORT || 3001
const VALID_PRODUCT_CATEGORIES = new Set([
  "clothing",
  "school",
  "electronics",
  "accessories",
  "other"
])
const VALID_PRODUCT_SORT_FIELDS = new Set(["price", "name"])

app.use(express.json())

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" })
})

app.get("/products", async (req, res) => {
  try {
    const { category, sort } = req.query
    const where = {}
    let orderBy

    if (category !== undefined) {
      const normalizedCategory = String(category).trim().toLowerCase()
      if (!VALID_PRODUCT_CATEGORIES.has(normalizedCategory)) {
        return res.status(400).json({ error: "Invalid category value" })
      }
      where.category = normalizedCategory
    }

    if (sort !== undefined) {
      const normalizedSort = String(sort).trim().toLowerCase()
      if (!VALID_PRODUCT_SORT_FIELDS.has(normalizedSort)) {
        return res.status(400).json({ error: "sort must be one of: price, name" })
      }
      orderBy = { [normalizedSort]: "asc" }
    }

    const products = await Product.list({
      where: Object.keys(where).length ? where : undefined,
      orderBy
    })
    return res.status(200).json(products)
  } catch (err) {
    return res.status(500).json({ error: "Unable to fetch products" })
  }
})

app.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid product id" })
    }

    const product = await Product.fetchById(id)
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json(product)
  } catch (err) {
    return res.status(500).json({ error: "Unable to fetch product" })
  }
})

app.post("/products", async (req, res) => {
  try {
    const { name, description, category, price, imageUrl } = req.body
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: "name and price are required" })
    }

    let normalizedCategory
    if (category !== undefined) {
      normalizedCategory = String(category).trim().toLowerCase()
      if (!VALID_PRODUCT_CATEGORIES.has(normalizedCategory)) {
        return res.status(400).json({ error: "Invalid category value" })
      }
    }

    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: "price must be a non-negative number" })
    }

    const product = await Product.create({
      name,
      description,
      category: normalizedCategory,
      price: parsedPrice,
      imageUrl
    })

    return res.status(201).json(product)
  } catch (err) {
    return res.status(500).json({ error: "Unable to create product" })
  }
})

app.put("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid product id" })
    }

    const { name, description, category, price, imageUrl } = req.body
    const data = {}

    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (category !== undefined) {
      const normalizedCategory = String(category).trim().toLowerCase()
      if (!VALID_PRODUCT_CATEGORIES.has(normalizedCategory)) {
        return res.status(400).json({ error: "Invalid category value" })
      }
      data.category = normalizedCategory
    }
    if (price !== undefined) {
      const parsedPrice = Number(price)
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: "price must be a non-negative number" })
      }
      data.price = parsedPrice
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "At least one field is required to update" })
    }

    const existing = await Product.fetchById(id)
    if (!existing) {
      return res.status(404).json({ error: "Product not found" })
    }

    const product = await Product.updateById(id, data)
    return res.status(200).json(product)
  } catch (err) {
    return res.status(500).json({ error: "Unable to update product" })
  }
})

app.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid product id" })
    }

    const existing = await Product.fetchById(id)
    if (!existing) {
      return res.status(404).json({ error: "Product not found" })
    }

    await Product.deleteById(id)
    return res.status(200).json({ message: "Product deleted" })
  } catch (err) {
    return res.status(500).json({ error: "Unable to delete product" })
  }
})

app.get("/orders", async (req, res) => {
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
})

app.get("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order id" })
    }

    const order = await Order.fetchById(id)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    return res.status(200).json(order)
  } catch (err) {
    return res.status(500).json({ error: "Unable to fetch order" })
  }
})

app.post("/orders", async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerAddress,
      status,
      total
    } = req.body

    if (!customerName || !customerEmail || !customerAddress) {
      return res.status(400).json({ error: "customerName, customerEmail, and customerAddress are required" })
    }

    let parsedTotal = 0
    if (total !== undefined) {
      parsedTotal = Number(total)
      if (!Number.isFinite(parsedTotal) || parsedTotal < 0) {
        return res.status(400).json({ error: "total must be a non-negative number" })
      }
    }

    const order = await Order.create({
      customerName,
      customerEmail,
      customerAddress,
      status: status ? String(status).trim().toLowerCase() : undefined,
      total: parsedTotal
    })

    return res.status(201).json(order)
  } catch (err) {
    return res.status(500).json({ error: "Unable to create order" })
  }
})

app.put("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid order id" })
    }

    const {
      customerName,
      customerEmail,
      customerAddress,
      status
    } = req.body
    const data = {}

    if (customerName !== undefined) data.customerName = customerName
    if (customerEmail !== undefined) data.customerEmail = customerEmail
    if (customerAddress !== undefined) data.customerAddress = customerAddress
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
})

app.delete("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
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
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

