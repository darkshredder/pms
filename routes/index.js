//Required
const express = require('express');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user')
const router = express.Router();

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

//Middlewares
function checkLogin(req,res,next){
  try {
    var userToken = localStorage.getItem('userToken')
    var decoded = jwt.verify(userToken, "loginToken");
    
  } catch (err) {
    // err
    res.redirect('/')
  }
  next();
}



function checkEmail(req,res,next){
  var email=req.body.email
  userModel.findOne({email:email}).then((data)=>{
    if(data){
      return res.render("signup", { title: "Signup", msg: "Email Already exists" });
    }
    next();
  })
}
function checkUsername(req, res, next) {
  var uname = req.body.uname;
  userModel.findOne({ username:uname }).then((data) => {
    if (data) {
      return res.render("signup", {
        title: "Signup",
        msg: "Username Already exists",
      });
    }
    next();
  });
}



/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Login' });
});

router.post("/", function (req, res, next) {

  var uname=req.body.uname
  var password=req.body.password
  userModel.findOne({username:uname}).then((data)=>{
    if(data){
      var getUserId=data._id
      var getPass=data.password
      if(bcryptjs.compareSync(password,getPass)){
        var token = jwt.sign({ userId: getUserId }, "loginToken");
        localStorage.setItem("userToken", token);
        localStorage.setItem("loginUser", uname);
        res.redirect('/dashboard')
      }else{
        res.render("index", { title: "Login", msg: "Wrong Password Entered" });
      }
    }
  })

});

//logout
router.get("/logout", function (req, res, next) {
  localStorage.removeItem("loginUser");
  localStorage.removeItem("userToken");
  res.redirect('/')

  
});

//Dashboard
router.get("/dashboard",checkLogin, function (req, res, next) {
  var loginUser = localStorage.getItem('loginUser')
  res.render("dashboard", { title: "Dashboard",loginUser:loginUser, msg: "" });
});

//Signup
router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Signup" , msg:'' });
});
router.post("/signup", checkUsername,checkEmail, function (req, res, next) {
  var data = {
    username: req.body.uname,
    email: req.body.email,
    password: bcryptjs.hashSync(req.body.password, 10),
  };
  if(req.body.password!=req.body.confpassword){
    res.render("signup", { title: "Signup", msg: "Passwords Does not match" });
  }
  else{

  var userDetails = new userModel(data);
  userDetails
    .save()
    .then(() => {
      res.render("signup", { title: "Signup", msg: "Succesfully SignedUp" });
    })
    .catch((err) => {
      console.log(err);
    });
}});


router.post("/signup", function (req, res, next) {
  res.render("signup", { title: "Signup" });
});




router.get("/passwordCategory", function (req, res, next) {
  res.render("passwordCategory", { title: "Aignup" });
});

module.exports = router;
