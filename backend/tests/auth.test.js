
const request = require("supertest");

// ======================================
// SIMULAR MODELOS Y SERVICIOS
// No se conecta a MongoDB Atlas
// ======================================

jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}));

jest.mock("../src/services/emailVerificationService", () => ({
  createEmailVerificationToken: jest.fn(),
  hashToken: jest.fn()
}));

jest.mock("../src/services/emailService", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn()
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

// ======================================
// IMPORTACIONES
// ======================================

const User = require("../src/models/User");

const {
  createRefreshToken
} = require("../src/services/tokenService");

const {
  createEmailVerificationToken
} = require("../src/services/emailVerificationService");

const {
  sendVerificationEmail
} = require("../src/services/emailService");

const app = require("../src/app");

// ======================================
// PRUEBAS DE AUTENTICACIÓN
// ======================================

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

  // ======================================
  // PRUEBA 8: RENOVACIÓN SIN COOKIE
  // ======================================

  test("Debe rechazar la renovación si no existe una cookie de sesión", async () => {
    const {
      getRefreshCookie
    } = require("../src/utils/authCookies");

    getRefreshCookie.mockReturnValue(null);

    const response = await request(app)
      .post("/api/auth/refresh");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("No hay una sesión activa");
  });

  // ======================================
  // PRUEBA 9: CIERRE DE SESIÓN SIN COOKIE
  // ======================================

  test("Debe permitir cerrar sesión cuando no existe una cookie", async () => {
    const {
      getRefreshCookie,
      clearRefreshCookie
    } = require("../src/utils/authCookies");

    getRefreshCookie.mockReturnValue(null);

    const response = await request(app)
      .post("/api/auth/logout");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Sesión cerrada correctamente");
    expect(clearRefreshCookie).toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 10: CIERRE DE SESIÓN CON TOKEN
  // ======================================

  test("Debe revocar el refresh token al cerrar sesión", async () => {
    const {
      getRefreshCookie,
      clearRefreshCookie
    } = require("../src/utils/authCookies");

    const {
      revokeRefreshToken
    } = require("../src/services/tokenService");

    getRefreshCookie.mockReturnValue("refresh-token-prueba");
    revokeRefreshToken.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/logout");

    expect(response.status).toBe(200);
    expect(revokeRefreshToken).toHaveBeenCalledWith(
      "refresh-token-prueba"
    );
    expect(clearRefreshCookie).toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 11: RECUPERACIÓN DE CONTRASEÑA
  // ======================================

  test("Debe solicitar recuperación para un usuario registrado", async () => {
    const {
      createPasswordResetToken
    } = require("../src/services/passwordResetService");

    const {
      sendPasswordResetEmail
    } = require("../src/services/emailService");

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "usuario123",
        email: "daniela@test.com",
        isActive: true,
        password: "hash"
      })
    });

    createPasswordResetToken.mockResolvedValue("token-prueba");
    sendPasswordResetEmail.mockResolvedValue(true);

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "daniela@test.com"
      });

    expect(response.status).toBe(200);
    expect(createPasswordResetToken).toHaveBeenCalledWith("usuario123");
    expect(sendPasswordResetEmail).toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 12: CORREO NO REGISTRADO
  // ======================================

  test("Debe responder correctamente si el correo no está registrado", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });

    const response = await request(app)
      .post("/api/auth/forgot-password")
      .send({
        email: "inexistente@test.com"
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain(
      "Si el correo está registrado"
    );
  });

  // ======================================
  // PRUEBA 13: TOKEN DE RECUPERACIÓN INVÁLIDO
  // ======================================

  test("Debe rechazar un token de recuperación inválido", async () => {
    const PasswordResetToken = require(
      "../src/models/PasswordResetToken"
    );

    const {
      hashPasswordResetToken
    } = require("../src/services/passwordResetService");

    hashPasswordResetToken.mockReturnValue("hash-token-invalido");
    PasswordResetToken.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "token-invalido",
        password: "NuevaClave123"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Enlace de recuperación inválido o expirado"
    );
  });

  // ======================================
  // PRUEBA 14: CONTRASEÑA NUEVA CORTA
  // ======================================

  test("Debe rechazar una nueva contraseña menor a 8 caracteres", async () => {
    const response = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: "token-prueba",
        password: "123"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "entre 8 y 72 caracteres"
    );
  });

  // ======================================
  // PRUEBA 15: VERIFICACIÓN CORRECTA
  // ======================================

  test("Debe verificar correctamente el correo del usuario", async () => {
    const EmailVerificationToken = require(
      "../src/models/EmailVerificationToken"
    );

    const verification = {
      _id: "verificacion123",
      user: "usuario123"
    };

    const user = {
      _id: "usuario123",
      isActive: true,
      isEmailVerified: false,
      save: jest.fn().mockResolvedValue(true)
    };

    const {
      hashToken
    } = require("../src/services/emailVerificationService");

    hashToken.mockReturnValue("hash-verificacion");

    EmailVerificationToken.findOne.mockResolvedValue(verification);

    EmailVerificationToken.findOneAndUpdate.mockResolvedValue({
      ...verification,
      usedAt: new Date()
    });

    User.findById.mockResolvedValue(user);

    const response = await request(app)
      .post("/api/auth/verify-email")
      .send({
        token: "token-valido"
      });

    expect(response.status).toBe(200);
    expect(user.isEmailVerified).toBe(true);
    expect(user.save).toHaveBeenCalled();
  });

  // ======================================
  // PRUEBA 16: TOKEN INVÁLIDO
  // ======================================

  test("Debe rechazar un token de verificación inválido", async () => {
    const EmailVerificationToken = require(
      "../src/models/EmailVerificationToken"
    );

    const {
      hashToken
    } = require("../src/services/emailVerificationService");

    hashToken.mockReturnValue("hash-invalido");
    EmailVerificationToken.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/verify-email")
      .send({
        token: "token-invalido"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Enlace de verificación inválido o expirado"
    );
  });

  // ======================================
  // PRUEBA 17: CORREO YA VERIFICADO
  // ======================================

  test("Debe rechazar la verificación de un correo ya verificado", async () => {
    const EmailVerificationToken = require(
      "../src/models/EmailVerificationToken"
    );

    const verification = {
      _id: "verificacion123",
      user: "usuario123"
    };

    const user = {
      _id: "usuario123",
      isActive: true,
      isEmailVerified: true
    };

    const {
      hashToken
    } = require("../src/services/emailVerificationService");

    hashToken.mockReturnValue("hash-verificacion");

    EmailVerificationToken.findOne.mockResolvedValue(verification);
    User.findById.mockResolvedValue(user);

    const response = await request(app)
      .post("/api/auth/verify-email")
      .send({
        token: "token-utilizado"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "El correo ya está verificado"
    );
  });

  // ======================================
  // PRUEBA 18: TOKEN VACÍO
  // ======================================

  test("Debe rechazar la verificación sin proporcionar un token", async () => {
    const response = await request(app)
      .post("/api/auth/verify-email")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Token de verificación obligatorio"
    );
  });


  // ======================================
  // PRUEBA 19: CUENTA DESACTIVADA
  // ======================================

  test("Debe impedir iniciar sesión con una cuenta desactivada", async () => {
    const bcrypt = require("bcrypt");

    const hashedPassword = await bcrypt.hash(
      "Password123",
      4
    );

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: "usuario123",
        name: "Daniela",
        email: "daniela@test.com",
        password: hashedPassword,
        role: "attendee",
        isActive: false,
        isEmailVerified: true
      })
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "daniela@test.com",
        password: "Password123"
      });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Cuenta desactivada");
    expect(createRefreshToken).not.toHaveBeenCalled();
  });


  // ======================================
  // PRUEBA 20: RENOVACIÓN DE SESIÓN VÁLIDA
  // ======================================

 
  // ======================================
  // PRUEBA 20: RENOVACIÓN DE SESIÓN VÁLIDA
  // ======================================

  test("Debe renovar correctamente una sesión con refresh token válido", async () => {
    const jwt = require("jsonwebtoken");

    const {
      getRefreshCookie,
      setRefreshCookie
    } = require("../src/utils/authCookies");

    const {
      rotateRefreshToken
    } = require("../src/services/tokenService");

    // Configurar secretos de prueba
    process.env.JWT_SECRET = "secreto-prueba";
    process.env.JWT_REFRESH_SECRET = "secreto-refresh-prueba";

    // Generar un JWT válido
    const refreshToken = jwt.sign(
      {
        userId: "usuario123",
        jti: "identificador-prueba"
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
        algorithm: "HS256"
      }
    );

    getRefreshCookie.mockReturnValue(refreshToken);

    // Simular renovación del token
    rotateRefreshToken.mockResolvedValue({
      userId: "usuario123",
      refreshToken: "nuevo-refresh-token"
    });

    // Simular usuario activo y verificado
    User.findById.mockResolvedValue({
      _id: "usuario123",
      name: "Daniela",
      email: "daniela@test.com",
      role: "attendee",
      isActive: true,
      isEmailVerified: true
    });

    const response = await request(app)
      .post("/api/auth/refresh");

    // Verificar respuesta exitosa
    expect(response.status).toBe(200);

    // Verificar que se renovó el refresh token
    expect(rotateRefreshToken).toHaveBeenCalledWith(
      refreshToken
    );

    // Verificar que se actualizó la cookie
    expect(setRefreshCookie).toHaveBeenCalledWith(
      expect.any(Object),
      "nuevo-refresh-token"
    );

    // Verificar que se generó un nuevo access token
    expect(response.body.accessToken).toBeDefined();

    // Verificar el mensaje del controlador
    expect(response.body.message).toBe(
      "Sesión renovada correctamente"
    );

    // El endpoint refresh no devuelve los datos del usuario
    expect(response.body.user).toBeUndefined();
  });

});



