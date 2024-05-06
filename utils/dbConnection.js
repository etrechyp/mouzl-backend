const { Sequelize } = require('sequelize');
const { DB_NAME, DB_USER, DB_PASS, DB_HOST}  = process.env

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    dialect: 'mysql',
});

async function query(sql) {
    try {
        const [results, metadata] = await sequelize.query(sql);
        return results;
    } catch (error) {
        throw error;
    }
}

module.exports = { query };
