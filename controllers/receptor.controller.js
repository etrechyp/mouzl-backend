const { response } = require("express");
const dbConnection = require("../utils/dbConnection");

const getReceptor = async (req, res = response) => {
  try {
    const receptor = await dbConnection.query(
      `SELECT * FROM receptor WHERE id = ${req.params.id}`
    );

    res.status(200).json(receptor[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
    getReceptor
}