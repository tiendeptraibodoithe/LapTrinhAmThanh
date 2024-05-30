const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("prompt", "root", null, {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});
const connectionDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync(); // Đồng bộ models với cơ sở dữ liệu
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = connectionDatabase;
