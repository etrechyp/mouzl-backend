const { Sequelize } = require('sequelize');
const { DB_NAME, DB_USER, DB_PASS, DB_HOST } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false,
});

async function query(sql, options = {}) {
  try {
    const [results, metadata] = await sequelize.query(sql, options);
    return results;
  } catch (error) {
    throw error;
  }
}

module.exports = { query, sequelize };
