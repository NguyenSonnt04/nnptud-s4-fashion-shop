var express = require('express')
var router = express.Router()
let paymentModel = require('../schemas/payments')
let addressModel = require('../schemas/addresses')
let cartModel = require('../schemas/carts')
const { CheckLogin, CheckRole } = require('../utils/authHandler')

router.get('/', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let data = await paymentModel.find({ isDeleted: false }).populate('user')
        res.send(data)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get('/my', CheckLogin, async function (req, res, next) {
    try {
        let user = req.user
        let data = await paymentModel.find({ isDeleted: false, user: user._id })
        res.send(data)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get('/:id', CheckLogin, async function (req, res, next) {
    try {
        let id = req.params.id
        let result = await paymentModel.find({ isDeleted: false, _id: id })
        if (result.length > 0) {
            res.send(result[0])
        } else {
            res.status(404).send("ID NOT FOUND")
        }
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.post('/', CheckLogin, async function (req, res, next) {
    try {
        let user = req.user

        let address = await addressModel.findOne({
            _id: req.body.address,
            user: user._id,
            isDeleted: false
        })
        if (!address) {
            res.status(404).send({ message: "dia chi khong ton tai" })
            return
        }

        let cart = await cartModel.findOne({ user: user._id })
        if (!cart || cart.products.length === 0) {
            res.status(404).send({ message: "gio hang trong" })
            return
        }

        let newPayment = new paymentModel({
            user: user._id,
            method: req.body.method,
            amount: req.body.amount,
            transactionID: req.body.transactionID,
            currency: req.body.currency,
            pendingAt: Date.now(),
            address: {
                fullName: address.fullName,
                phone: address.phone,
                province: address.province,
                district: address.district,
                ward: address.ward,
                detail: address.detail
            },
            items: cart.products
        })
        await newPayment.save()

        cart.products = []
        await cart.save()

        res.send(newPayment)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.put('/:id', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id
        let result = await paymentModel.findByIdAndUpdate(id, req.body, { new: true })
        res.send(result)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.delete('/:id', CheckLogin, CheckRole("ADMIN"), async function (req, res, next) {
    try {
        let id = req.params.id
        let result = await paymentModel.findById(id)
        if (!result) {
            res.status(404).send("ID NOT FOUND")
            return
        }
        result.isDeleted = true
        await result.save()
        res.send(result)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

module.exports = router
