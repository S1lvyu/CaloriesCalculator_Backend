const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    default: null,
  },

  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
});
userSchema.methods.setPassword = function (password) {
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};

userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};
userSchema.methods.setToken = function (token) {
  this.token = token;
};

const User = mongoose.model("users", userSchema);
module.exports = User;
