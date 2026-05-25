import {CardElement,useStripe,useElements} from '@stripe/react-stripe-js';
import axios from 'axios';

export default function CheckoutForm(){
 const stripe=useStripe();
 const elements=useElements();

 const handleSubmit=async(e)=>{
   e.preventDefault();

   const {data}=await axios.post(
   'http://localhost:4000/create-payment-intent',
   {amount:1000}
   );

   const result=await stripe.confirmCardPayment(data.clientSecret,{
     payment_method:{
       card:elements.getElement(CardElement)
     }
   });

   if(result.error) alert(result.error.message);
   else alert('Payment Success');
 };

 return(
 <form onSubmit={handleSubmit}>
   <CardElement/>
   <button type='submit'>Pay</button>
 </form>
 )
}