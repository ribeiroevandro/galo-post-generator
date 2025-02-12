import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const normalizedName = searchParams.get("file"); // passa o nome normalizado via parâmetro
    if (!normalizedName) {
        return NextResponse.json({ error: "file parameter is required" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), "public", "uploads", normalizedName);
    try {
        const fileBuffer = await fs.readFile(filePath);
        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Disposition": `attachment; filename="${normalizedName}"`,
                "Content-Type": "application/octet-stream"
            }
        });
    } catch (err) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
}