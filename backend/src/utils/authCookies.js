
const COOKIE_NAME = "eventhub_refresh";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/api/auth"
};

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(COOKIE_NAME, refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
};

const getRefreshCookie = (req) => {
  return req.cookies?.[COOKIE_NAME];
};

module.exports = {
  setRefreshCookie,
  clearRefreshCookie,
  getRefreshCookie
};
