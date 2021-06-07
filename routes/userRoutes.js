require('dotenv').config();

const { json } = require("body-parser");
const express = require("express");
const mysqlConnection = require("../connection");
const jwt = require("jsonwebtoken");

const Router = express.Router();

Router.get("/", (req, res) =>{
    mysqlConnection.query("SELECT * from users", (err, rows, fields)=>{
        if(!err) {
            res.send(rows);
        } else {
            console.log(err);
        }
    })
})

Router.get("/user", authenticateToken, (req, res) => {
    res.json()
})

Router.post("/register", (req, res) => {
    let user = [req.body.username, req.body.password, req.body.email];

    mysqlConnection.query("SELECT * FROM users WHERE username = ?", [req.body.username], function(err, result, field){
        if(result.length > 0) {
            res.json({token: null,
               info : "User already exists." 
            })
        } else {
            let userJson = {
                username: user.username,
                password: user.password
            }
            const accessToken = generateToken(userJson);
        
            mysqlConnection.query("INSERT INTO users(username, password, email) VALUES(?, ?, ?)", user, (err, results, fields) => {
                !err ? res.json({token : accessToken, info: "Successfuly registered!"}) : res.json({token: null, info: err});
            }) 
        }
    })

})

Router.post("/login", (req, res) => {
    let user = [req.body.username, req.body.password];

    mysqlConnection.query("SELECT password FROM users WHERE username = ?", [req.body.username], function(err, result, field){
        if(result == null) {
            res.json({token: null,
               errorMessage : "Invalid username or password." 
            })
        } else {

            if(result[0].password == req.body.password) {
                let userJson = {
                    username: user.username,
                    password: user.password
                }
                const accessToken = generateToken(userJson);
                res.json({accessToken: accessToken, message: "Successfuly logged in."})
            } else {
                const accessToken = null;
                res.json({accessToken: accessToken, message: "Wrong password"})
            }
        }
    })

})


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(401);
        req.user = user
        next()
    })
}


function generateToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn : '15m'})
}

module.exports = Router; 