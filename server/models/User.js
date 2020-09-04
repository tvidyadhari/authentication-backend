const crypto = require("crypto");
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

userSchema.methods = {
  makeSalt: () => Math.round(new Date().getTime() * Math.random()),
  encryptPassword: function (password) {
    if (!password) return new Error("password can't be empty");
    // secret is salt
    return crypto
      .createHmac("sha256", this.salt)
      .update(password)
      .digest("hex");
  },
  verifyPassword: function (inputPassword) {
    return this.encryptPassword(inputPassword) === this.password;
  },
};
/**
 *  crypto.createHmac("sha256", "1188351052209").update("Vidya@vishnu123").digest("hex");
 */

// validate hook runs before save; alternative is virtuals
userSchema.pre("validate", function () {
  if (!this.salt) this.salt = this.makeSalt();
  console.log(this.password);
  this.password = this.encryptPassword(this.password);
});

module.exports = new model("User", userSchema);

/**
 * http://localhost:3000/activate/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhbSIsImVtYWlsIjoicmFtQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiQmFrYVN1YmFydTEyMyIsImlhdCI6MTU5Njk1OTg2OSwiZXhwIjoxNTk2OTYxNjY5fQ.ndHOw5mdNz6_gsdeqgwgHLIKTkMx6V-hjxIxF2JbT1g
 */
