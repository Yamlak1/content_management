import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "./error.middleware.js";

export function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return next(unauthorized("Missing or invalid Authorization header"));
  }

  const token = authorization.slice(7).trim();

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: payload.sub,
      name: payload.name,
    };
    return next();
  } catch (error) {
    return next(unauthorized("Invalid or expired token"));
  }
}