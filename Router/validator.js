const { body } = require("express-validator");

// server-client side validator
const emailValidator = body("email")
  .isEmail()
  .optional()
  .withMessage("Invalid email address");

const usernameValidator = body("username")
  .isLength({ min: 3 })
  .withMessage("Username must be at least 3 characters long")
  .optional()
  .not()
  .contains(" ")
  .withMessage("Username should not contain special characters");

const passwordValidator = body("password")
  .isLength({ min: 3 })
  .withMessage("Password must be at least 3 characters long")
  .optional()
  .not()
  .contains(" ")
  .withMessage("Password should not contain special characters");

const newPasswordValidator = body("newPassword")
  .isLength({ min: 3 })
  .withMessage("Password must be at least 3 characters long")
  .optional()
  .not()
  .contains(" ")
  .withMessage("Password should not contain special characters")
  .custom((value, { req }) => {
    if (value != req.body.password) return true;
    return false;
  })
  .withMessage("New password should be different from old password.");

const reqIsValidate = [
  emailValidator,
  usernameValidator,
  passwordValidator,
  newPasswordValidator,
];

const textValidator = body("text")
  .custom((value) => {
    if (value != "undefined") return true;
    return false;
  })
  .withMessage("Text cannot be blank");

const tweetIsValidate = [textValidator];

module.exports = { reqIsValidate, tweetIsValidate };
