const products = require('../data/products');

exports.getProducts = (req, res) => {
  res.json(products);
};