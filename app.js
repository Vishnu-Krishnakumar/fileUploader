const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
const app = express();
const pool = require("./db/pool");
const dbRouters = require("./router/dbRouter.js");
const { body, validationResult } = require("express-validator");
const auth = require("./authenticate/auth.js");
const LocalStrategy = require('passport-local').Strategy;

app.set("view engine", "ejs");
app.use(session({
  cookie: {
    maxAge: 60 * 60 * 1000 // ms
  },  
  secret: process.env.session_secret, 
  resave: false, 
  saveUninitialized: false ,
  store: new PrismaSessionStore(
    new PrismaClient(),
    {
      checkPeriod: 2 * 60 * 1000,  //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }
  )
}));

app.use(auth.passport.session());
app.use(express.urlencoded({extended:true}));
app.use(express.static('css'));
app.use("/",dbRouters);

const PORT =  process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Start of members only app! - listening on port ${PORT}!`);
});