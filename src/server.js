const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const sanitizeHtml = require('sanitize-html');
const User = require("./model/user");

const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({extended: true}))

// static folder
app.use(express.static("public"));

app.get("/", async (req, res) =>{
    res.sendFile(__dirname + "/index.html");
});


// register
app.post("/register", async (req, res) => {
    try {
        // inputs
        const { first_name, last_name, email, password } = req.body;

        // check if user already exist
        const isUserExist = await User.findOne({ email });

        if (isUserExist) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        // Encrypt password with bcrypt.js / bcrypt
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;
        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});


// login
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
                    process.env.TOKEN_KEY,
                    {
                    expiresIn: "1h",
                    }
                );
                // save token
                user.token = token;
            
                // user
                res.status(200).send("Hello " + user.first_name);
                }
            }
            else{
                res.send("Login failed");
            }
    } catch (err) {
        console.log(err);
    }
});


let port = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}

//listener
app.listen(port, function(){
    console.log("Server has started successfully.");
});
