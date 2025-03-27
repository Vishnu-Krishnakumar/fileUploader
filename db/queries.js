const { PrismaClient, Prisma }  = require('@prisma/client');
const passport = require("passport");
const prisma = new PrismaClient()
const LocalStrategy = require('passport-local').Strategy;
const bcrypt  = require("bcryptjs");
require("dotenv").config();


async function createUser(user){
  await prisma.users.create({
    data:{
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      password: user.hashedPassword
    }
  })  
}

async function fileUpload(user){
  await prisma.files.create({
    data:{
      file_name: user.fileName,
      user_id: user.id,
      folder_id: user.folderId || null,
    }
  })
}

async function folderCreate(folder){
  await prisma.folders.create({
    data:{
      folder_name: folder.folderName,
      user_id: folder.id, 
    }
  })
}
async function findFolder(folder){
  const folderFind = await prisma.folders.findFirst({
    where:{
      folder_name: folder.folderName,
      user_id: folder.id,
    }
  })
  return folderFind;
}

async function getFiles(user){
  const files = await prisma.files.findMany({
    where:{
      user_id: user.id,
    }
  })
  return files;
}

async function getFolders(user){
  const folders = await prisma.folders.findMany({
    where:{
      user_id:user.id,
    },
    include:{
      files:true,
    }
  })
  return folders;
}
module.exports = {
    createUser,
    fileUpload,
    folderCreate,
    getFolders,
    findFolder,
    getFiles,
}

