import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

export const app = express();

app.use(
  cors({
    origin: "https://content-frontend-sable.vercel.app",
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

app.use(errorHandler);
