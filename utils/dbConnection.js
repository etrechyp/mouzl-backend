const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('test', 'root', '', {
    host: 'localhost',
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
