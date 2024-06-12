const cron = require("node-cron");
const db = require("./db");

cron.schedule("* * * * *", async () => {
  try {
    const updateStaleOrdersQuery = `
            UPDATE entregas 
            SET status = 'pendiente' 
            WHERE status = 'procesando' 
            AND updatedAt < NOW() - INTERVAL 1 HOUR
        `;
    const results = await db.query(updateStaleOrdersQuery);
    if (results.affectedRows > 0) {
      console.log(
        `${results.affectedRows} Pedidos devueltos a status Pendiente`
      );
    }
  } catch (err) {
    console.error("Error al actualizar pedidos:", err);
  }
});

cron.schedule("0,30 * * * *", async () => {
  try {
    const deleteExpiredSessionsQuery = `
            DELETE FROM sesiones_activas 
            WHERE vencimiento < NOW()
        `;
    const results = await db.query(deleteExpiredSessionsQuery);
    console.log(`${results.fieldCount} Sesiones caducadas limpiadas`);
  } catch (err) {
    console.error("Error al limpiar sesiones caducadas:", err);
  }
});

const shutdownHandler = async () => {
  console.log("Apagando la aplicación...");
  try {
    await db.query("DELETE FROM sesiones_activas WHERE vencimiento < NOW()");
    console.log("Sesiones activas limpiadas");
    process.exit(0);
  } catch (err) {
    console.error("Error al cerrar la aplicación:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdownHandler);
process.on("SIGINT", shutdownHandler);
