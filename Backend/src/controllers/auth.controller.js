const { getDb } = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const db = getDb();
  const { username, password } = req.body;

  try {
    const user = await db.get(`SELECT * FROM user WHERE username = ?`, [username]);

    if (!user) return res.status(400).send("Invalid Username!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Incorrect Password!");

    const token = jwt.sign({ username }, "SECRET_KEY");
    res.status(200).send({ jwtToken: token });

  } catch (err) {
    res.status(500).send("Login Failed");
  }
};
