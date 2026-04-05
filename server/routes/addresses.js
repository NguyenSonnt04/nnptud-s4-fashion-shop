var express = require('express');
var router = express.Router();
let addressModel = require('../schemas/addresses')
const { CheckLogin } = require('../utils/authHandler')

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

module.exports = router;
