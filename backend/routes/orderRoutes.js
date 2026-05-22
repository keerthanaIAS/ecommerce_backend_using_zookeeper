const router = require('express').Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/', getOrders);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;