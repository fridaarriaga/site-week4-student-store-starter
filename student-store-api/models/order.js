const prisma = require("../src/db/db")

class Order {
  static async list(options = {}) {
    const { where, orderBy } = options
    return prisma.order.findMany({
      where,
      orderBy
    })
  }

  static async fetchById(id) {
    return prisma.order.findUnique({
      where: { order_id: id }
    })
  }

  static async fetchByIdWithItems(id) {
    return prisma.order.findUnique({
      where: { order_id: id },
      include: {
        order_items: true
      }
    })
  }

  static async create(data) {
    return prisma.order.create({
      data
    })
  }

  static async updateById(id, data) {
    return prisma.order.update({
      where: { order_id: id },
      data
    })
  }

  static async deleteById(id) {
    return prisma.order.delete({
      where: { order_id: id }
    })
  }
}

module.exports = Order
