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
      where: { id }
    })
  }

  static async fetchByIdWithItems(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true
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
      where: { id },
      data
    })
  }

  static async deleteById(id) {
    return prisma.order.delete({
      where: { id }
    })
  }
}

module.exports = Order
