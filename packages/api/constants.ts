export const rpName = "Memewars";

export const rpID =
    process.env.NODE_ENV === "production"
        ? "memewars.vercel.app"
        : "localhost";

export const origin =
    process.env.NODE_ENV === "production" ? `https://${rpID}` : `http://${rpID}`;

export const expectedOrigin =
    process.env.NODE_ENV === "production" ? origin : `${origin}:3000`;
