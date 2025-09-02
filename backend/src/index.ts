import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { adminRouter } from "./routes/admin";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "https://blognest-project.vercel.app"],
  credentials: true,
}));
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/admin", adminRouter);

const PORT = process.env.PORT || 8787;

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});