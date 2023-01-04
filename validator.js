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

exports.validateUserSchema = validator(userSchema);