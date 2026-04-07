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
    subtotal: {
        type: Number,
        min: 0
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
    payment: {
        type: mongoose.Types.ObjectId,
        ref: 'payment',
        default: null
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },
    discount: {
        type: Number,
        min: 0,
        default: 0
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
