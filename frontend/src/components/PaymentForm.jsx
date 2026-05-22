import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import stripePromise from '../stripe';

function PaymentFormComponent({ shippingInfo }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { cart, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setLoading(true);
    
    try {
      // Create order
      const orderRes = await axios.post('http://localhost:4000/api/orders', {
        products: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shipping: shippingInfo,
        total: getTotal()
      });
      
      const order = orderRes.data;
      
      // Create payment intent
      const { data } = await axios.post('http://localhost:4000/api/payments/create-payment-intent', {
        amount: getTotal(),
        orderId: order.id
      });
      
      // Confirm payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: shippingInfo.name,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              postal_code: shippingInfo.postalCode
            }
          }
        }
      });
      
      if (result.error) {
        alert('Payment failed: ' + result.error.message);
      } else {
        alert('Payment successful!');
        clearCart();
        navigate(`/order-confirmation/${order.id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Payment Details</h1>
      <form onSubmit={handleSubmit}>
        <div style={cardStyle}>
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' }
              }
            }
          }} />
        </div>
        <button type="submit" disabled={!stripe || loading} style={buttonStyle}>
          {loading ? 'Processing...' : `Pay ₹${(cart.reduce((sum, item) => sum + item.price * item.quantity, 0)).toLocaleString()}`}
        </button>
      </form>
    </div>
  );
}

const cardStyle = {
  padding: '15px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  marginBottom: '20px',
  backgroundColor: 'white'
};

const buttonStyle = {
  width: '100%',
  background: '#5469d4',
  color: 'white',
  border: 'none',
  padding: '12px',
  borderRadius: '4px',
  fontSize: '16px',
  cursor: 'pointer'
};

export default function PaymentForm(props) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormComponent {...props} />
    </Elements>
  );
}