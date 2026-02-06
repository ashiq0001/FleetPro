const { getDb } = require('../config/db');

exports.addDriver = async (req, res) => {
  const db = getDb();
  const { name, licenseNumber, mobile } = req.body;

  try {
    await db.run(
      `INSERT INTO drivers (name, license_number, mobile) VALUES (?, ?, ?)`,
      [name, licenseNumber, mobile]
    );
    res.status(200).send(`${name} Added Successfully`);
  } catch (err) {
    res.status(500).send("Failed to add driver");
  }
};

exports.getDrivers = async (req, res) => {
  const db = getDb();

  try {
    const rows = await db.all(`
      SELECT drivers.*, vehicles.vehicle_number
      FROM drivers
      LEFT JOIN vehicles ON drivers.id = vehicles.driver_id
    `);

    const drivers = rows.map(d => ({
      id: d.id,
      name: d.name,
      licenseNumber: d.license_number,
      mobile: d.mobile,
      vehicleNumber: d.vehicle_number
    }));

    res.status(200).send(drivers);
  } catch (err) {
    res.status(500).send("Failed to fetch drivers");
  }
};

exports.updateDriver = async (req, res) => {
  const db = getDb();
  const { driverId } = req.params;
  const { name, licenseNumber, mobile } = req.body;

  try {
    await db.run(`
      UPDATE drivers SET name=?, license_number=?, mobile=? WHERE id=?
    `, [name, licenseNumber, mobile, driverId]);

    res.status(200).send(`${name} Updated Successfully`);
  } catch (err) {
    res.status(500).send("Failed to update driver");
  }
};

exports.deleteDriver = async (req, res) => {
  const db = getDb();
  const { driverId } = req.params;

  try {
    await db.run(`DELETE FROM drivers WHERE id=?`, [driverId]);
    res.status(200).send(`Driver ${driverId} Deleted Successfully`);
  } catch (err) {
    res.status(500).send("Failed to delete driver");
  }
};
