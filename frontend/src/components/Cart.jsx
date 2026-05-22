import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div style={emptyStyle}>
        <h2>Your cart is empty</h2>
        <Link to="/" style={buttonStyle}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1>Shopping Cart</h1>
      {cart.map(item => (
        <div key={item.id} style={cartItemStyle}>
          <img src={item.image} alt={item.name} style={cartImageStyle} />
          <div style={itemInfoStyle}>
            <h3>{item.name}</h3>
            <p>₹{item.price.toLocaleString()}</p>
          </div>
          <div style={quantityStyle}>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={qtyBtn}>-</button>
            <span style={qtySpan}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={qtyBtn}>+</button>
          </div>
          <p style={itemTotalStyle}>₹{(item.price * item.quantity).toLocaleString()}</p>
          <button onClick={() => removeFromCart(item.id)} style={removeBtn}>Remove</button>
        </div>
      ))}
      <div style={totalStyle}>
        <h2>Total: ₹{getTotal().toLocaleString()}</h2>
        <Link to="/checkout">
          <button style={checkoutBtn}>Proceed to Checkout</button>
        </Link>
      </div>
    </div>
  );
}

const containerStyle = {
  maxWidth: 800,
  margin: '20px auto',
  padding: 20
};

const cartItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  borderBottom: '1px solid #ddd',
  padding: '20px 0'
};

const cartImageStyle = {
  width: 80,
  height: 80,
  objectFit: 'cover',
  borderRadius: 4
};

const itemInfoStyle = {
  flex: 1
};

const quantityStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10
};

const qtyBtn = {
  padding: '5px 10px',
  cursor: 'pointer',
  border: '1px solid #ddd',
  background: '#f5f5f5'
};

const qtySpan = {
  minWidth: 30,
  textAlign: 'center'
};

const itemTotalStyle = {
  minWidth: 100,
  fontWeight: 'bold'
};

const removeBtn = {
  padding: '5px 10px',
  cursor: 'pointer',
  background: '#ff4444',
  color: 'white',
  border: 'none',
  borderRadius: 4
};

const totalStyle = {
  marginTop: 30,
  textAlign: 'right'
};

const checkoutBtn = {
  background: '#5469d4',
  color: 'white',
  border: 'none',
  padding: '12px 30px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 16,
  marginLeft: 20
};

const emptyStyle = {
  textAlign: 'center',
  marginTop: 50
};

const buttonStyle = {
  background: '#5469d4',
  color: 'white',
  textDecoration: 'none',
  padding: '10px 20px',
  borderRadius: 4,
  display: 'inline-block'
};