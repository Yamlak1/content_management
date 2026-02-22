import { Router } from "express";
import { z } from "zod";
import * as authorController from "../controllers/author.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid author id"),
});

const createAuthorSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .trim()
    .min(1, "name is required"),
  password: z
    .string({ required_error: "password is required" })
    .min(8, "password must be at least 8 characters"),
});

const loginAuthorSchema = z.object({
  name: z
    .string({ required_error: "name is required" })
    .trim()
    .min(1, "name is required"),
  password: z.string({ required_error: "password is required" }).min(1, "password is required"),
});

const nameParamSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
});

router.post("/", validate({ body: createAuthorSchema }), authorController.createAuthor);
router.post("/login", validate({ body: loginAuthorSchema }), authorController.loginAuthor);
router.get(
  "/by-name/:name",
  validate({ params: nameParamSchema }),
  authorController.getAuthorByName
);
router.get("/:id", validate({ params: uuidParamSchema }), authorController.getAuthor);

export default router;
