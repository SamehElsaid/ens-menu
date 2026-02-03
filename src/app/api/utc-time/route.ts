import { encryptDataApi } from "@/shared/encryption";
import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
    try {
        // Validate environment variable
        const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;
        if (!secretKey) {
            console.error("NEXT_PUBLIC_SECRET_KEY is not configured");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Calculate UTC timestamp in seconds with 3 decimal places
        const utcTimestamp = parseFloat((Date.now() / 1000).toFixed(3));
        
        // Encrypt the timestamp
        const encryptedTimestamp = encryptDataApi(utcTimestamp, secretKey);
        
        return NextResponse.json({ fx_dyn: encryptedTimestamp });
    } catch (error) {
        console.error("Error in UTC time endpoint:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
