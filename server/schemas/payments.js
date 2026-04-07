let mongoose = require('mongoose')

let paymentAddressSchema = mongoose.Schema({
    fullName: { type: String },
    phone: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    detail: { type: String, default: "" }
}, { _id: false })

let paymentItemSchema = mongoose.Schema({
    product: { type: mongoose.Types.ObjectId },
    quantity: { type: Number, min: 1 }
}, { _id: false })

let paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    method: {
        type: String,
        enum: ["COD", "zalopay", "momo", "vnpay"],
        required: true
    },
    transactionID: {
        type: String,
        default: ""
    },
    currency: {
        type: String,
        default: "VND"
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    address: {
        type: paymentAddressSchema,
        default: null
    },
    items: {
        type: [paymentItemSchema],
        default: []
    },
    status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending"
    },
    providerResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    pendingAt: {
        type: Date,
        default: null
    },
    paidAt: {
        type: Date,
        default: null
    },
    failedAt: {
        type: Date,
        default: null
    },
    refundAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model('payment', paymentSchema)
