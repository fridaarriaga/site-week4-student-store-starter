const Product = require("../../models/product")

const VALID_PRODUCT_CATEGORIES = new Set([
  "clothing",
  "school",
  "electronics",
  "accessories",
  "other",
  "apparel",
  "books",
  "snacks",
  "supplies"
])
const VALID_PRODUCT_SORT_FIELDS = new Set(["price", "name"])

const listProducts = async (req, res) => {
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
}

const getProductById = async (req, res) => {
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
}

const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, image_url, imageUrl } = req.body
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
      image_url: image_url ?? imageUrl
    })

    return res.status(201).json(product)
  } catch (err) {
    return res.status(500).json({ error: "Unable to create product" })
  }
}

const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid product id" })
    }

    const { name, description, category, price, image_url, imageUrl } = req.body
    const data = {}

    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (image_url !== undefined) data.image_url = image_url
    if (imageUrl !== undefined) data.image_url = imageUrl
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
}

const deleteProduct = async (req, res) => {
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
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}
