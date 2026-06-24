const prisma = require("../src/db/db")

class OrderItem {
  static async create(data) {
    return prisma.orderItem.create({
      data
    })
  }

  static async fetchByOrderId(orderId) {
    return prisma.orderItem.findMany({
      where: { order_id: orderId },
      orderBy: { order_item_id: "asc" }
    })
  }
}

module.exports = OrderItem
