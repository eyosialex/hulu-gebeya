const prisma = require('../../prisma/client');

const getShopItems = async (req, res, next) => {
  try {
    const items = await prisma.shopItem.findMany();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

const purchaseItem = async (req, res, next) => {
  try {
    const { itemId, priceExpected } = req.body;
    const userId = req.user.userId;

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      
      const price = priceExpected || item.price;
      if (user.coins < price) {
        throw new Error("Insufficient coins");
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { coins: { decrement: price } }
      });

      // Add to inventory
      let expiresAt = null;
      if (item.type === "Booster") {
        expiresAt = new Date(Date.now() + 86400000); // Default 24h
      }

      await tx.userInventory.create({
        data: {
          userId,
          itemId,
          expiresAt
        }
      });

      await tx.activityLog.create({
        data: {
          userId,
          action: 'SHOP_PURCHASE',
          details: `Purchased ${item.name}`,
          coins: -price
        }
      });

      return updatedUser;
    });

    res.json({
      success: true,
      message: `Purchased ${item.name} successfully`,
      remainingCoins: result.coins
    });
  } catch (error) {
    if (error.message === "Insufficient coins") {
      return res.status(402).json({ error: error.message });
    }
    next(error);
  }
};

const getInventory = async (req, res, next) => {
  try {
    const inventory = await prisma.userInventory.findMany({
      where: { 
        userId: req.user.userId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: { item: true }
    });

    const formattedInventory = inventory.map(inv => ({
      itemId: inv.itemId,
      name: inv.item.name,
      type: inv.item.type,
      expiresAt: inv.expiresAt
    }));

    res.json(formattedInventory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShopItems,
  purchaseItem,
  getInventory
};
