import OrderItem from "../Models/Orderitem.js";

// ✅ Create Order Item
export const createOrderItem = async (req, res) => {
  try {
    const { order, product, quantity, price } = req.body;

    const newOrderItem = new OrderItem({
      order,
      product,
      quantity,
      price
    });

    await newOrderItem.save();
    res.status(201).json(newOrderItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all order items


export const getAllOrderItems = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", sortBy = "createdAt", order = "desc" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch order items
    let orderItems = await OrderItem.find()
      .populate({
        path: "product",
        select: "name price",
        match: search ? { name: { $regex: search, $options: "i" } } : {},
      })
      .populate("order", "status total_amount")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Remove items where product didn't match search
    orderItems = orderItems.filter(item => item.product);

    const total = await OrderItem.countDocuments();

    res.json({
      total,
      page,
      limit,
      data: orderItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get single order item by ID
export const getOrderItemById = async (req, res) => {
  try {
    const orderItem = await OrderItem.findById(req.params.id)
      .populate("order", "status totalAmount")
      .populate("product", "name price");

    if (!orderItem) {
      return res.status(404).json({ message: "Order Item not found" });
    }
    res.json(orderItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update order item
export const updateOrderItem = async (req, res) => {
  try {
    const updatedOrderItem = await OrderItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedOrderItem) {
      return res.status(404).json({ message: "Order Item not found" });
    }
    res.json(updatedOrderItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete order item
export const deleteOrderItem = async (req, res) => {
  try {
    const deleted = await OrderItem.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Order Item not found" });
    }
    res.json({ message: "Order Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
