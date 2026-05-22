const router = require('express').Router();
const { getProducts } = require('../controllers/productController');

router.get('/', getProducts);

module.exports = router;