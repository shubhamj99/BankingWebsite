const Account = require('./models/accounts');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/bank', {
    useNewUrlParser : true,
    useCreateIndex : true,
    useUnifiedTopology : true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", ()=>{
    console.log("Database Connected");
});

const seedAccounts = [
    {
        name: "Brittany",
        email: "brittany98@gmail.com",
        balance: 10999
    },
    {
        name: "Kelly",
        email: "kellycruz@gmail.com",
        balance: 11999
    },
    {
        name: "James",
        email: "jamescordon@gmail.com",
        balance: 87857
    },
    {
        name: "Alex",
        email: "alex95@gmail.com",
        balance: 87653
    },
    {
        name: "Shelby",
        email: "shelby89@gmail.com",
        balance: 21435
    },
    {
        name: "David",
        email: "david.b@gmail.com",
        balance: 14499
    },
    {
        name: "Jimmy",
        email: "jimmy.j@gmail.com",
        balance: 11439
    },
    {
        name: "Mia",
        email: "mia14@gmail.com",
        balance: 431999
    },
    {
        name: "Cary",
        email: "mecari@gmail.com",
        balance: 113299
    },
    {
        name: "Layla",
        email: "layla14@gmail.com",
        balance: 11129
    },
];

Account.insertMany(seedAccounts)
    .then(res=>{
        console.log(res)
    })
    .catch(e=>{
        console.log(e)
    })