import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get('http://localhost:4000/api/products');
    setProducts(res.data);
  };

  return (
    <div style={containerStyle}>
      <h1>Our Products</h1>
      <div style={gridStyle}>
        {products.map(product => (
          <div key={product.id} style={cardStyle}>
            <img src={product.image} alt={product.name} style={imageStyle} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p style={priceStyle}>₹{product.price.toLocaleString()}</p>
            <button onClick={() => addToCart(product)} style={buttonStyle}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: 20
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 20
};

const cardStyle = {
  border: '1px solid #ddd',
  borderRadius: 8,
  padding: 15,
  textAlign: 'center'
};

const imageStyle = {
  width: '100%',
  height: 200,
  objectFit: 'cover',
  borderRadius: 4
};

const priceStyle = {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#5469d4'
};

const buttonStyle = {
  background: '#5469d4',
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 16
};