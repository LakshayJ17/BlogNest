import { env } from "./env";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { Prisma } from "@prisma/client";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { adminRouter } from "./routes/admin";
import { HttpError } from "./lib/errors";
import { AIError } from "./lib/ai";
import { apiLimiter } from "./rate-limiters";

const app = express();

app.set("trust proxy", env.trustProxy);
app.use(helmet());
app.use(
    cors({
        origin: env.corsOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: 600,
    })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
    res.status(200).send("OK");
});

app.use("/api", apiLimiter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/blog", blogRouter);
app.use("/api/v1/admin", adminRouter);

app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Express 5 forwards rejected promises here. Respond with JSON and never leak
// stack traces or database details.
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);

    if (err instanceof HttpError || err instanceof AIError) {
        return res.status(err.status).json({ error: err.message });
    }

    const bodyError = err as { type?: string; status?: number };
    if (bodyError?.type === "entity.too.large") {
        return res.status(413).json({ error: "That's too much content to save at once." });
    }
    if (bodyError?.type === "entity.parse.failed") {
        return res.status(400).json({ error: "Invalid request body." });
    }

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") return res.status(404).json({ error: "Not found." });
        if (err.code === "P2002") return res.status(409).json({ error: "That already exists." });
    }

    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
});

app.listen(env.port, () => {
    console.log(`Express server running on port ${env.port}`);
});
