const express = require('express');
const bodyParser = require('body-parser');
const sanitizeHtml = require('sanitize-html');
const User = require("./model/user");
const auth = require("./middleware/auth");
const bcrypt = require('bcrypt');
require("dotenv").config();
require("./config/database").connect();


const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}))

// static folder
app.use(express.static("public"));

// input sanitizer
function sanitizeInput(input) {
    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {}
    });
}


app.get("/", async (req, res) =>{
    res.sendFile(__dirname + "/index.html");
});

// register
// get
app.get("/register", async (req, res)=>{
    res.sendFile(__dirname + "/public/register.html")
});
// post
app.post("/register", async (req, res) => {
    try {
        // inputs
        const { first_name, last_name, email, password } = req.body;

        // sanitize user inputs
        const fname_ = sanitizeHtml(first_name);
        const lname_ = sanitizeHtml(last_name);
        const email_ = sanitizeHtml(email);
        const passw_ = sanitizeHtml(password);

        // check if user already exist
        const isUserExist = await User.findOne({ email });

        if (isUserExist) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        // Encrypt password with bcrypt.js / bcrypt
        encryptedPassword = await bcrypt.hash(passw_, 10);

        // Create user in our database
        const user = await User.create({
            fname_: fname_,
            lname_: lname_,
            email_: email_.toLowerCase(),
            passw_: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email_ },
            process.env.JWT_KEY,
            {
                expiresIn: "1h",
            }
        );
        // save user token
        user.token = token;
        // return new user
        res.status(201).redirect("/login");
    } catch (err) {
        console.log(err);
    }
});


// login
// get login
app.get("/login", async (req, res)=>{
    res.sendFile(__dirname + "/public/login.html")
});
app.post("/login", async (req, res) => {
    try {
        //get user input
        const { email, password } = req.body;
        // check if user exist
        const user = await User.findOne({ email });
        if(user){
            if(await bcrypt.compare(password, user.password)){
                // Create token
                const token = jwt.sign(
                    { user_id: user._id, email },
                    process.env.JWT_KEY,
                    {
                    expiresIn: "1h",
                    }
                );
                // save token
                user.token = token;
            
                // user
                res.status(200).redirect("/home");
                }
            }
            else{
                res.send("Login failed");
            }
    } catch (err) {
        console.log(err);
    }
});
app.post("/home", async (req, res) => {
    res.sendFile(__dirname + "public/home.html")
});


let port = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}

//listener
app.listen(port, function(){
    console.log(`Server has started successfully on port "${port}".`);
});
