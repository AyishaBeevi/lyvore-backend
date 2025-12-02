const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({

  name: String,
  email: String,
  phone: String,
  billingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String
  }
});


module.exports = mongoose.model('Customer', customerSchema);
