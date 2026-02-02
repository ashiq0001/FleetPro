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
app.post('/vehicles',isAuthenticated ,async(request,response) => {
    const{vehicleNumber,status,driverId} = request.body 
    const addvehicleQuery = `
    INSERT INTO vehicles
    (vehicle_number,status,driver_id)
    VALUES(
    ?,?,?)`
    try{
    const addVehicle = await db.run(addvehicleQuery,[vehicleNumber,status,driverId])
    response.status(200).send(`Vehicle Added Successfully ${addVehicle.lastID}`)    
} 
catch(e){
    response.status(500).send(`error: ${e.message}`)
}
})

app.put('/vehicles/:vehicleId/',isAuthenticated, async(request,response) => {
    const {vehicleId} = request.params
    const vehicleDetails = request.body
    const{
        vehicleNumber,
        status,
        driverId
    } = vehicleDetails

    const updateVehicleQuery = 
    `UPDATE vehicles
    SET
    vehicle_number = ?,
    status = ?,
    driver_id = ?
    WHERE 
    id = ?`
    
    try{
    const updateVehicle = await db.run(updateVehicleQuery,[vehicleNumber,status,driverId,vehicleId])
    response.status(200).send(`Vehicle ${vehicleId} Updated Successfully !`)    
   }
   catch(e){
    response.status(500).send(`error:${e.message}`)
   }
})

app.delete('/vehicles/:vehicleId/',isAuthenticated,async(request,response) => {
    const{vehicleId} = request.params

    const deleteVehicleQuery = `
    DELETE FROM 
    vehicles
    WHERE
    id = ?`

    try{
        const deleteVehicle = await db.run(deleteVehicleQuery,[vehicleId])
        response.status(200).send(`Vehicle ${vehicleId} Deleted Successfully`)
    }
    catch(e){
        response.status(500).send(`error:${e.message}`)
    }
})

