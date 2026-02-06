const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

async function openDb() {
  db = await open({
    filename: path.join(__dirname, '../../database/fleetpro.db'),
    driver: sqlite3.Database
  });
}

function getDb() {
  return db;
}

module.exports = { openDb, getDb };
