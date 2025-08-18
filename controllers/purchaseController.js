const Razorpay = require('razorpay');
const Order = require('../models/Order');
const User= require('../models/User');

exports.purchasePremium = async(req, res) => {

  try{
    var rzp = new Razorpay({
      key_id:process.env.RAZORPAY_KEY_ID,
      key_secret:process.env.RAZORPAY_KEY_SECRET
    })

    const amount = 25 * 100;

    const order = await rzp.orders.create({ amount, currency: "INR" }); // ✅ use await
    console.log("**********",order);

    await req.user.createOrder({ orderId: order.id, status: "PENDING" });

    return res.status(201).json({ order, key_id: rzp.key_id });

 
  }
  catch(error) {
    console.error('Error while purchasing:', error);
    return res.status(403).json({ message: 'Something went wrong', error: error });
  }
}

exports.updatetransactionstatus = async (req, res) => {
  try {
    const { payment_id, order_id } = req.body;

    // Find the order by order_id
    const order = await Order.findOne({ where: { orderId: order_id } });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    
    await order.update({ paymentId: payment_id, status: 'SUCCESSFUL' });
  
    await User.update({ ispremiumuser: true },{ where: { id: order.UserId } } );  
    

    return res.status(202).json({ success: true, message: "Transaction successful" });

  } catch (err) {
    console.error("Update transaction error:", err);
    return res.status(500).json({ success: false, message: "Transaction failed", error: err.message });
  }
};



