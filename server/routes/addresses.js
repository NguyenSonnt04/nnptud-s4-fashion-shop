var express = require('express');
var router = express.Router();
let addressModel = require('../schemas/addresses')
const { CheckLogin } = require('../utils/authHandler')

router.get('/', CheckLogin, async function (req, res, next) {
    try {
        let user = req.user;
        let data = await addressModel.find({
            isDeleted: false,
            user: user._id
        })
        res.send(data)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.get('/:id', CheckLogin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let user = req.user;
        let result = await addressModel.find({
            isDeleted: false,
            _id: id,
            user: user._id
        })
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
        let user = req.user;
        let newAddress = new addressModel({
            user: user._id,
            fullName: req.body.fullName,
            phone: req.body.phone,
            province: req.body.province,
            district: req.body.district,
            ward: req.body.ward,
            detail: req.body.detail,
            isDefault: req.body.isDefault
        })
        await newAddress.save()
        res.send(newAddress)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

router.put('/:id', CheckLogin, async function (req, res, next) {
    try {
        let id = req.params.id;
        let user = req.user;
        let address = await addressModel.findOne({
            isDeleted: false,
            _id: id,
            user: user._id
        })
        if (!address) {
            res.status(404).send("ID NOT FOUND")
            return
        }
        let result = await addressModel.findByIdAndUpdate(id, req.body, {
            new: true
        })
        res.send(result)
    } catch (error) {
        res.status(404).send(error.message)
    }
})

module.exports = router;
