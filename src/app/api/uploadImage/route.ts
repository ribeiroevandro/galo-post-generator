import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;

        // Normaliza o nome: remove espaços, converte para minúsculas e substitui espaços por hífens.
        const normalizedName = name.trim().toLowerCase().replace(/\s+/g, "-");

        // Preserva a extensão original do arquivo.
        const extension = path.extname(file.name);
        const fileNameNormalized = `${normalizedName}${extension}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        let fileUrl: string;

        if (process.env.NODE_ENV === "development") {
            // Ambiente local: salva na pasta public/uploads
            const uploadPath = `./public/uploads/${fileNameNormalized}`;
            await fs.writeFile(uploadPath, buffer);

            // Utiliza variável de ambiente ou localhost para desenvolvimento
            const domain = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
            fileUrl = `${domain}/uploads/${fileNameNormalized}`;
        } else {
            // Ambiente de produção: utiliza o @vercel/blob
            const blob = await put(file.name, file, { access: 'public' });
            fileUrl = blob.url;
        }

        revalidatePath("/");

        const newPost = {
            name,
            phone,
            fileUrl,
        };

        return NextResponse.json({ status: "success", newPost });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ status: "fail", error: e });
    }
}