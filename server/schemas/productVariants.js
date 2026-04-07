let mongoose = require('mongoose')
let productVariantSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    barcode: {
        type: String,
        default: ""
    },
    size: {
        type: String,
        required: true,
        enum: ["S", "M", "L", "XL", "XXL", "XXXL", "FREESIZE"]
    },
    color: {
        type: String,
        required: true
    },
    colorCode: {
        type: String,
        default: ""
    },
    material: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        min: 0
    },
    discountPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    weight: {
        type: Number,
        min: 0,
        default: 0
    },
    images: {
        type: [String],
        default: ["https://placehold.co/600x400"]
    },
    status: {
        type: String,
        enum: ["active", "inactive", "out_of_stock"],
        default: "active"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('productVariant', productVariantSchema)
