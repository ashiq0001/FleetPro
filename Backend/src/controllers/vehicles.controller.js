const { getDb } = require('../config/db');

exports.addVehicle = async (req, res) => {
  const db = getDb();
  const { vehicleNumber, status, driverId } = req.body;

  try {
    const result = await db.run(
      `INSERT INTO vehicles (vehicle_number, status, driver_id) VALUES (?, ?, ?)`,
      [vehicleNumber, status, driverId]
    );
    res.status(200).send(`Vehicle Added Successfully ${result.lastID}`);
  } catch (err) {
    res.status(500).send("Failed to add vehicle");
  }
};

exports.getVehicles = async (req, res) => {
  const db = getDb();

  try {
    const rows = await db.all(`
      SELECT vehicles.*, drivers.name, drivers.license_number, drivers.mobile
      FROM vehicles
      LEFT JOIN drivers ON vehicles.driver_id = drivers.id
    `);

    const vehicles = rows.map(v => ({
      id: v.id,
      vehicleNumber: v.vehicle_number,
      status: v.status,
      driverId: v.driver_id,
      name: v.name,
      licenseNumber: v.license_number,
      mobile: v.mobile
    }));

    res.status(200).send(vehicles);
  } catch (err) {
    res.status(500).send("Failed to fetch vehicles");
  }
};

exports.getVehicleById = async (req, res) => {
  const db = getDb();
  const { vehicleId } = req.params;

  try {
    const v = await db.get(`
      SELECT vehicles.*, drivers.name, drivers.license_number, drivers.mobile
      FROM vehicles
      LEFT JOIN drivers ON vehicles.driver_id = drivers.id
      WHERE vehicles.id = ?
    `, [vehicleId]);

    res.status(200).send({
      id: v.id,
      vehicleNumber: v.vehicle_number,
      status: v.status,
      driverId: v.driver_id,
      name: v.name,
      licenseNumber: v.license_number,
      mobile: v.mobile
    });

  } catch (err) {
    res.status(500).send("Failed to fetch vehicle");
  }
};

exports.updateVehicle = async (req, res) => {
  const db = getDb();
  const { vehicleId } = req.params;
  const { vehicleNumber, status, driverId } = req.body;

  try {
    await db.run(`
      UPDATE vehicles SET vehicle_number=?, status=?, driver_id=? WHERE id=?
    `, [vehicleNumber, status, driverId, vehicleId]);

    res.status(200).send(`Vehicle ${vehicleId} Updated Successfully`);
  } catch (err) {
    res.status(500).send("Failed to update vehicle");
  }
};

exports.deleteVehicle = async (req, res) => {
  const db = getDb();
  const { vehicleId } = req.params;

  try {
    await db.run(`DELETE FROM vehicles WHERE id=?`, [vehicleId]);
    res.status(200).send(`Vehicle ${vehicleId} Deleted Successfully`);
  } catch (err) {
    res.status(500).send("Failed to delete vehicle");
  }
};
