
const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("@scalar/express-api-reference", () => ({
  apiReference: () => (req, res, next) => next()
}));

jest.mock("../src/models/User", () => ({
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

const User = require("../src/models/User");
const app = require("../src/app");

describe("ADMINISTRACIÓN DE USUARIOS - EVENTHUB", () => {
  const adminId = "507f1f77bcf86cd799439011";
  const userId = "507f1f77bcf86cd799439012";

  let adminToken;

  beforeAll(() => {
    process.env.JWT_SECRET = "secreto-pruebas-admin";

    adminToken = jwt.sign(
      { userId: adminId, role: "admin" },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();

    User.findById.mockResolvedValue({
      _id: adminId,
      name: "Administrador",
      email: "admin@test.com",
      role: "admin",
      isActive: true,
      isEmailVerified: true
    });
  });

  test("Debe rechazar solicitudes sin token", async () => {
    const response = await request(app).get("/api/admin/users");

    expect(response.status).toBe(401);
  });

  test("Debe impedir el acceso a usuarios sin rol admin", async () => {
    User.findById.mockResolvedValue({
      _id: userId,
      role: "attendee",
      isActive: true,
      isEmailVerified: true
    });

    const token = jwt.sign(
      { userId, role: "attendee" },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" }
    );

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  test("Debe permitir al administrador consultar usuarios", async () => {
    const users = [
      { _id: adminId, name: "Administrador", role: "admin" },
      { _id: userId, name: "Usuario", role: "attendee" }
    ];

    const sort = jest.fn().mockResolvedValue(users);
    const select = jest.fn().mockReturnValue({ sort });

    User.find.mockReturnValue({ select });

    const response = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(2);
  });

  test("Debe rechazar un rol inválido", async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "superadmin" });

    expect(response.status).toBe(400);
  });

  test("Debe impedir que el administrador cambie su propio rol", async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${adminId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "attendee" });

    expect(response.status).toBe(403);
  });

  test("Debe permitir cambiar el rol de otro usuario", async () => {
    const updatedUser = {
      _id: userId,
      name: "Usuario",
      role: "organizer"
    };

    User.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(updatedUser)
    });

    const response = await request(app)
      .patch(`/api/admin/users/${userId}/role`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ role: "organizer" });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe("organizer");
  });

  test("Debe rechazar estados que no sean booleanos", async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${userId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: "false" });

    expect(response.status).toBe(400);
  });

  test("Debe impedir que el administrador desactive su propia cuenta", async () => {
    const response = await request(app)
      .patch(`/api/admin/users/${adminId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(response.status).toBe(403);
  });

  test("Debe permitir desactivar la cuenta de otro usuario", async () => {
    const updatedUser = {
      _id: userId,
      name: "Usuario",
      isActive: false
    };

    User.findByIdAndUpdate.mockReturnValue({
      select: jest.fn().mockResolvedValue(updatedUser)
    });

    const response = await request(app)
      .patch(`/api/admin/users/${userId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(response.status).toBe(200);
    expect(response.body.user.isActive).toBe(false);
  });
});
