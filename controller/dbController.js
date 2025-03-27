const {Router} = require("express");
const dbRouters = Router();
const validation = require("../validate/validation");
const { body, validationResult } = require("express-validator");
const auth = require("../authenticate/auth");
const bcrypt  = require("bcryptjs");
const db = require("../db/queries");
const multer  = require('multer')
const storage = multer.diskStorage({
  destination : function (req,file,cb){
    cb(null,'./upload')
  },
  filename: function (req,file,cb){
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileParts = file.originalname.split('.');
    cb(null,`${fileParts[0]}-${uniqueSuffix}.${fileParts[1]}`)
  }
})
const upload = multer({ storage: storage })
////////////////////////////Router Functions////////////////////////////
async function logIn(req,res){
  const user = {
    id: req.user.id,
  }
  console.log(user);
  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);
  console.log(folders);
  console.log(files);
  res.render("upload",{
    folders:folders,
    files:files,
  });

}

async function userRegistration(req, res){
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).render("sign-up",{
      errors:errors.array(),
      });
  }
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      hashedPassword: hashedPassword,
    };
    db.createUser(user);
        
    res.render("log-in",{
      errors:[]
    });
  } catch(error){
      console.error(error);
      next(error);
    }
}

async function fileUpload(req,res){
  console.log(req.file);
  const user = {
    fileName: req.file.filename,
    id: req.user.id,
    folderId: req.user.folderId || null,
  }
  db.fileUpload(user);
  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);
  res.render("upload",{
    folders:folders,
    files:files,
  });
}

async function folderCreation(req,res){
  const folderName = req.body.folderName;
  const folder = {
    folderName : folderName,
    id : req.user.id,
  }
  const user = {
    id: req.user.id,
    olderId: req.user.folderId,
  }
  const found = await db.findFolder(folder);

  if(found){
    console.log("A folder with this name and user is already made");
  }

  else{
    await db.folderCreate(folder);
    console.log("New Folder created");
  }

  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);
  res.render("upload",{
    folders:folders,
    files:files,
  });
}

module.exports ={
    userRegistration,
    fileUpload,
    folderCreation,
    logIn,
}