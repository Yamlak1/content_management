import { Router } from "express";
import { z } from "zod";
import * as articleController from "../controllers/article.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

const tagsSchema = z.union([
  z.array(z.string().trim().min(1, "tag cannot be empty")),
  z.string().trim().min(1, "tags cannot be empty"),
]);

const uuidParamSchema = z.object({
  id: z.string().uuid("Invalid article id"),
});

const createArticleSchema = z.object({
  title: z
    .string({ required_error: "title is required" })
    .trim()
    .min(1, "title is required"),
  body: z
    .string({ required_error: "body is required" })
    .trim()
    .min(1, "body is required"),
  tags: tagsSchema.optional().default([]),
  authorId: z.string().uuid("Invalid authorId").optional(),
});

const updateArticleSchema = z
  .object({
    title: z.string().trim().min(1, "title cannot be empty").optional(),
    body: z.string().trim().min(1, "body cannot be empty").optional(),
    tags: tagsSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

const publishedQuerySchema = z.object({
  tag: z.string().trim().min(1).optional(),
  authorId: z.string().uuid("Invalid authorId").optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

router.post(
  "/",
  authenticateToken,
  validate({ body: createArticleSchema }),
  articleController.createArticle
);
router.get(
  "/published",
  validate({ query: publishedQuerySchema }),
  articleController.getPublishedArticles
);
router.put(
  "/:id",
  authenticateToken,
  validate({ params: uuidParamSchema, body: updateArticleSchema }),
  articleController.updateArticle
);
router.patch(
  "/:id/publish",
  authenticateToken,
  validate({ params: uuidParamSchema }),
  articleController.publishArticle
);
router.patch(
  "/:id/unpublish",
  authenticateToken,
  validate({ params: uuidParamSchema }),
  articleController.unpublishArticle
);
router.get("/:id", validate({ params: uuidParamSchema }), articleController.getArticle);

export default router;
