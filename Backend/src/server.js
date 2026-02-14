const app = require('./app');
const { openDb } = require('./config/db');

const startServer = async () => {
  await openDb();
  app.listen(5000, () => console.log("Server running on port 3000"));
};

startServer();
