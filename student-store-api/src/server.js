const express = require("express")
const cors = require("cors")
const productRoutes = require("./routes/productRoutes")
const orderRoutes = require("./routes/orderRoutes")

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(cors())

app.use("/products", productRoutes)
app.use("/orders", orderRoutes)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

