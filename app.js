const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const Order = mongoose.model('Order', {
  orderItems: [
    {
      price: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, required: true },
});

app.get('/api/bar-chart/:month', async (req, res) => {
  const month = req.params.month;
  const priceRanges = [
    { min: 0, max: 100 },
    { min: 101, max: 200 },
    { min: 201, max: 300 },
    { min: 301, max: 400 },
    { min: 401, max: 500 },
    { min: 501, max: 600 },
    { min: 601, max: 700 },
    { min: 701, max: 800 },
    { min: 801, max: 900 },
    { min: 901, max: Infinity },
  ];

  const data = await Promise.all(priceRanges.map(async (range) => {
    const count = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${month}-01T00:00:00.000Z`),
            $lt: new Date(`${month}-31T23:59:59.999Z`),
          },
        },
      },
      {
        $unwind: '$orderItems',
      },
      {
        $match: {
          'orderItems.price': { $gte: range.min, $lt: range.max },
        },
      },
      {
        $count: 'count',
      },
    ]);

    return { range: `${range.min} - ${range.max}`, count: count[0].count };
  }));

  res.json(data);
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
