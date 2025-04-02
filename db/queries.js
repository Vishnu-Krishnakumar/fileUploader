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

async function findFolderName(folder){
  if(folder.id === null) return null;
  const folderFound = await prisma.folders.findFirst({
    where:{
      id: folder.id,
      user_id: folder.user,
    }
  })
  return folderFound;
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

async function addToFolder(id){
  const updateUser = await prisma.files.update({
    where:{
      id: parseInt(id.file),
      user_id: id.user,
    },
    data:{
      folder_id: parseInt(id.folder),
    },
  })
}
async function deleteFile(id){
  console.log(id);
  const deleteFile = await prisma.files.delete({
    where:{
      id:(parseInt(id.file)),
      user_id: id.user,
    },
  });

}

async function deleteFromFolder(id){
 
  let folder = await prisma.folders.findFirst({
    where:{
      id:(parseInt(id.folder)),
      user_id: id.user,
    },
    include:{
      files:true,
    }
  })
  let foundFiles = folder.files;
  let removedFiles = foundFiles.filter((file)=> file.id !== parseInt(id.file))
  let folderUpdate = await prisma.folders.update({
    where:{
      id:(parseInt(id.folder)),
      user_id: id.user,
    },
    data:{
      files:{
        set: removedFiles,
      }
    },
  })
  return folderUpdate;
}

async function viewFile(id){
  let file = await prisma.files.findFirst({
    where:{
      id:(parseInt(id.file)),
      user_id: id.user,
    }
  })
  return file;
}
module.exports = {
    createUser,
    fileUpload,
    folderCreate,
    getFolders,
    findFolder,
    getFiles,
    addToFolder,
    deleteFile,
    deleteFromFolder,
    viewFile,
    findFolderName,
}

