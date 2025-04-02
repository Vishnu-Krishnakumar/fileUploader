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
  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);

  res.render("upload",{
    folders:folders,
    files:files,
    fileFound : null,
    folderName: null,
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

  const user = {
    fileName: req.file.filename,
    id: req.user.id,
    folderId: req.user.folderId || null,
    size: req.file.size,
    url : null,
  }
  await db.fileUpload(user);
  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);

  res.render("upload",{
    folders:folders,
    files:files,
    fileFound : null,
    folderName: null,
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
    fileFound : null,
    folderName: null,
  });
}

async function sendToFolder(req,res){

  const id = {
    file: req.body.file_id,
    folder: req.body.folders,
    user: req.user.id,
  }

  await db.addToFolder(id);
  await logIn(req,res)
}

async function deleteFileFromFolder(req,res){
  const id = {
    file: req.body.file_id,
    folder: req.body.folder_id,
    user: req.user.id,
  }
  await db.deleteFromFolder(id);
  await logIn(req,res)
}

async function deleteFile(req,res){
  const id = {
    file: req.body.file_id,
    folder: req.body.folder_id,
    user: req.user.id,
  }
  await db.deleteFile(id);
  await logIn(req,res)
}

async function viewFile (req,res){
  const id = {
    file: req.query.file_id,
    folder: req.body.folder_id,
    user: req.user.id,
  }
  const user = {
    id: req.user.id,
  }
 
  const file = await db.viewFile(id);

  const folderSearch = {
    id: file.folder_id,
    user: file.user_id,
  }
  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);
  const foundFolder = await db.findFolderName(folderSearch);

  res.render("upload",{
    folders:folders,
    files:files,
    fileFound : file || null,
    folderName: foundFolder ? foundFolder.folder_name : null,
  })
}

module.exports ={
    userRegistration,
    fileUpload,
    folderCreation,
    logIn,
    sendToFolder,
    deleteFile,
    deleteFileFromFolder,
    viewFile,
}