import "./markdown-editor.css";

import { markdown } from "@codemirror/lang-markdown";
import { EditorView, placeholder as cmPlaceholder } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { renderToStaticMarkup } from "react-dom/server";
import rehypeHighlight from "rehype-highlight";
import { useTranslation } from "react-i18next";
import remarkGfm from "remark-gfm";

import { toast } from "@/components/common/Toast";
import { useTheme } from "@/components/context/theme-context";
import { cn } from "@/lib/utils";
import env from "@/env.ts";

export interface MarkdownEditorRef {
    getValue: () => string;
    setValue: (value: string) => void;
    exportPDF: () => void;
    exportHTML: () => void;
}

interface MarkdownEditorProps {
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    placeholder?: string;
    vault?: string;
    fileLinks?: Record<string, string>;
    initialMode?: "edit" | "preview";
}

type AttachmentType = "image" | "video" | "audio" | "file";

const EMPTY_FILE_LINKS: Record<string, string> = {};
const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|svg|webp|bmp)$/i;
const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv|avi|ogv)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|ogg|m4a|flac|aac)$/i;

const EXPORT_STYLE = `
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #222;
  line-height: 1.75;
}
main {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
img, video {
  max-width: 100%;
  border-radius: 10px;
}
pre {
  overflow-x: auto;
  background: #f6f8fa;
  border-radius: 10px;
  padding: 14px;
}
code {
  font-family: "SFMono-Regular", Menlo, Monaco, Consolas, monospace;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  text-align: left;
}
blockquote {
  margin: 0;
  padding-left: 12px;
  border-left: 4px solid #e5e7eb;
  color: #6b7280;
}
.hljs-comment, .hljs-quote { color: #6b7280; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #2563eb; }
.hljs-title, .hljs-section, .hljs-name { color: #16a34a; }
.hljs-string, .hljs-attr, .hljs-template-tag { color: #b45309; }
.hljs-number, .hljs-built_in, .hljs-type { color: #9333ea; }
`;

function getTokenFromStorage(): string {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") ?? "";
}

function buildFileApiUrl(vault: string, path: string, token: string): string {
    const params = new URLSearchParams({
        vault,
        path,
        token,
    });
    return `${env.API_URL}/api/file?${params.toString()}`;
}

function resolveAttachmentType(path: string): AttachmentType {
    if (IMAGE_EXTENSIONS.test(path)) return "image";
    if (VIDEO_EXTENSIONS.test(path)) return "video";
    if (AUDIO_EXTENSIONS.test(path)) return "audio";
    return "file";
}

function parseAttachmentPathFromHref(href?: string): string {
    if (!href) return "";
    try {
        const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
        const url = new URL(href, base);
        return (url.searchParams.get("path") ?? href).toLowerCase();
    } catch {
        return href.toLowerCase();
    }
}

function escapeMarkdownText(text: string): string {
    return text
        .replace(/\\/g, "\\\\")
        .replace(/\[/g, "\\[")
        .replace(/\]/g, "\\]")
        .replace(/\(/g, "\\(")
        .replace(/\)/g, "\\)");
}

function transformObsidianSyntax(
    content: string,
    vault: string,
    fileLinks: Record<string, string>,
    token: string
): string {
    if (!content) return content;

    return content.replace(/!\[\[([^\]]+)\]\]/g, (match, inner: string) => {
        const [rawTarget = "", ...metaParts] = inner.split("|");
        const rawPath = rawTarget.split("#")[0].trim();
        if (!rawPath) return match;

        const resolvedPath = fileLinks[rawPath] || rawPath;
        const apiUrl = buildFileApiUrl(vault, resolvedPath, token);
        const displayName = escapeMarkdownText((metaParts[0] || rawPath).trim());
        const attachmentType = resolveAttachmentType(resolvedPath.toLowerCase());

        if (attachmentType === "image") {
            // 检查是否有宽度参数（Obsidian 语法: ![[img.png|100]]）
            const widthMatch = metaParts[0]?.match(/^(\d+)$/);
            if (widthMatch) {
                return `<img src="${apiUrl}" alt="${rawPath}" width="${widthMatch[1]}" />`;
            }
            return `![${displayName}](${apiUrl})`;
        }
        if (attachmentType === "video") {
            return `[🎬 ${displayName}](${apiUrl})`;
        }
        if (attachmentType === "audio") {
            return `[🎵 ${displayName}](${apiUrl})`;
        }
        return `[📎 ${displayName}](${apiUrl})`;
    });
}

