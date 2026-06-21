const prisma = require("../src/db/db")

class Product {
  static async list(options = {}) {
    const { where, orderBy } = options
    return prisma.product.findMany({
      where,
      orderBy
    })
  }

  static async fetchById(id) {
    return prisma.product.findUnique({
      where: { id }
    })
  }

  static async create(data) {
    return prisma.product.create({
      data
    })
  }

  static async updateById(id, data) {
    return prisma.product.update({
      where: { id },
      data
    })
  }

  static async deleteById(id) {
    return prisma.product.delete({
      where: { id }
    })
  }
}

module.exports = Product
