const { getDb } = require('../config/db');

exports.addTrip = async (req, res) => {
  const db = getDb();
  const { date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense,status } = req.body;

  try {
    await db.run(`
      INSERT INTO trips (date, source, destination, vendor_name, driver_id, vehicle_id, amount, advance, expense,status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
    `, [date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense,status]);

    res.status(200).send("Trip Added Successfully");
  } catch (err) {
    res.status(500).send("Failed to add trip");
  }
};

exports.getTrips = async (req, res) => {
  const db = getDb();

  try {
    const rows = await db.all(`
      SELECT trips.*, drivers.name AS driver_name, vehicles.vehicle_number
      FROM trips
      LEFT JOIN drivers ON trips.driver_id = drivers.id
      LEFT JOIN vehicles ON trips.vehicle_id = vehicles.id
    `);

    const trips = rows.map(t => ({
      id: t.id,
      date: t.date,
      source: t.source,
      destination: t.destination,
      vendorName: t.vendor_name,
      driverId: t.driver_id,
      driverName: t.driver_name,
      vehicleId: t.vehicle_id,
      vehicleNumber: t.vehicle_number,
      paymentStatus: t.status,
      amount: t.amount,
      advance: t.advance,
      expense: t.expense,
      profit: t.amount - t.advance - t.expense
    }));

    res.status(200).send(trips);
  } catch (err) {
    res.status(500).send("Failed to fetch trips");
  }
};

exports.updateTrip = async (req, res) => {
  const db = getDb();
  const { tripId } = req.params;
  const { date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense ,status} = req.body;

  try {
    await db.run(`
      UPDATE trips SET date=?, source=?, destination=?, vendor_name=?, driver_id=?, vehicle_id=?, amount=?, advance=?, expense=?,status = ?
      WHERE id=?
    `, [date, source, destination, vendorName, driverId, vehicleId, amount, advance, expense, tripId,status]);

    res.status(200).send(`Trip ${tripId} Updated Successfully`);
  } catch (err) {
    res.status(500).send("Failed to update trip");
  }
};

exports.deleteTrip = async (req, res) => {
  const db = getDb();
  const { tripId } = req.params;

  try {
    await db.run(`DELETE FROM trips WHERE id=?`, [tripId]);
    res.status(200).send(`Trip ${tripId} Deleted Successfully`);
  } catch (err) {
    res.status(500).send("Failed to delete trip");
  }
};
