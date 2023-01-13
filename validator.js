const Joi = require('joi');

const validator = (schema) => (payload) =>
    schema.validate(payload, { abortEarly: false});

const userSchema = Joi.object({
    firstname: Joi.string().required().pattern(new RegExp("[a-zA-Z ]")).messages({
        "any.required": "First name is required.",
        "string.pattern.base": "First name is invalid",
        "string.empty": "First name should not be empty"
    }),
    lastname: Joi.string().required().messages({
        "any.required": "Last name is required."
    })
});

const validateUserSchema = validator(userSchema);

const registerSchema = Joi.object({
    email:Joi.string().required().email(),
    firstname: Joi.string().required().pattern(new RegExp("[a-zA-Z ]")).messages({
        "any.required": "First name is required.",
        "string.pattern.base": "First name is invalid",
        "string.empty": "First name should not be empty"
    }),
    lastname: Joi.string().required().messages({
        "any.required": "Last name is required."
    }),
    password:Joi.string().required(),
    confirm_password:Joi.string().required()
});

const validateUserRegisterSchema = validator(registerSchema);

module.exports = {validateUserSchema, validateUserRegisterSchema};

