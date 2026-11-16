
const request = require("supertest");

// Simular los modelos para no conectarnos a MongoDB Atlas
jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn()
}));

jest.mock("../src/services/emailVerificationService", () => ({
  createEmailVerificationToken: jest.fn()
}));

jest.mock("../src/services/emailService", () => ({
  sendVerificationEmail: jest.fn()
}));

jest.mock("../src/services/tokenService", () => ({
  createRefreshToken: jest.fn(),
  rotateRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeAllUserRefreshTokens: jest.fn()
}));

jest.mock("../src/utils/authCookies", () => ({
  setRefreshCookie: jest.fn(),
  clearRefreshCookie: jest.fn(),
  getRefreshCookie: jest.fn()
}));

jest.mock("../src/services/passwordResetService", () => ({
  createPasswordResetToken: jest.fn(),
  hashPasswordResetToken: jest.fn()
}));

jest.mock("../src/models/EmailVerificationToken", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn()
}));

jest.mock("../src/models/PasswordResetToken", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteMany: jest.fn()
}));

const User = require("../src/models/User");
const { createRefreshToken } = require("../src/services/tokenService");
const {
  createEmailVerificationToken
} = require("../src/services/emailVerificationService");
const {
  sendVerificationEmail
} = require("../src/services/emailService");

const app = require("../src/app");

describe("PRUEBAS DE AUTENTICACIÓN - EVENTHUB", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================================
  // PRUEBA 1: REGISTRO CORRECTO
  // ======================================
  test("Debe registrar un usuario correctamente", async () => {
    User.findOne.mockResolvedValue(null);

    User.create.mockResolvedValue({
      _id: "usuario123",
      name: "Daniela",
      email: "daniela@test.com",
      role: "attendee",
      isEmailVerified: false
    });

    createEmailVerificationToken.mockResolvedValue(
      "token-verificacion"
    );

    sendVerificationEmail.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Daniela",
        email: "daniela@test.com",
        password: "Password123"
      });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe("daniela@test.com");
    expect(response.body.user.role).toBe("attendee");
    expect(response.body.verificationEmailSent).toBe(true);
  });

  // ======================================
  // PRUEBA 2: CORREO DUPLICADO
  // ======================================
  test("Debe rechazar un correo que ya está registrado", async () => {
    User.findOne.mockResolvedValue({
      _id: "usuario123",
      email: "daniela@test.com"
    });

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Daniela",
        email: "daniela@test.com",
        password: "Password123"
      });

    expect(response.status).toBe(409);
    expect(User.create).not.toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 3: CAMPOS OBLIGATORIOS
  // ======================================
  test("Debe rechazar un registro sin campos obligatorios", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        email: "daniela@test.com"
      });

    expect(response.status).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 4: CONTRASEÑA CORTA
  // ======================================
  test("Debe rechazar una contraseña menor a 8 caracteres", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Daniela",
        email: "daniela@test.com",
        password: "12345"
      });

    expect(response.status).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 5: LOGIN CORRECTO
  // ======================================
  test("Debe permitir iniciar sesión con credenciales correctas", async () => {
    const bcrypt = require("bcrypt");
    const jwt = require("jsonwebtoken");

    const hashedPassword = await bcrypt.hash(
      "Password123",
      4
    );

    const usuario = {
      _id: "usuario123",
      name: "Daniela",
      email: "daniela@test.com",
      password: hashedPassword,
      role: "attendee",
      isActive: true,
      isEmailVerified: true
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(usuario)
    });

    createRefreshToken.mockResolvedValue("refresh-token-prueba");

    process.env.JWT_SECRET = "secreto-prueba";

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "daniela@test.com",
        password: "Password123"
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.email).toBe("daniela@test.com");
    expect(createRefreshToken).toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 6: CONTRASEÑA INCORRECTA
  // ======================================
  test("Debe rechazar una contraseña incorrecta", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "usuario123",
        email: "daniela@test.com",
        password: "$2b$04$hashincorrecto",
        isActive: true,
        isEmailVerified: true
      })
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "daniela@test.com",
        password: "Incorrecta123"
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Credenciales incorrectas");
  });

  // ======================================
  // PRUEBA 7: CORREO NO VERIFICADO
  // ======================================
  test("Debe impedir iniciar sesión con correo no verificado", async () => {
    const bcrypt = require("bcrypt");

    const hashedPassword = await bcrypt.hash(
      "Password123",
      4
    );

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "usuario123",
        email: "daniela@test.com",
        password: hashedPassword,
        isActive: true,
        isEmailVerified: false
      })
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "daniela@test.com",
        password: "Password123"
      });

    expect(response.status).toBe(403);
    expect(createRefreshToken).not.toHaveBeenCalled();
  });

});