app.get('/vehicles',isAuthenticated, async(request,response) => {
    
    const getVehiclesQuery = `
    SELECT * FROM
    vehicles JOIN drivers
    ON vehicles.driver_id = drivers.id`

     const toCamelCaseVehicle = (obj) => ({
  id: obj.id,
  vehicleNumber: obj.vehicle_number,
  status: obj.status,
  driverId: obj.driver_id,
  name: obj.name,
  licenseNumber: obj.license_number,
  mobile: obj.mobile,
});


  try {
    const getVehicles = await db.all(getVehiclesQuery);
    const vehicles = getVehicles.map(toCamelCaseVehicle);
    response.status(200).send(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    response.status(500).send({ error: "Failed to fetch vehicles" });
  }

})

app.get('/vehicles/:vehicleId/',isAuthenticated,async(request,response) => {
    const{vehicleId} = request.params

    const getVehicleById = `
     SELECT * FROM
    vehicles JOIN drivers
    ON vehicles.driver_id = drivers.id
    WHERE vehicles.id = ?`
    
     const toCamelCaseVehicle = (obj) => ({
  id: obj.id,
  vehicleNumber: obj.vehicle_number,
  status: obj.status,
  driverId: obj.driver_id,
  name: obj.name,
  licenseNumber: obj.license_number,
  mobile: obj.mobile,
});

    try{
        const getVehicleDetails = await db.get(getVehicleById,[vehicleId])
        const vehicle = toCamelCaseVehicle(getVehicleDetails)
        response.status(200).send(vehicle) 
    }
    catch(e){
        response.status(500).send(`error:${e.message}`)
    }
})

//drivers api 

app.get('/drivers',isAuthenticated,async(request,response) => {
    const getDriversQuery = `
    SELECT *
FROM drivers
LEFT JOIN vehicles ON drivers.id = vehicles.driver_id`
     
    const toCamelCaseDriver = (obj) => ({
  id: obj.id,
  vehicleNumber: obj.vehicle_number,
  status: obj.status,
  driverId: obj.driver_id,
  name: obj.name,
  licenseNumber: obj.license_number,
  mobile: obj.mobile,
});
    
  try{
    const getDrivers = await db.all(getDriversQuery)
    const drivers = getDrivers.map(toCamelCaseDriver) 
    response.status(200).send(drivers) 
}
catch(error){
    console.error('Error Fetching Drivers :' , error)
    response.status(500).send({error:'failed to fetch drivers'})
}
})

app.post('/drivers',isAuthenticated,async(request,response) => {
    const {name,licenseNumber,mobile} = request.body 
    const addDriverQuery = `
    INSERT INTO drivers 
    (name,license_number,mobile)
    VALUES
    (?,?,?)`

    try{
        const addDriver = await db.run(addDriverQuery,[name,licenseNumber,mobile])
        response.status(200).send(`${name} Is Added Successfully`)
    }
    catch(error){
        console.error('Error Adding Driver',error)
        response.status(500).send({error:'failed to Add driver'})
    }
})

app.put('/drivers/:driverId',isAuthenticated,async(request,response) =>{
    const {driverId} = request.params
    const{name,licenseNumber,mobile} = request.body

    const updateDriverQuery = `
    UPDATE drivers
    SET
    name = ?,
    license_number = ?,
    mobile = ?
    WHERE 
    drivers.id = ?`

    try{
        const updateDriver = await db.run(updateDriverQuery,[name,licenseNumber,mobile,driverId])
        response.status(200).send(`${name} Updated Successfully`)
    }
    catch(error){
        console.error('Failed to Update Driver',error)
        response.status(500).send({error:'Failed to Update Driver'})
    }
})

app.delete('/drivers/:driverId',isAuthenticated,async(request,response) => {
    const {driverId} = request.params 
    const deleteDriverQuery = `
    DELETE FROM
    drivers 
    WHERE 
    drivers.id = ?`
    
    try{
        const deleteDriver = await db.run(deleteDriverQuery,[driverId])
        response.status(200).send(`driver ${driverId} deleted Successfully`)
    }
    catch(error){
        console.log('cannot delete driver',error)
        response.status(500).send({error:'Cannot Delete Driver'})
    }
})

//trips api 
app.post('/trips', isAuthenticated, async (req, res) => {
  const { date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense } = req.body;

  const postTripQuery = `
    INSERT INTO trips (date, source, destination, vendor_name, driver_id, vehicle_id, amount, advance, expense)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    const result = await db.run(postTripQuery, [
      date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense
    ]);
    res.status(200).send(`Trip Added Successfully with ID ${result.lastID}`);
  } catch (error) {
    console.error('Cannot add Trip', error);
    res.status(500).send({ error: 'Cannot Add Trip' });
  }
});

app.get('/trips', isAuthenticated, async (req, res) => {
  const getTripsQuery = ` SELECT 
      trips.id,
      trips.date,
      trips.source,
      trips.destination,
      trips.vendor_name,
      trips.amount,
      trips.advance,
      trips.expense,
      drivers.id AS driver_id,
      drivers.name AS driver_name,
      vehicles.id AS vehicle_id,
      vehicles.vehicle_number AS vehicle_number
    FROM trips
    LEFT JOIN drivers ON trips.driver_id = drivers.id
    LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id`;

  const toCamelCaseTrip = (obj) => ({
    id: obj.id,
    date: obj.date,
    source: obj.source,
    destination: obj.destination,
    vendorName: obj.vendor_name,
    driverId : obj.driver_id,
    driverName: obj.driver_name,
    vehicleId : obj.vehicle_id,
    vehicleNumber: obj.vehicle_number,
    amount: obj.amount,
    advance: obj.advance,
    expense: obj.expense,
    profit: obj.amount - obj.advance - obj.expense
  });

  try {
    const getTrips = await db.all(getTripsQuery);
    const trips = getTrips.map(toCamelCaseTrip);
    res.status(200).send(trips);
  } catch (error) {
    console.error('Loading Trips Failed', error);
    res.status(500).send({ error: 'Loading Trips Failed' });
  }
});

app.put('/trips/:tripId', isAuthenticated, async (req, res) => {
  const { tripId } = req.params;
  const { date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense } = req.body;

  const updateTripQuery = `
    UPDATE trips
    SET date = ?, source = ?, destination = ?, vendor_name = ?,
        driver_id = ?, vehicle_id = ?, amount = ?, advance = ?, expense = ?
    WHERE id = ?`;

  try {
    await db.run(updateTripQuery, [
      date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense, tripId
    ]);
    res.status(200).send(`Trip ${tripId} updated successfully`);
  } catch (error) {
    console.log(`Cannot Update Trip ${tripId}`, error);
    res.status(500).send({ error: `Cannot Update Trip ${tripId}` });
  }
});

app.delete('/trips/:tripId', isAuthenticated, async (req, res) => {
  const { tripId } = req.params;
  const deleteTripQuery = `DELETE FROM trips WHERE id = ?`;

  try {
    await db.run(deleteTripQuery, [tripId]);
    res.status(200).send(`Trip ${tripId} deleted Successfully`);
  } catch (error) {
    console.error(`Cannot Delete Trip ${tripId}`, error);
    res.status(500).send({ error: `Cannot Delete Trip ${tripId}` });
  }
});

