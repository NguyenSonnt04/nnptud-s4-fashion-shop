var express = require('express')
var router = express.Router()
let paymentModel = require('../schemas/payments')
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
        let newPayment = new paymentModel({
            user: user._id,
            method: req.body.method,
            amount: req.body.amount,
            transactionID: req.body.transactionID,
            currency: req.body.currency,
            pendingAt: Date.now()
        })
        await newPayment.save()
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
