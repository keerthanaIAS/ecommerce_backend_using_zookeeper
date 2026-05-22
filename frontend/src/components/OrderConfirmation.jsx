import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const res = await axios.get('http://localhost:4000/api/orders');
    const found = res.data.find(o => o.id == orderId);
    setOrder(found);
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div style={containerStyle}>
      <div style={successStyle}>
        ✅ Order Confirmed!
      </div>
      <h1>Order #{order.id}</h1>
      <p>Status: {order.orderStatus}</p>
      <p>Payment: {order.paymentStatus}</p>
      <h2>Items:</h2>
      {order.products.map((item, idx) => (
        <div key={idx}>
          {item.name} x {item.quantity} = ₹{(item.price * item.quantity).toLocaleString()}
        </div>
      ))}
      <h2>Total: ₹{order.total.toLocaleString()}</h2>
      <h3>Shipping to:</h3>
      <p>{order.shipping.name}<br/>{order.shipping.address}<br/>{order.shipping.city}</p>
      <Link to="/">
        <button style={buttonStyle}>Continue Shopping</button>
      </Link>
    </div>
  );
}

const containerStyle = {
  maxWidth: 600,
  margin: '50px auto',
  padding: 20
};

const successStyle = {
  background: '#4caf50',
  color: 'white',
  padding: '20px',
  textAlign: 'center',
  fontSize: 24,
  borderRadius: 8,
  marginBottom: 20
};

const buttonStyle = {
  background: '#5469d4',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 16,
  marginTop: 20
};