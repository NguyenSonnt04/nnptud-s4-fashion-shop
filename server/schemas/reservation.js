let mongoose = require('mongoose')

let itemReservationSchema = mongoose.Schema({
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'product'
    },
    quantity: {
        type: Number,
        min: 1
    },
    price: {
        type: Number,
        min: 0
    },
    title: {
        type: String,
        default: ''
    },
    subtotal: {
        type: Number,
        min: 0
    },
    promotion: {
        type: Number,
        min: 0,
        default: 0
    }
}, {
    _id: false
})

let reservationSchema = mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    products: {
        type: [itemReservationSchema],
        default: []
    },
    address: {
        type: mongoose.Types.ObjectId,
        ref: 'address',
        required: true
    },
    voucher: {
        type: mongoose.Types.ObjectId,
        ref: 'voucher',
        default: null
    },
    payment: {
        type: mongoose.Types.ObjectId,
        ref: 'payment',
        default: null
    },
    status: {
        type: String,
        enum: ['actived', 'cancelled', 'expired', 'transfer'],
        default: 'actived'
    },
    expiredIn: {
        type: Date,
        default: null
    },
    amount: {
        type: Number,
        min: 0,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model('reservation', reservationSchema)
