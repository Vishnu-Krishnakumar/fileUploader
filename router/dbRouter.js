const {Router} = require("express");
const dbRouters = Router();
const validation = require("../validate/validation");
const { body, validationResult } = require("express-validator");
const bcrypt  = require("bcryptjs");
const db = require("../db/queries");
const auth = require("../authenticate/auth");

dbRouters.get("/",(req,res)=> {res.render("sign-up",{
    errors:[]
})});
dbRouters.get("/upload",(req,res)=>{
    res.render("upload")
});
dbRouters.get("/log",(req,res)=>{res.render("log-in")})
dbRouters.get("/log-out",(req,res,next)=>{
    req.logout((err)=>{
        return next(err);
    })
    res.redirect("/");
})

dbRouters.post("/register",validation.validateUser,async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).render("sign-up",{
           errors:errors.array(),
        });
      }
      try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user ={
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          hashedPassword: hashedPassword,
        };
        db.createUser(user);
      
        res.render("log-in",{
          errors:[]
        });
      }catch(error){
        console.error(error);
        next(error);
      }
})

dbRouters.post("/logIn",auth.passport.authenticate('local',{failureRedirect:"/log"}),(req,res)=>{
    res.render("upload")
})
module.exports = dbRouters