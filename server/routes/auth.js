const router = require("express").Router();

const {
  login,
  signup,
  activateAccount,
  resetPassword,
  forgotPassword,
} = require("../controllers/auth");

const { signupValidator, loginValidator } = require("../validators/auth");
const { runValidation } = require("../validators");

// signup
router.post("/signup", signupValidator, runValidation, signup);
// login
router.post("/login", loginValidator, runValidation, login);
// activate-account
router.post("/activate-account", activateAccount);
// forgot-password
router.post("/forgot-password", forgotPassword);
// reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