const markdownComponents: Components = {
    h1: ({ node: _node, className, ...props }) => (
        <h1 className={cn("mt-8 mb-4 text-3xl font-bold first:mt-0", className)} {...props} />
    ),
    h2: ({ node: _node, className, ...props }) => (
        <h2 className={cn("mt-7 mb-3 text-2xl font-semibold first:mt-0", className)} {...props} />
    ),
    h3: ({ node: _node, className, ...props }) => (
        <h3 className={cn("mt-6 mb-3 text-xl font-semibold first:mt-0", className)} {...props} />
    ),
    p: ({ node: _node, className, ...props }) => (
        <p className={cn("my-3 leading-7 text-foreground/90", className)} {...props} />
    ),
    ul: ({ node: _node, className, ...props }) => (
        <ul className={cn("my-3 list-disc pl-6", className)} {...props} />
    ),
    ol: ({ node: _node, className, ...props }) => (
        <ol className={cn("my-3 list-decimal pl-6", className)} {...props} />
    ),
    li: ({ node: _node, className, ...props }) => (
        <li className={cn("my-1.5", className)} {...props} />
    ),
    blockquote: ({ node: _node, className, ...props }) => (
        <blockquote className={cn("my-4 border-l-4 border-border pl-4 text-muted-foreground", className)} {...props} />
    ),
    hr: ({ node: _node, className, ...props }) => (
        <hr className={cn("my-6 border-border", className)} {...props} />
    ),
    table: ({ node: _node, className, ...props }) => (
        <div className="my-4 overflow-x-auto">
            <table className={cn("w-full border-collapse text-sm", className)} {...props} />
        </div>
    ),
    thead: ({ node: _node, className, ...props }) => (
        <thead className={cn("bg-muted/50", className)} {...props} />
    ),
    th: ({ node: _node, className, ...props }) => (
        <th className={cn("border border-border px-3 py-2 text-left font-semibold", className)} {...props} />
    ),
    td: ({ node: _node, className, ...props }) => (
        <td className={cn("border border-border px-3 py-2 align-top", className)} {...props} />
    ),
    img: ({ node: _node, className, alt, ...props }) => (
        <img
            className={cn("my-4 max-w-full rounded-lg border border-border/60", className)}
            alt={alt ?? ""}
            loading="lazy"
            {...props}
        />
    ),
    a: ({ node: _node, href, children, className, ...props }) => {
        const attachmentType = resolveAttachmentType(parseAttachmentPathFromHref(href));

        if (href && attachmentType === "video") {
            return <video src={href} controls className="my-4 w-full rounded-lg border border-border/60" />;
        }
        if (href && attachmentType === "audio") {
            return <audio src={href} controls className="my-4 w-full" />;
        }

        return (
            <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className={cn("text-primary underline underline-offset-4 hover:opacity-80", className)}
                {...props}
            >
                {children}
            </a>
        );
    },
    pre: ({ node: _node, className, ...props }) => (
        <pre className={cn("my-4 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4", className)} {...props} />
    ),
    code: ({ node: _node, className, children, ...props }) => {
        const value = String(children);
        const isInline = !className && !value.includes("\n");

        if (isInline) {
            return (
                <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]" {...props}>
                    {children}
                </code>
            );
        }

        return (
            <code className={cn("text-sm", className)} {...props}>
                {children}
            </code>
        );
    },
    input: ({ node: _node, className, ...props }) => {
        if (props.type === "checkbox") {
            return <input {...props} disabled className={cn("mr-2 accent-primary", className)} />;
        }
        return <input {...props} className={className} />;
    },
};

