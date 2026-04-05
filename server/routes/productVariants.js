var express = require('express');
var router = express.Router();
let mongoose = require('mongoose')
let productVariantModel = require('../schemas/productVariants')
let productModel = require('../schemas/products')
let inventoryModel = require('../schemas/inventories')

//R CUD
/* GET all variants (filter theo product, size, color, price). */
router.get('/', async function (req, res, next) {
  try {
    let queries = req.query;
    let productId = queries.product ? queries.product : '';
    let sizeQ = queries.size ? queries.size : '';
    let colorQ = queries.color ? queries.color.toLowerCase() : '';
    let min = queries.minprice ? queries.minprice : 0;
    let max = queries.maxprice ? queries.maxprice : 10000000;

    let filter = {
      isDeleted: false,
      price: {
        $gte: min,
        $lte: max
      }
    }
    if (productId) {
      filter.product = productId;
    }
    if (sizeQ) {
      filter.size = sizeQ;
    }
    if (colorQ) {
      filter.color = new RegExp(colorQ, 'i');
    }

    let data = await productVariantModel.find(filter).populate({
      path: 'product',
      select: 'title slug category'
    })
    res.send(data);
  } catch (error) {
    res.status(404).send(error.message)
  }
});

router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productVariantModel.find({
      isDeleted: false,
      _id: id
    }).populate('product')
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
  let session = await mongoose.startSession();
  session.startTransaction()
  try {
    let productId = req.body.product;
    let product = await productModel.findOne({
      isDeleted: false,
      _id: productId
    })
    if (!product) {
      await session.abortTransaction()
      await session.endSession()
      res.status(404).send({ message: "san pham khong ton tai" })
      return;
    }

    let newVariant = new productVariantModel({
      product: productId,
      sku: req.body.sku,
      barcode: req.body.barcode,
      size: req.body.size,
      color: req.body.color,
      colorCode: req.body.colorCode,
      material: req.body.material,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      weight: req.body.weight,
      images: req.body.images,
      status: req.body.status
    })
    await newVariant.save({ session });

    let newInventory = new inventoryModel({
      product: newVariant._id,
      stock: req.body.stock ? req.body.stock : 0
    })
    await newInventory.save({ session });

    await session.commitTransaction()
    await session.endSession()
    res.send(newVariant)
  } catch (error) {
    await session.abortTransaction()
    await session.endSession()
    res.status(404).send(error.message)
  }
})

router.put('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await productVariantModel.findByIdAndUpdate(
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
    let result = await productVariantModel.findById(id)
    result.isDeleted = true;
    await result.save()
    res.send(result)
  } catch (error) {
    res.status(404).send(error.message)
  }
})

module.exports = router;
