const {Router} = require("express");
const dbRouters = Router();

dbRouters.get("/",(req,res)=> {res.render("sign-up",{
    errors:[]
})});

module.exports = dbRouters