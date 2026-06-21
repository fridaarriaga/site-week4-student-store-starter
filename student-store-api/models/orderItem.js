const prisma = require("../src/db/db")

class OrderItem {
  static async create(data) {
    return prisma.orderItem.create({
      data
    })
  }

  static async fetchByOrderId(orderId) {
    return prisma.orderItem.findMany({
      where: { orderId },
      orderBy: { id: "asc" }
    })
  }
}

module.exports = OrderItem
