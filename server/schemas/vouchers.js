let mongoose = require('mongoose')
let voucherSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["percent", "fixed"],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minOrder: {
        type: Number,
        min: 0,
        default: 0
    },
    maxDiscount: {
        type: Number,
        min: 0,
        default: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    usedCount: {
        type: Number,
        min: 0,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "inactive"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('voucher', voucherSchema)
