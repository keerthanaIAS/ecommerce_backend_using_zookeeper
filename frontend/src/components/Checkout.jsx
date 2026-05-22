import { useState } from 'react';
import { useCart } from '../context/CartContext';
import PaymentForm from './PaymentForm';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: ''
  });
  const { getTotal, cart } = useCart();

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <div style={containerStyle}>
      {step === 1 && (
        <div>
          <h1>Shipping Information</h1>
          <form onSubmit={handleShippingSubmit} style={formStyle}>
            <input
              type="text"
              placeholder="Full Name"
              required
              value={shippingInfo.name}
              onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Address"
              required
              value={shippingInfo.address}
              onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="City"
              required
              value={shippingInfo.city}
              onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Postal Code"
              required
              value={shippingInfo.postalCode}
              onChange={e => setShippingInfo({...shippingInfo, postalCode: e.target.value})}
              style={inputStyle}
            />
            <button type="submit" style={buttonStyle}>Continue to Payment</button>
          </form>
        </div>
      )}
      
      {step === 2 && (
        <PaymentForm shippingInfo={shippingInfo} />
      )}
    </div>
  );
}

const containerStyle = {
  maxWidth: 500,
  margin: '50px auto',
  padding: 20
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 15
};

const inputStyle = {
  padding: 12,
  border: '1px solid #ddd',
  borderRadius: 4,
  fontSize: 16
};

const buttonStyle = {
  background: '#5469d4',
  color: 'white',
  border: 'none',
  padding: 12,
  borderRadius: 4,
  fontSize: 16,
  cursor: 'pointer'
};