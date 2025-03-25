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
      folder_id: 0,
    }
  })
}

module.exports = {
    createUser,
    fileUpload,
}