import { Router } from "express";
import authorRoutes from "./author.routes.js";
import articleRoutes from "./article.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/authors", authorRoutes);
router.use("/articles", articleRoutes);

export default router;