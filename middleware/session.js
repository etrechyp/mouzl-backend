const { response, request } = require("express");
const JWT = require("jsonwebtoken");
const db = require("../utils/db");

const { SECRET } = process.env;

const generateJWT = (payload) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      payload,
      SECRET,
      {
        expiresIn: payload.expiresIn,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("Token could not be generated");
        } else {
          resolve(token);
        }
      }
    );
  });
};

const validateJWT = async (req = request, res = response, next) => {
  const session = req.headers.authorization;

  if (!session) {
    return res.status(401).json({
      message: "Missing token",
    });
  }

  try {
    const token = session.split(" ")[1];
    const { id } = JWT.verify(token, SECRET);

    const userQuery = `SELECT * FROM usuarios WHERE id = :id`;
    const user = await db.query(userQuery, { replacements: { id } });

    if (user.length === 0) {
      return res.status(401).json({
        message: "Invalid token, user does not exist",
      });
    }

    const sessionQuery = `SELECT * FROM sesiones_activas WHERE usuario_id = :id AND token = :token`;
    const activeSession = await db.query(sessionQuery, {
      replacements: { id, token },
    });

    if (activeSession.length === 0) {
      return res.status(401).json({
        message: "Invalid token, session not found",
      });
    }

    req.user = user[0];
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: "Invalid token",
    });
  }
};

module.exports = {
  generateJWT,
  validateJWT,
};
