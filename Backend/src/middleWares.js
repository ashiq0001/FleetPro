const jwt = require('jsonwebtoken')

const isAuthenticated = (req,res,next) => {
    const authHeaders = req.headers["authorization"]
    let jwtToken;
    if(authHeaders !== undefined){
        jwtToken = authHeaders.split(" ")[1]
    }
    if(jwtToken === undefined){
        res.status(401).send('Please Login To Continue !')
    }
    else{
        jwt.verify(jwtToken,"SECRET_KEY",(error,payload) => {
            if(error){
                res.status(401).send('Invalid Accsess Token')
            }
            else{
                next()
            }
        })
        }
    }
