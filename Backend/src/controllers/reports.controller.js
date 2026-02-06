const { getDb } = require('../config/db');

exports.getSummary = async (req, res) => {
  const db = getDb();

  try {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;

    const result = await db.get(`
      SELECT 
        COUNT(*) AS total_trips,
        SUM(amount) AS total_revenue,
        SUM(amount - advance - expense) AS total_profit
      FROM trips
      WHERE strftime('%Y-%m', date) = ?
    `, [yearMonth]);

    res.status(200).send({
      month: yearMonth,
      totalTrips: result.total_trips || 0,
      totalRevenue: result.total_revenue || 0,
      totalProfit: result.total_profit || 0
    });

  } catch (err) {
    res.status(500).send("Failed to load summary");
  }
};

exports.getMonthly = async (req, res) => {
  const db = getDb();

  try {
    const rows = await db.all(`
      SELECT 
        strftime('%Y', date) AS year,
        strftime('%m', date) AS month,
        SUM(amount) AS total_revenue,
        SUM(expense) AS total_expense,
        SUM(amount - advance - expense) AS total_profit
      FROM trips
      GROUP BY year, month
      ORDER BY year DESC, month DESC
    `);

    res.status(200).send(rows);
  } catch (err) {
    res.status(500).send("Failed to load monthly report");
  }
};

exports.getYearly = async (req, res) => {
  const db = getDb();

  try {
    const rows = await db.all(`
      SELECT 
        strftime('%Y', date) AS year,
        SUM(amount) AS total_revenue,
        SUM(expense) AS total_expense,
        SUM(amount - advance - expense) AS total_profit
      FROM trips
      GROUP BY year
      ORDER BY year DESC
    `);

    res.status(200).send(rows);
  } catch (err) {
    res.status(500).send("Failed to load yearly report");
  }
};
