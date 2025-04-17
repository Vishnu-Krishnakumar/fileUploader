require("dotenv").config();
const {Router} = require("express");
const dbRouters = Router();
const validation = require("../validate/validation");
const { body, validationResult } = require("express-validator");
const auth = require("../authenticate/auth");
const bcrypt  = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const {NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY} = process.env;
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY);
const db = require("../db/queries");
const path = require('path');
const {v4: uuidv4} = require('uuid');
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
  let fileName = req.file.originalname;
  console.log(fileName);
  const {data : fileSearch, error:searchError} = await  supabase.storage.from("all-files").list("",{
    limit:100,
    offset:0,
    sortBy: { column: 'name', order: 'asc' },
    search: fileName[0],
  })
  if(searchError){
    console.log(searchError)
  }
  if(fileSearch === null || fileSearch.length != 0 ){
   fileName = req.file.originalname.split(".");
   fileName = fileName[0] + "-" + (fileSearch.length + 1) + "." + fileName[1];
  }

  let {data,error} = await supabase.storage.from('all-files').upload(fileName,req.file.buffer,{contentType: req.file.mimetype,});
  if(error){
    console.log(error);
  }else {
    console.log("file uploaded sucessfully");
  }

  const {data:urlText, error:urlError} = await supabase.storage.from('all-files').createSignedUrl(data.path,60*60*24,{ download: true });

  if(urlError){
    console.log(urlError)
  }else{
    console.log("File url retrieved properly!");
    console.log(urlText);
    const user = {
      fileName: fileName,
      id: req.user.id,
      folderId: req.user.folderId || null,
      size: req.file.size,
      url : urlText.signedUrl,
    };
    
    await db.fileUpload(user);

    const folders = await db.getFolders(user);
    const files = await db.getFiles(user);

    res.render("upload",{
      folders:folders,
      files:files,
      fileFound : null,
      folderName: null,
    });
    res.end();
  }
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

async function sendToThisFolder(req,res){
  const file = {
    fileName: req.file.filename,
    id: req.user.id,
    folderId: req.user.folderId || null,
    size: req.file.size,
    url : null,
  }


  const upload = await db.fileUpload(file);
  
  const id = {
    file: upload.id,
    folder: req.body.folders,
    user: req.user.id,
  }

  await db.addToFolder(id);
  const folder = await db.findFolderName(id)
  const files = await db.getFolderFiles(id);

  res.render("folder",{
    files:files,
    folder:folder,
  })
}

async function removeFileFromFolder(req,res){

  const id = {
    file: req.body.file_id,
    folder: req.body.folder_id,
    user: req.user.id,
  }

  await db.deleteFromFolder(id);
  await logIn(req,res)

}

async function deleteInFolder(req,res){

  const id = {
    file: req.body.file_id,
    folder: req.body.folder_id,
    user: req.user.id,
  }

  await db.deleteFromFolder(id);
  
  const folder = await db.findFolderName(id)
  const files = await db.getFolderFiles(id);
  
  res.render("folder",{
    files:files,
    folder:folder,
  })  
}

async function deleteFile(req,res){
  console.log(req.body);
  console.log(req.body.file_name)
  const { data , error } = await supabase.storage.from("all-files").remove([req.body.file_name]);
  if(error){console.log(error)}
  else{console.log(data)};
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
    folder: file.folder_id,
    user: file.user_id,
  }

  console.log(folderSearch);

  const folders = await db.getFolders(user);
  const files = await db.getFiles(user);
  const foundFolder = await db.findFolderName(folderSearch);

  await res.render("upload",{
    folders:folders,
    files:files,
    fileFound : file || null,
    folderName: foundFolder ? foundFolder.folder_name : null,
  })
}

async function viewFolder (req,res){
  console.log(req.query); 
  const id = {
    file: req.query.file_id,
    folder: req.query.folder_id,
    user: req.user.id,
  }
  const folder = await db.findFolderName(id)
  const files = await db.getFolderFiles(id);
  console.log(folder);
  console.log(files);
  res.render("folder",{
    folder:folder,
    files: files,
  })
}

async function downloadFile(req,res){
  const search = {
    user: req.user.id,
    file: req.query.file_id,
  }
  const validate = await db.viewFile(search)
  if(validate){
    let fileName = validate.file_name;
    const { data, error } = await supabase
     .storage
     .from('all-files')
     .download(fileName)
     if(error){
      console.log(error)
     }else{

      const arrayBuffer = await data.arrayBuffer(); 
      const buffer = Buffer.from(arrayBuffer);     
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', data.type || 'application/octet-stream');
      res.send(buffer);
     }
  }  
  
}

module.exports ={
    userRegistration,
    fileUpload,
    folderCreation,
    logIn,
    sendToFolder,
    deleteFile,
    removeFileFromFolder,
    viewFile,
    viewFolder,
    sendToThisFolder,
    deleteInFolder,
    downloadFile,
}