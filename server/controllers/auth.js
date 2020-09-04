const User = require("../models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const {
  JWT_ACCOUNT_ACTIVATION,
  EMAIL_FROM,
  CLIENT_URL,
  JWT_SECRET,
  JWT_RESET_PASSWORD,
} = process.env;

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "ae7197acb9c937",
    pass: "43c857bebb6ad9",
  },
});

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
  try {
    // check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) res.status(400).json({ error: "user already exists" });

    /** send activation link to user **/
    // token creation
    const token = jwt.sign(
      { username, email, password },
      JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "30m" }
    );
    // send email
    const link = `${CLIENT_URL}/activate/${token}`;
    transport.sendMail(
      {
        from: EMAIL_FROM,
        to: email,
        subject: "auth: activate your account",
        html: `
          <p>hey <strong>${username}</strong>!\nclick on the link below to activate your account.</p>
          <a href=${link} target="_blank">click here</a>
          <p><em>this link will expire in 30 minutes.</em></p>`,
      },
      (err) => {
        if (err)
          return res
            .status(400)
            .json({ error: "error occurred while sending email" });
        return res.json({
          data: `email has been sent to ${email}. follow the instructions in the email to activate your account`,
        });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "error occurred while signing up" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // verify user
    const user = await User.findOne({ email });
    if (!user || !user.verifyPassword(password))
      return res.status(401).json({ error: "wrong email or password" });

    console.log(user);
    // create token for authorizing
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const { _id, username } = user;

    return res.json({ data: { token, user: { _id, email, username } } });
  } catch (error) {
    return res.json({ error: "error occurred while logging in" });
  }
};

exports.activateAccount = (req, res) => {
  const { token } = req.body;
  console.log("token", token);
  if (!token) return res.status(401).json({ error: "link is invalid" });

  jwt.verify(token, JWT_ACCOUNT_ACTIVATION, async (err, data) => {
    if (err) return res.status(401).json({ error: "link has expired" });

    try {
      const { username, email, password } = data;

      // check if account is already created
      const userExists = await User.findOne({ email });
      if (userExists)
        return res
          .status(401)
          .json({ error: "this account has already been activated" });

      // create + save user
      const newUser = await new User({ username, email, password }).save();
      return res.json({ data: { _id: newUser._id } });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ error: "error occurred while activating the account" });
    }
  });
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // find user
    const user = await User.findOne({ email });
    if (!user) res.status(400).json({ error: "email doesn't exist" });
    // create token
    const resetToken = jwt.sign({ _id: user._id }, JWT_RESET_PASSWORD, {
      expiresIn: "1d",
    });
    // send email
    const link = `${CLIENT_URL}/reset-password/${resetToken}`;
    const info = await transport.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "auth: password reset link",
      html: `
          <p>please use the following link to reset your password</p>
          <a href=${link} target="_blank">${link}</a>
        `,
    });
    if (info) {
      const updatedUser = await user.updateOne({
        resetPasswordToken: resetToken,
      });
      return res.json({
        data: `email has been sent to ${user.email}. follow the instructions in the email to reset your password`,
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: "oops! an error occurred" });
  }
};

exports.resetPassword = (req, res) => {
  const { token, password } = req.body;
  if (!token) return res.status(400).json({ error: "token is required" });

  jwt.verify(token, JWT_RESET_PASSWORD, async (err, decoded) => {
    if (err)
      return res.status(401).json({
        error: "expired link. try again",
      });

    try {
      const user = await User.findOne({ resetPasswordToken: token });
      if (!user) return res.status(400).json({ error: "invalid token" });
      // update password + resetPasswordToken
      user.resetPasswordToken = "";
      user.password = password;
      await user.save();
      return res.json({ data: "password is reset successfully" });
    } catch (error) {
      return res
        .status(400)
        .json({ error: "something went while resetting password" });
    }
  });
};
