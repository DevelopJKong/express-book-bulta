const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const localStrategy = require("passport-local");

const app = express();

app.set('port',process.env.PORT || 8050);

let fakeUser = {
    username: 'test@test.com',
    password: '1234'
}

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser('passportExample'));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'passportExample',
    cookie: {
        httpOnly:true,
        secure: false
    }
}));

app.get("/",(req,res) => {
    return res.sendFile(process.cwd() + "/index.html");
})


app.listen(app.get('port'),() => {
    console.log(`http://localhost:${process.env.PORT || 8050}`);
})

