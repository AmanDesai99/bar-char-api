const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the schema for the Transactions collection
const transactionSchema = new mongoose.Schema({
  dateOfSale: Date,
  saleAmount: Number,
  product: {
    title: String,
    description: String,
    price: Number
  },
  region: String
});

// Create the Transactions model
const Transactions = mongoose.model('Transactions', transactionSchema);

// API to get bar chart data for a selected month
app.get('/bar-chart/:month', async (req, res) => {
  const month = req.params.month;

  const data = await Transactions.aggregate([
    {
      $match: {
        $expr: { $eq: [{ $month: "$dateOfSale" }, month] }
      }
    },
    {
      $bucket: {
        groupBy: "$saleAmount",
        boundaries: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, Infinity],
        output: {
          count: { $sum: 1 }
        }
      }
    }
  ]);

  const response = data.map((item) => {
    let priceRange;
    if (item._id.min === 0) {
      priceRange = `0 - ${item._id.max}`;
    } else if (item._id.max === Infinity) {
      priceRange = `${item._id.min} - above`;
    } else {
      priceRange = `${item._id.min} - ${item._id.max}`;
    }
    return { priceRange, count: item.count };
  });

  res.send(response);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
