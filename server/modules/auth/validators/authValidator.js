const Joi = require("joi");

const passwordRule = Joi.string()
  .min(8)
  .pattern(new RegExp("(?=.*[a-z])"))
  .pattern(new RegExp("(?=.*[A-Z])"))
  .pattern(new RegExp("(?=.*[0-9])"))
  .pattern(new RegExp("(?=.*[!@#$%^&*])"))
  .required()
  .messages({
    "string.pattern.base":
      "Password must contain uppercase, lowercase, number, and special character",
    "string.min": "Password must be at least 8 characters",
  });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: passwordRule,
  role: Joi.string().valid("user", "teacher").default("user"),

  qualification: Joi.string().when("role", {
    is: "teacher",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  specialization: Joi.string().when("role", {
    is: "teacher",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  experience: Joi.number().when("role", {
    is: "teacher",
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  bio: Joi.string().max(500).optional(), 
  linkedIn: Joi.string().uri().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  password: passwordRule,
});

// OTP
const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "OTP must be exactly 6 digits",
      "string.pattern.base": "OTP must contain only numbers",
    }),
});

const resendOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, errors: messages });
  }
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  resendOtpSchema,
};
