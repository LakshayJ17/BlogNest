import { z, ZodTypeAny } from "zod";

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

/** Parse input with a zod schema, or throw a 400 with the first readable issue. */
export function parseInput<S extends ZodTypeAny>(schema: S, input: unknown): z.output<S> {
    const result = schema.safeParse(input);
    if (!result.success) {
        const issue = result.error.issues[0];
        throw new HttpError(400, issue?.message || "Invalid input");
    }
    return result.data;
}
