"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    static associate(models) {
      // define association here
    }
  }
  Video.init(
    {
      filename: DataTypes.STRING,
      promptText: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Video",
    }
  );
  return Video;
};
