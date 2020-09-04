const { check } = require("express-validator");

const MIN = 6;

exports.signupValidator = [
  check("username").not().isEmpty().withMessage("username is required"),
  check("email")
    .not()
    .isEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is invalid"),
  check("password")
    .not()
    .isEmpty()
    .withMessage("password is required")
    .isLength({ min: MIN })
    .withMessage(`password must be at least ${MIN} characters long!`),
];


exports.loginValidator = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("email is invalid"),
  check("password")
    .not()
    .isEmpty()
    .withMessage("password is required")
    .isLength({ min: MIN })
    .withMessage(`password must be at least ${MIN} characters long!`),
];

