var express = require('express');
var router = express.Router();
let voucherModel = require('../schemas/vouchers')

//R CUD
router.get('/', async function (req, res, next) {
  try {
    let queries = req.query;
    let codeQ = queries.code ? queries.code.toUpperCase() : '';
    let typeQ = queries.type ? queries.type : '';
    let statusQ = queries.status ? queries.status : '';
    let data = await voucherModel.find({
      isDeleted: false,
      code: new RegExp(codeQ, 'i'),
      type: typeQ ? typeQ : { $exists: true },
      status: statusQ ? statusQ : { $exists: true }
    })
    res.send(data);
  } catch (error) {
    res.status(404).send(error.message)
  }
});
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await voucherModel.find({
      isDeleted: false,
      _id: id
    })
    if (result.length > 0) {
      res.send(result[0])
    } else {
      res.status(404).send("ID NOT FOUND")
    }
  } catch (error) {
    res.status(404).send(error.message)
  }

});

router.post('/', async function (req, res, next) {
  try {
    let newVoucher = new voucherModel({
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      minOrder: req.body.minOrder,
      maxDiscount: req.body.maxDiscount,
      quantity: req.body.quantity,
      usedCount: req.body.usedCount,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      status: req.body.status
    })
    await newVoucher.save();
    res.send(newVoucher)
  } catch (error) {
    res.status(404).send(error.message)
  }
})
router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await voucherModel.findByIdAndUpdate(
      id, req.body, {
      new: true
    })
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})
router.delete('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await voucherModel.findById(id)
    result.isDeleted = true;
    await result.save()
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})

module.exports = router;
