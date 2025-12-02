import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';

//  Get all orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .populate('items.productId', 'name price');
  res.json({ success: true, orders });
});

// Get single order
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('userId', 'name email')
    .populate('items.productId', 'name price');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  //  Return full order details with billing & shipping info
  res.json({
    success: true,
    order: {
      ...order.toObject(),
      phone: order.shippingAddress?.phone || order.phone || 'N/A',
      address:
        order.shippingAddress?.address
          ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}, ${order.shippingAddress.country}`
          : order.shippingAddress?.address || 'N/A',
    },
  });
});

//  Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  if (!status || !allowedStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  order.status = status.toLowerCase();
  await order.save();
  res.json({ success: true, order });
});

//  Delete order
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  await order.deleteOne();
  res.json({ success: true, message: 'Order deleted successfully' });
});
