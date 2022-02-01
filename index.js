const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
// const db = require("./config/config").get(process.env.NODE_ENV);
const User = require("./models/user");
const {auth} = require("./middleware/auth");
const user = require("./models/user");

const app = express();
const server = http.createServer(app);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cookieparser());

//environment variables
require("dotenv").config();

//Database connection:

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;
connection.once("open", () => {
console.log("Connected Database Successfully");
});
// mongoose.Promise = global.Promise;

app.get("/", function(res,req){
    res.status(200).send("Welcome to Login Page, Login API")
});

// adding new user:
app.post("/api/register", function(req,res) {

    //Creating New User
    const newuser= new User(req.body);
   
  if(newuser.password!=newuser.password2)return res.status(400).json({message: "password not match"});
   
   User.findOne({email:newuser.email},function(err,user){
       if(user) return res.status(400).json({ auth : false, message :"email exists"});

       newuser.save((err,doc)=>{
           if(err) {console.log(err);
               return res.status(400).json({ success : false});}
           res.status(200).json({
               success: true,
               token: req.user.token,
               user: doc
          
            })
        })
     })
})

//Login User:
app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message: "You are already logged in",
            token: user.token
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({
                    isAuth : false, 
                    message : 'Auth failed, email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ 
                        isAuth : false,
                        message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        // id : user._id,
                        email : user.email,
                        token: user.token
                    });
                });    
            });
          });
        }
    });
});

//get Loggedin User:
app.get("/api/profile",auth,function(req,res) {
    res.json({
        isAuth: true,
        // id: req.user._id,
        email: req.user.email,
        name: req.user.firstName + " " + req.user.lastName,
        token : req.user.token  
    })
});
// logout user:
app.get("/api/logout",auth,function(req,res) {
    req.user.deleteToken(res.token, (err, user)=> {
        if (err) return res.status(400).send(err);
        res.status(200).json({
            Message: "Logout Successfully",
            token: req.user.token });
    })
})

//Listning on port:
const PORT=process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log("App is live at:", PORT);
});
