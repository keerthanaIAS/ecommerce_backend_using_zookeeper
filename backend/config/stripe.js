const Stripe=require('stripe');
module.exports=new Stripe(process.env.SECRET_KEY);