const {Router} = require("express");
const dbRouters = Router();
const validation = require("../validate/validation");
const { body, validationResult } = require("express-validator");
const auth = require("../authenticate/auth");
const dbController = require("../controller/dbController");
const multer  = require('multer')
// const storage = multer.diskStorage({
//   destination : function (req,file,cb){
//     cb(null,'./upload')
//   },
//   filename: function (req,file,cb){
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const fileParts = file.originalname.split('.');
//     cb(null,`${fileParts[0]}-${uniqueSuffix}.${fileParts[1]}`)
//   }
// })
// const upload = multer({ storage: storage })
const upload = multer()
dbRouters.get("/",(req,res)=> {res.render("sign-up",{
    errors:[]
})});

// dbRouters.get("/upload",(req,res)=>{
//     res.render("upload")
// });

dbRouters.get("/log",(req,res)=>{res.render("log-in")})

dbRouters.get("/log-out",(req,res,next)=>{
    req.logout((err)=>{
        return next(err);
    })
    res.redirect("/");
})

dbRouters.get("/viewFile", dbController.viewFile);

dbRouters.get("/viewFolder",dbController.viewFolder);

dbRouters.get("/download",dbController.downloadFile);
///////////////////////////////////////////post//////////////////////////////////
dbRouters.post("/register",validation.validateUser,dbController.userRegistration)

dbRouters.post("/logIn",auth.passport.authenticate('local',{failureRedirect:"/log"}),dbController.logIn);

dbRouters.post("/upload",upload.single("uploaded_file"),dbController.fileUpload);

dbRouters.post("/createFolder",dbController.folderCreation);

dbRouters.post("/sendToFolder",dbController.sendToFolder);

dbRouters.post("/removeFromFolder",dbController.removeFileFromFolder);

dbRouters.post("/deleteFile", dbController.deleteFile);

dbRouters.post("/uploadInFolder",upload.single("uploaded_file"),dbController.sendToThisFolder);

dbRouters.post("/deleteInFolder",dbController.deleteInFolder)
module.exports = dbRouters