"use client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRef, useState } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react"
import Image from "next/image";
import { Button } from "./ui/button";


export function UploadForm() {
    const fileInput = useRef<HTMLInputElement>(null);
    const nameInput = useRef<HTMLInputElement>(null);
    const phoneInput = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string>();
    const [isSubmitted, setIsSubmitted] = useState(false)

    async function uploadFile(
        evt: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) {
        evt.preventDefault();

        if (generatedImage) {
            URL.revokeObjectURL(generatedImage);
        }

        const formData = new FormData();
        if (fileInput.current && fileInput.current.files?.[0]) {
            formData.append("file", fileInput.current.files[0]);
        }
        if (nameInput.current) {
            formData.append("name", nameInput.current.value);
        }
        if (phoneInput.current) {
            formData.append("phone", phoneInput.current.value);
        }

        // Inicia o loading e limpa imagem anterior.
        setLoading(true);
        setGeneratedImage("");

        // Agora os dados serão enviados para o endpoint que gera a imagem
        fetch("/api/uploadImage", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("data", data);

                if (data.status === "success") {
                    if (process.env.NODE_ENV === "production") {
                        // Produção: utiliza diretamente a fileUrl retornada pelo @vercel/blob
                        setGeneratedImage(data.newPost.fileUrl);
                        setLoading(false);
                        setIsSubmitted(true);
                    } else {
                        // Desenvolvimento: gera a imagem usando o endpoint supporters
                        fetch("/api/supporters", {
                            method: "POST",
                            body: JSON.stringify(data.newPost),
                        })
                            .then(async (response) => {
                                const blob = await response.blob();
                                const url = URL.createObjectURL(blob);
                                console.log("url:", url);
                                setGeneratedImage(url);
                                setLoading(false);
                                setIsSubmitted(true);
                            })
                            .catch((err) => console.error("Erro na requisição:", err));
                    }
                } else {
                    console.error("Erro no upload", data.error);
                }
            })
            .catch((err) => console.error("Erro na requisição:", err));
    }

    function handleDownload() {
        if (!generatedImage) return;
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = "downloaded-image.png"; // Specify the file name for download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 gap-3">
            {!isSubmitted && (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-center">Apoiador</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`transition-opacity duration-500 ${isSubmitted ? "opacity-0 h-0" : "opacity-100"}`}>
                            <form className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome</Label>
                                    <Input type="text" name="name" ref={nameInput} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Telefone</Label>
                                    <Input type="tel" name="phone" ref={phoneInput} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">Imagem</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            type="file" name="file" ref={fileInput}
                                            id="image"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={loading}
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById("image")?.click()}
                                            disabled={loading}
                                        >
                                            <Upload className="mr-2 h-4 w-4" /> Upload Imagem
                                        </Button>
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" onClick={uploadFile} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enviando...
                                        </>
                                    ) : (
                                        "Enviar"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}
            {loading ? (
                <Card className="w-full max-w-md">
                    <CardContent className="!p-6">
                        <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="mr-2 size-5 animate-spin" />
                            Gerando imagem
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {generatedImage && (
                        <div className={`transition-opacity duration-500 ${isSubmitted ? "opacity-100" : "opacity-0 h-0"}`}>
                            <div className="flex flex-col items-center space-y-4">
                                <Card className="w-full max-w-md">
                                    <CardHeader className="flex flex-col items-center space-y-4">
                                        <CheckCircle className="h-16 w-16 text-green-500" />
                                        <CardTitle className="text-2xl font-bold text-center">Imagem gerada com sucesso!</CardTitle>
                                    </CardHeader>

                                    <CardContent className=" space-y-4">
                                        <div className="mt-4 relative h-[299px] w-full">
                                            <Image
                                                src={generatedImage || "/placeholder.svg"}
                                                alt="Preview"
                                                fill
                                                style={{ objectFit: "contain" }}
                                                className="rounded-md"
                                            />
                                        </div>
                                        <Button onClick={handleDownload} className="w-full">
                                            baixar
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </>
            )}

        </div>

    );
}