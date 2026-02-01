const { body, validationResult } = require("express-validator");

const MAX_LENGTH = 3000;

const postValidator = [
  body("content").custom((value, { req }) => {
    if (!value && !req.file) {
      throw new Error("Post must have content or a file");
    }
    if (value && value.length < 3 && !req.file) {
      throw new Error("Text-only posts must be at least 3 characters");
    }
    if (value && value.length > MAX_LENGTH) {
      throw new Error(`Post cannot exceed ${MAX_LENGTH} characters.`);
    }
    return true;
  }),
];

const commentValidator = [
  body("content")
    .isLength({ min: 1 })
    .withMessage("Your comment is too short. Share more of your thoughts!")
    .isLength({ max: MAX_LENGTH })
    .withMessage("Comment cannot exceed 3000 characters.")
    .trim(),
];

const validatorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    // LOGGING FOR DEBUGGING
    console.log('[Validator Error] Request Body:', req.body);
    console.log('[Validator Error] Validation Errors:', errors.array());

    const errorMessages = errors
      .array()
      .map((error) => error.msg)
      .join(" ");
    res.status(400).json({ message: errorMessages });
  }
};

module.exports = {
  postValidator,
  commentValidator,
  validatorHandler,
};
