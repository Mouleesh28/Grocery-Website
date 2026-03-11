const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    shopId: String,
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    image: String
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);