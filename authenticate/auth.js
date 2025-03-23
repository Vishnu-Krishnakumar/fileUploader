const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient()
const LocalStrategy = require('passport-local');
const passport = require("passport");
const bcrypt  = require("bcryptjs");
require("dotenv").config();

passport.use(new LocalStrategy(async (username, password, done) => {
      try {
        const user = await prisma.users.findUnique({
            where:{
                email: {username},
            }
        })
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch(err) {
        return done(err);
      }

}))


const serial = (user, done) => {
    done(null, user.id);
};
  
const  deserial = async (id, done) => {
  try {
    const  user  = await prisma.users.findUnique({
      where:{
        id:{id},
      }
    })
  
      done(null, user);
    } catch(err) {
      done(err);
    }
  };

module.exports ={
  passport,
  serial,
  deserial
}