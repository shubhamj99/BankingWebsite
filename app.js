const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Account = require('./models/accounts');
const Transaction = require('./models/transactions');
const flash = require('connect-flash');
const session = require('express-session');
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/bank';
const MongoDBStore = require('connect-mongo')(session);

mongoose.connect(dbUrl, {
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

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*60*60
});

store.on("error",function(e){
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use((req, res, next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.listen(port, ()=>{
    console.log("Running on port 3000");
});

app.get('/',(req, res)=>{
    res.render('pages/homepage');
});

app.get('/account', async(req, res)=>{
    const admin = await Account.findById("601e7fe8284b0b296b1e2922");
    const transacts = await Transaction.find({}).populate('user');
    res.render('pages/viewaccount', { admin, transacts });
});

app.get('/transfer', async(req, res)=>{
    const allAccounts = await Account.find({});
    res.render('pages/transfer', { allAccounts });
});

app.post('/account', async(req, res)=>{
    const id = req.body.id;
    const amount = req.body.amount;
    const sender = await Account.findById("601e7fe8284b0b296b1e2922");
    const balanceLeft = (+sender.balance) - (+amount);
    if(balanceLeft >= 0){
        const reciever = await Account.findById(id);
        const recieverBalance = (+reciever.balance) + (+amount);
        sender.balance = balanceLeft;
        reciever.balance = recieverBalance;
        if(sender.balance === 0){
            sender.balance = 12000;
        }
        await sender.save();
        await reciever.save();

        //new transaction update
        const transact = new Transaction(req.body.transact);
        transact.user = reciever._id;
        const now = new Date();
        transact.date = now.toUTCString();
        transact.balance = amount;
        await transact.save();

        console.log(recieverBalance, balanceLeft);
        return res.render('pages/success');
    }
    res.render('pages/failed');
});
