import Order from "../Models/Order.js";
import OrderItem from "../Models/Orderitem.js";
import Payment from "../Models/Payment.js";
import mongoose from "mongoose";
import { sendEmail } from "../Utils/sendemail.js";


// ✅ Create Order (without payment logic)
export const createOrder = async (req, res) => {
  try {
    const { user, address, total_amount, notes } = req.body;

    // 1️⃣ Create order
    const order = await Order.create({ user, address, total_amount, notes });

    res.status(201).json({
      message: "Order created successfully. Use payment API to complete payment.",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user")
      .populate("address")
      .populate({ path: "orderItems", populate: { path: "product" } })
      .populate("offer")
      .populate("payment");

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Restrict non-admin users to their own orders
    if (req.user.role === "user" && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Order
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order updated", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Order (admin only)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Delete all linked order items
    await OrderItem.deleteMany({ order: order._id });

    // Cancel linked payment (if exists)
    if (order.payment) {
      await Payment.findByIdAndUpdate(order.payment, { status: "cancelled" });
    }

    // Mark order as cancelled
    order.status = "cancelled";
    await order.save();

    // Delete order
    await Order.findByIdAndDelete(order._id);

    res.json({ message: "Order and related items deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get All Orders (with filters, pagination, search)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, paymentStatus, startDate, endDate } = req.query;

    let query = {};

    // 🔹 Search by Order ID / User ID / User fields
    if (search) {
      query.$or = [];
      if (mongoose.Types.ObjectId.isValid(search)) query.$or.push({ _id: search });
      if (mongoose.Types.ObjectId.isValid(search)) query.$or.push({ user: search });
      query.$or.push({ "user.name": { $regex: search, $options: "i" } });
      query.$or.push({ "user.email": { $regex: search, $options: "i" } });
    }

    // 🔹 Filter by order status
    if (status) query.status = status;

    // 🔹 Restrict normal users to their own orders
    if (req.user.role === "user") query.user = req.user._id;

    // 🔹 Date filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Fetch orders
    let orders = await Order.find(query)
      .populate("user", "name email")
      .populate("address")
      .populate({ path: "orderItems", populate: { path: "product" } })
      .populate("offer")
      .populate("payment")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter by payment status after populate
    if (paymentStatus) {
      orders = orders.filter(o => o.payment && o.payment.status === paymentStatus);
    }

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ Confirm order payment and send email
export const confirmOrderPayment = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("user");
    if (!order) return { success: false, message: "Order not found" };

    // Update order status
    order.status = "confirmed";
    await order.save();

    // Send email if user email exists
    if (order.user && order.user.email) {
      const subject = `Your Order #${order._id} is Confirmed`;
      const text = `Hi ${order.user.name},\n\nYour payment has been successfully received and your order is confirmed.\n\nOrder ID: ${order._id}\nTotal Amount: ₹${order.total_amount}\n\nThank you for shopping with us!`;

      await sendEmail(order.user.email, subject, text);
    }

    return { success: true, message: "Order confirmed and email sent", order };
  } catch (error) {
    console.error("Confirm Order Error:", error.message);
    return { success: false, message: error.message };
  }
};
// ✅ Refund order payment and send email
export const refundOrderPayment = async (orderId, amount) => {
  try {
    const order = await Order.findById(orderId).populate("user");
    if (!order) return { success: false, message: "Order not found" };

    // Update order status
    order.status = "refunded";
    await order.save();

    // Send email if user email exists
    if (order.user && order.user.email) {
      const subject = `Your Order #${order._id} has been Refunded`;
      const text = `Hi ${order.user.name},\n\nYour payment for Order ID ${order._id} has been successfully refunded.\nRefund Amount: ₹${amount}\n\nWe hope to serve you again soon!`;

      await sendEmail(order.user.email, subject, text);
    }

    return { success: true, message: "Order refunded and email sent", order };
  } catch (error) {
    console.error("Refund Order Error:", error.message);
    return { success: false, message: error.message };
  }
};