export const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
    (
        {
            value,
            onChange,
            readOnly = false,
            placeholder = "",
            vault = "",
            fileLinks = EMPTY_FILE_LINKS,
            initialMode = "edit",
        },
        ref
    ) => {
        const { resolvedTheme } = useTheme();
        const { t } = useTranslation();
        const editorViewRef = useRef<EditorView | null>(null);
        const valueRef = useRef(value);
        const [mode] = useState<"edit" | "preview">(initialMode);
        const [editorValue, setEditorValue] = useState(value);

        const highlightClass = resolvedTheme === "dark"
            ? "[&_.hljs-comment]:text-zinc-500 [&_.hljs-quote]:text-zinc-500 [&_.hljs-keyword]:text-sky-300 [&_.hljs-selector-tag]:text-sky-300 [&_.hljs-literal]:text-sky-300 [&_.hljs-title]:text-emerald-300 [&_.hljs-section]:text-emerald-300 [&_.hljs-name]:text-emerald-300 [&_.hljs-string]:text-amber-300 [&_.hljs-attr]:text-amber-300 [&_.hljs-template-tag]:text-amber-300 [&_.hljs-number]:text-fuchsia-300 [&_.hljs-built_in]:text-violet-300 [&_.hljs-type]:text-violet-300"
            : "[&_.hljs-comment]:text-zinc-500 [&_.hljs-quote]:text-zinc-500 [&_.hljs-keyword]:text-blue-600 [&_.hljs-selector-tag]:text-blue-600 [&_.hljs-literal]:text-blue-600 [&_.hljs-title]:text-green-700 [&_.hljs-section]:text-green-700 [&_.hljs-name]:text-green-700 [&_.hljs-string]:text-amber-700 [&_.hljs-attr]:text-amber-700 [&_.hljs-template-tag]:text-amber-700 [&_.hljs-number]:text-purple-700 [&_.hljs-built_in]:text-purple-700 [&_.hljs-type]:text-purple-700";

        // 外部 value 变化时同步到本地状态（CM6 通过 value prop 自动同步，无需手动 dispatch）
        useEffect(() => {
            valueRef.current = value;
            setEditorValue(value);
        }, [value]);

        useEffect(() => {
            return () => {
                editorViewRef.current = null;
            };
        }, []);

        const editorExtensions = useMemo(() => {
            const extensions = [markdown(), EditorView.lineWrapping, EditorView.editable.of(!readOnly)];
            if (placeholder) {
                extensions.push(cmPlaceholder(placeholder));
            }
            return extensions;
        }, [placeholder, readOnly]);

        const handleEditorChange = useCallback(
            (nextValue: string) => {
                valueRef.current = nextValue;
                setEditorValue(nextValue);
                onChange?.(nextValue);
            },
            [onChange]
        );

        const getCurrentValue = useCallback((): string => {
            const view = editorViewRef.current;
            if (view) {
                return view.state.doc.toString();
            }
            return valueRef.current;
        }, []);

        const setCurrentValue = useCallback((nextValue: string) => {
            valueRef.current = nextValue;
            setEditorValue(nextValue);

            const view = editorViewRef.current;
            if (!view) return;
            if (view.state.doc.toString() === nextValue) return;

            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: nextValue },
            });
        }, []);

        const previewMarkdown = useMemo(() => {
            return transformObsidianSyntax(editorValue, vault, fileLinks, getTokenFromStorage());
        }, [editorValue, fileLinks, vault]);

        const handleExportHTML = useCallback(() => {
            const markdownValue = getCurrentValue();
            const transformed = transformObsidianSyntax(markdownValue, vault, fileLinks, getTokenFromStorage());
            const rendered = renderToStaticMarkup(
                <main>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>
                        {transformed}
                    </ReactMarkdown>
                </main>
            );

            const htmlDocument = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Export</title>
<style>${EXPORT_STYLE}</style>
</head>
<body>${rendered}</body>
</html>`;

            const blob = new Blob([htmlDocument], { type: "text/html;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = `note-${new Date().toISOString().replace(/[:.]/g, "-")}.html`;
            anchor.click();
            URL.revokeObjectURL(url);
        }, [fileLinks, getCurrentValue, vault]);

        useImperativeHandle(
            ref,
            () => ({
                getValue: getCurrentValue,
                setValue: setCurrentValue,
                exportPDF: () => {
                    toast.info(t("ui.note.exportPdfPlanned"));
                },
                exportHTML: handleExportHTML,
            }),
            [getCurrentValue, handleExportHTML, setCurrentValue, t]
        );

        if (mode === "preview") {
            return (
                <div className={cn("markdown-preview h-full overflow-y-auto", highlightClass)}>
                    <article className="mx-auto max-w-[900px] px-5 py-10">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>
                            {previewMarkdown}
                        </ReactMarkdown>
                    </article>
                </div>
            );
        }

        return (
            <div className="h-full [&_.cm-editor]:h-full [&_.cm-gutters]:h-full [&_.cm-scroller]:overflow-auto">
                <CodeMirror
                    value={editorValue}
                    height="100%"
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    extensions={editorExtensions}
                    basicSetup={{
                        lineNumbers: false,
                        foldGutter: false,
                        highlightActiveLineGutter: false,
                    }}
                    onChange={handleEditorChange}
                    onCreateEditor={(view) => {
                        editorViewRef.current = view;
                    }}
                    className="h-full text-sm"
                />
            </div>
        );
    }
);

MarkdownEditor.displayName = "MarkdownEditor";
