export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function notFound(message) {
  return new AppError(message, 404);
}

export function unauthorized(message) {
  return new AppError(message, 401);
}

export function forbidden(message) {
  return new AppError(message, 403);
}

export function conflict(message) {
  return new AppError(message, 409);
}

export function errorHandler(err, req, res, next) {
  if (err?.name === "ZodError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err?.name === "AppError") {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err?.code === "P2025") {
    return res.status(404).json({ message: "Resource not found" });
  }

  if (err?.code === "P2002") {
    return res.status(409).json({ message: "Resource already exists" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}
