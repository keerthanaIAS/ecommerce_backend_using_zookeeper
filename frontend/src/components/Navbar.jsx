import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  
  return (
    <nav style={navStyle}>
      <Link to="/" style={linkStyle}>🛒 E-Shop</Link>
      <Link to="/cart" style={cartLinkStyle}>
        🛍️ Cart ({itemCount})
      </Link>
    </nav>
  );
}

const navStyle = {
  background: '#5469d4',
  padding: '15px 30px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '24px',
  fontWeight: 'bold'
};

const cartLinkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: '18px'
};