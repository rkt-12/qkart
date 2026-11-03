var express = require("express");
var router = express.Router();

const { handleError, getProduct } = require("../utils");
var { products } = require("../db");

// GET /products
// Retrieve all products
router.get("/", (req, res) => {
  console.log("Request received for retrieving products list");

  products.find({}, (err, docs) => {
    if (err) {
      return handleError(res, err);
    }
    return res.status(200).json(docs);
  });
});

// GET /products/search?value=
// Search products by name or category
router.get("/search", (req, res) => {
  const value = req.query.value;

  console.log("Request received for searching", value);

  // Validate the search value
  if (!value || !value.trim()) {
    return res.status(400).json({
      message: "Search value is required",
    });
  }

  // Escape special regex characters to prevent invalid patterns
  const escapedValue = value
    .replace(/['"]+/g, "")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const searchRegex = new RegExp(escapedValue, "i");

  products.find(
    {
      $or: [
        { name: searchRegex },
        { category: searchRegex },
      ],
    },
    (err, docs) => {
      if (err) {
        return handleError(res, err);
      }

      if (docs && docs.length > 0) {
        return res.status(200).json(docs);
      }

      return res.status(404).json([]);
    }
  );
});

// GET /products/:id
// Retrieve a product by ID
router.get("/:id", async (req, res) => {
  console.log(
    `Request received for retrieving product with id: ${req.params.id}`
  );

  try {
    const product = await getProduct(req.params.id);

    if (product) {
      return res.status(200).json(product);
    }

    return res.status(404).json({
      message: "Product not found",
    });
  } catch (error) {
    return handleError(res, error);
  }
});
module.exports = router;
