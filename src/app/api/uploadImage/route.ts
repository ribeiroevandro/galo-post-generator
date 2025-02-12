import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";

export async function POST(req: Request) {

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;

        // Normalize the name: trim spaces, convert to lowercase and replace spaces with dashes.
        const normalizedName = name.trim().toLowerCase().replace(/\s+/g, "-");

        // Preserve the original file extension.
        const extension = path.extname(file.name);
        const fileNameNormalized = `${normalizedName}${extension}`;
        const uploadPath = `./public/uploads/${fileNameNormalized}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        await fs.writeFile(uploadPath, buffer);
        revalidatePath("/");

        // Use an environment variable or default to localhost for development.
        const domain = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
        const fileUrl = `${domain}/uploads/${fileNameNormalized}`;

        let newPost = {
            name,
            phone,
            fileUrl
        }

        return NextResponse.json({ status: "success", newPost });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: "fail", error: e });
    }
}