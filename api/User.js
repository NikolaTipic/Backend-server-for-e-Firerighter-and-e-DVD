const express = require("express");
const router = express.Router();

//mongodb user model
const User = require("./../models/User");

//Password handler
const bcryptjs = require("bcryptjs");

//signup
router.post("/signup", (req, res) => {
    let {name, email, password, dateOfBirth} = req.body;
    name = name.trim();
    email= email.trim();
    password = password.trim();
    dateOfBirth = dateOfBirth.trim();
    
    

    if(name == "" || email == "" || password == "" || dateOfBirth == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if(!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    } else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })
    } else if(!new Date(dateOfBirth).getTime()) {
        res.json({
            status: "FAILED",
            message: "Invalid date of birth entered"
        })
    } else if(password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is to short"
        })
    } else {
        //checking if user already exist
        User.find({email}).then(result =>{
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                })
            } else {
                //Try to create new User

                //password handeling
                const saltRounds = 10;
                bcryptjs.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        password: hashedPassword,
                        dateOfBirth,
                        availability: false
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result,
                        })
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while saving user account"
                        })
                    })

                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing password!"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for an existing user!"
            })
        })
    }
});


//SignupWithGoogle
router.post("/googleSignup", (req, res) => {
    let {name, email} = req.body;
    name = name.trim();
    email = email.trim();
    
    //checking if user already exist
    User.findOne({email})
        .then((data) => {
            if (null !== data) {
                res.json({
                    status: "SUCCESS",
                    message: "Singin successful",
                    data: data
                })
        } else {
            const newUser = new User({
                name,
                email,
                password,
                dateOfBirth,
                availability: false
            });

            newUser.save().then(result => {
                res.json({
                    status: "SUCCESS",
                    message: "Signup successful",
                    data: result,
                })
            })
            .catch(err => {
                res.json({
                    status: "FAILED",
                    message: "An error occurred while saving Goole user account"
                })
            })

        }


    });
});



//Signin
router.post("/signin", (req, res) => {
    let { email, password } = req.body;
    email= email.trim();
    password = password.trim();

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied"
        })
    } else {
        //check if user exist
        
        User.findOne({email})
        .then((data) => {
            if (null !== data) {
                //User exist

                const hashedPassword = data.password;
                bcryptjs.compare(password, hashedPassword).then(result => {
                    if (result) {
                        //password match
                        res.json({
                            status: "SUCCESS",
                            message: "Singin successful",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Invalid password enterd"
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while comparing passwords"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Email you enterd doesen't exist"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user"
            })
        })
    }

});


//Availability
router.post("/availability", (req, res) => {
    let { email, availability } = req.body;
    email= email.trim();

    if (email == "") {
        res.json({
            status: "FAILED",
            message: "Empty email supplied"
        })
    } else {
        //check if user exist
        
        User.findOneAndUpdate({email: email}, {availability: !availability}, {new: true}, (error, data) => {
            if(error) {
                console.log(error);
            } else {
                res.json({
                    status: "SUCCESS",
                    message: "Update successful",
                    data: data
                });
            }

        });
    }
});


//List
router.post("/list", (req, res) => {
    let { list } = req.body;

        
    User.find({availability: "true"}).then(result =>{
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: "Available users retrived",
                data: [result]
            })
        } else {
            res.json({
                status: "FAILED",
                message: "No users available"
            })
        }
            
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occurred while retriving list of availble users"
        })
    })
});

module.exports = router;