import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { env } from "../env";
import { prisma } from "../lib/prisma";
import { HttpError, parseInput } from "../lib/errors";
import { googleAuthSchema, MAX_LIST_POSTS, signinSchema, signupSchema } from "../lib/validation";
import { withPreview } from "../lib/html";
import { AuthRequest, requireAuth, signToken } from "../middleware";
import { loginLimiter, signupLimiter } from "../rate-limiters";

export const userRouter = Router();

const BCRYPT_ROUNDS = 10;
const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

// Compared against when the email is unknown, so a missing account takes as
// long to reject as a wrong password (prevents account discovery by timing).
const DUMMY_HASH = bcrypt.hashSync("blognest-timing-equalizer", BCRYPT_ROUNDS);

/**
 * Exact, case-insensitive email lookup. Older accounts were stored as typed,
 * so compare lower(email).
 *
 * Do NOT use Prisma's `mode: "insensitive"` for this: on Postgres it becomes
 * ILIKE, where "_" and "%" are wildcards, so "alice_smith@x.com" would match
 * "alice.smith@x.com" and Google sign-in would hand out the wrong account.
 */
async function findUserByEmail(email: string) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "User"
        WHERE lower(email) = lower(${email})
        ORDER BY (email = ${email}) DESC
        LIMIT 1`;
    return rows[0] ? prisma.user.findUnique({ where: { id: rows[0].id } }) : null;
}

userRouter.post("/signup", signupLimiter, async (req: Request, res: Response) => {
    const { name, email, password } = parseInput(signupSchema, req.body);

    if (await findUserByEmail(email)) {
        throw new HttpError(409, "An account with this email already exists. Try signing in.");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
        data: { name: name || "Anonymous", email, hashedPassword },
    });

    res.status(201).json({ jwt: signToken(user.id), role: user.role });
});

userRouter.post("/signin", loginLimiter, async (req: Request, res: Response) => {
    const { email, password } = parseInput(signinSchema, req.body);

    const user = await findUserByEmail(email);
    const passwordMatches = await bcrypt.compare(password, user?.hashedPassword ?? DUMMY_HASH);

    // One message for every failure, so the response never reveals which
    // emails have accounts.
    if (!user || !user.hashedPassword || !passwordMatches) {
        throw new HttpError(401, "Incorrect email or password.");
    }

    res.json({ jwt: signToken(user.id), role: user.role });
});

userRouter.post("/google-auth", loginLimiter, async (req: Request, res: Response) => {
    if (!googleClient) {
        throw new HttpError(503, "Google sign-in isn't available right now.");
    }

    const { credential } = parseInput(googleAuthSchema, req.body);

    // Verify the ID token with Google. Never trust email/id claims sent by the
    // browser: anyone could send someone else's email.
    let payload: TokenPayload | undefined;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: env.googleClientId,
        });
        payload = ticket.getPayload();
    } catch {
        throw new HttpError(401, "Google sign-in failed. Please try again.");
    }

    if (!payload?.sub || !payload.email || !payload.email_verified) {
        throw new HttpError(401, "Your Google account email isn't verified.");
    }

    const email = payload.email.toLowerCase();
    let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });

    if (!user) {
        const existing = await findUserByEmail(email);
        if (existing?.googleId) {
            // Same email, different Google account (e.g. a reassigned work address).
            throw new HttpError(409, "This email is already linked to a different Google account.");
        }
        if (existing?.hashedPassword) {
            // Signup doesn't verify email ownership, so anyone could have created
            // this password account. Linking it would let them keep signing in to
            // the real owner's account with their password ("pre-hijacking").
            throw new HttpError(
                409,
                "An account with this email already exists. Sign in with your email and password instead."
            );
        }
        if (existing) {
            user = await prisma.user.update({
                where: { id: existing.id },
                data: { googleId: payload.sub, avatar: existing.avatar ?? payload.picture ?? null },
            });
        } else {
            user = await prisma.user.create({
                data: {
                    email,
                    name: payload.name?.trim().slice(0, 60) || "Google User",
                    googleId: payload.sub,
                    avatar: payload.picture ?? null,
                },
            });
        }
    }

    res.json({ jwt: signToken(user.id), role: user.role });
});

userRouter.get("/me", requireAuth(), async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            joinedAt: true,
            role: true,
            posts: {
                where: { status: { in: ["draft", "published"] } },
                orderBy: { date: "desc" },
                // This runs on every page load; keep it bounded.
                take: MAX_LIST_POSTS,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    status: true,
                    labels: true,
                    date: true,
                    _count: { select: { likes: true } },
                },
            },
            likes: { select: { postId: true } },
        },
    });

    if (!user) {
        throw new HttpError(404, "User not found.");
    }

    const { posts, likes, ...profile } = user;
    res.json({
        ...profile,
        posts: posts.map(withPreview),
        likedPostIds: likes.map((like) => like.postId),
    });
});
