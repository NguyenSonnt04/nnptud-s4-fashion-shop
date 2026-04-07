var express = require('express')
var router = express.Router()
let reservationModel = require('../schemas/reservation')

router.get('/', async function (req, res, next) {
    try {
        let data = await reservationModel.find({ isDeleted: false })
            .populate('user')
            .populate('address')
            .populate('payment')
            .populate('products.product')
        res.send(data)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id
        let result = await reservationModel.find({ isDeleted: false, _id: id })
            .populate('user')
            .populate('address')
            .populate('payment')
            .populate('products.product')
        if (result.length > 0) {
            res.send(result[0])
        } else {
            res.status(404).send("ID NOT FOUND")
        }
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.post('/', async function (req, res, next) {
    try {
        let newReservation = new reservationModel({
            user: req.body.user,
            products: req.body.products,
            address: req.body.address,
            payment: req.body.payment,
            status: req.body.status,
            discount: req.body.discount,
            amount: req.body.amount
        })
        await newReservation.save()
        res.send(newReservation)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id
        let result = await reservationModel.findByIdAndUpdate(id, req.body, { new: true })
        res.send(result)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id
        let result = await reservationModel.findById(id)
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
