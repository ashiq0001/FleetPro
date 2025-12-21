const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {isAuthenticated} = require('./middleWares.js')

const connectionPath = path.join(__dirname,'../database/fleetpro.db')

const app = express()

app.use(express.json())

let db = null 

const initializeServerAndDB = async () => {
    try{
        db = await open({
            filename:connectionPath,
            driver:sqlite3.Database
        });
        app.listen(3000,()=>{
     console.log('Server Is Running ...')
       })
    }
    catch(e){
        console.log(`DB error: ${e.message}`)
    }
}


initializeServerAndDB()

//login api 
app.post('/login', async(request,response) => {
    const{username,password} = request.body 
    const searchUser = `SELECT * FROM user WHERE username = ?`;
    const dbUser = await db.get(searchUser, [username]);
    if(dbUser === undefined){
        response.status(400).send('Invalid Username !')
    }
    else{
        const isPasswordMatched = await bcrypt.compare(password,dbUser.password)
        if(isPasswordMatched){
           const payload = {
            username: username
           }
           const jwtToken = jwt.sign(payload,'SECRET_KEY')
           response.status(200).send({jwtToken})
        }
        else{
            response.status(400).send('Incorrect Password !')
        }
    }

})

//vehicle api 
app.post('/vehicles', isAuthenticated ,async(request,response) => {
    const{vehicleNumber,status} = request.body 
    const addvehicle
})