
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Correo inválido"
      ]
    },

    // Contraseña para usuarios registrados con correo
    password: {
      type: String,
      select: false
    },

    // Identificador de Google OAuth
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    // Roles de EventHub
    role: {
      type: String,
      enum: ["attendee", "organizer", "admin"],
      default: "attendee"
    },

    // Estado de verificación del correo
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // Estado de la cuenta
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
