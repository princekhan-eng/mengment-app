"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Image as ImageIcon, Loader2, X, FileText, CheckCircle2 } from "lucide-react";

export interface UploadedFile {
    url: string;
    name: string;
    fileType: string;
    size?: number;
    fileId?: string;
}

interface ImageKitUploaderProps {
    onUploadSuccess: (file: UploadedFile) => void;
    compact?: boolean;
    buttonText?: string;
}

export default function ImageKitUploader({
    onUploadSuccess,
    compact = true,
    buttonText = "Attach File",
}: ImageKitUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<UploadedFile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/API/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Failed to upload file to ImageKit");
            }

            const uploaded: UploadedFile = {
                url: data.url,
                name: data.name || file.name,
                fileType: data.fileType || file.type,
                size: data.size || file.size,
                fileId: data.fileId,
            };

            setPreview(uploaded);
            onUploadSuccess(uploaded);
        } catch (err: any) {
            console.error("ImageKit Upload Error:", err);
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    if (compact) {
        return (
            <div className="relative inline-block">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.zip,.txt"
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
                    title="Upload Image or File via ImageKit"
                >
                    {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    ) : (
                        <Paperclip className="h-4 w-4 text-indigo-400" />
                    )}
                    <span>{uploading ? "Uploading..." : buttonText}</span>
                </button>

                {error && (
                    <div className="absolute left-0 top-full mt-1 text-[11px] font-medium text-rose-400">
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.zip,.txt"
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-slate-900/50 p-6 text-center transition hover:border-indigo-500 hover:bg-slate-800/40"
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        <p className="text-sm font-medium text-slate-300">Uploading file to ImageKit...</p>
                    </div>
                ) : preview ? (
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                        <div className="text-left">
                            <p className="text-sm font-semibold text-white">{preview.name}</p>
                            <p className="text-xs text-slate-400">Upload complete!</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                            <ImageIcon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                            Click to upload image or document
                        </p>
                        <p className="text-xs text-slate-500">PNG, JPG, PDF, ZIP up to 20MB</p>
                    </div>
                )}
            </div>

            {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        </div>
    );
}
