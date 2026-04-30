const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const protect = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const Joi = require('joi');

const buyItemSchema = Joi.object({
  itemId: Joi.string().uuid().required(),
  priceExpected: Joi.number().integer().min(0)
});

router.get('/items', protect, shopController.getShopItems);
router.post('/buy', protect, validate(buyItemSchema), shopController.purchaseItem);
router.get('/inventory', protect, shopController.getInventory);

module.exports = router;
