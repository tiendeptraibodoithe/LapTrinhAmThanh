const express = require("express");

let viewEngine = (app) => {
  app.use(express.static("./src/public")); // static chỉ định việc lấy một file nào đó chỉ được lấy trong file chỉ định
  app.set("view engine", "ejs"); // sử dụng view engine là ejs, cho phép gõ logic trong file html
  app.set("views", "./src/views");
};

module.exports = viewEngine;
