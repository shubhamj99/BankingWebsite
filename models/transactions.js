const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'Account'
    },
    balance: Number,
    date: String
});

const Transaction = mongoose.model('Transactions', transactionSchema);

module.exports = Transaction;