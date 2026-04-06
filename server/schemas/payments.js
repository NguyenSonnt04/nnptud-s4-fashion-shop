let mongoose = require('mongoose')

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
