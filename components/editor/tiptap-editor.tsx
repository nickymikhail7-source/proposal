"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Link as LinkIcon,
    Image as ImageIcon,
    Undo,
    Redo,
} from "lucide-react"

interface EditorProps {
    content: string
    onChange: (content: string) => void
    editable?: boolean
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
        ],
        content,
        editable,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4",
            },
        },
    })

    if (!editor) {
        return null
    }

    if (!editable) {
        return <EditorContent editor={editor} />
    }

    return (
        <div className="rounded-md border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200" : ""
                        }`}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200" : ""
                        }`}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
                <button
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
                        }`}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </button>
                <button
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
                        }`}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-200" : ""
                        }`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("orderedList") ? "bg-gray-200" : ""
                        }`}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
                <button
                    onClick={() => {
                        const url = window.prompt("URL")
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run()
                        }
                    }}
                    className={`rounded p-1 hover:bg-gray-200 ${editor.isActive("link") ? "bg-gray-200" : ""
                        }`}
                    title="Link"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
                <button
                    onClick={() => {
                        const url = window.prompt("Image URL")
                        if (url) {
                            editor.chain().focus().setImage({ src: url }).run()
                        }
                    }}
                    className="rounded p-1 hover:bg-gray-200"
                    title="Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </button>
                <div className="h-4 w-px bg-gray-300 mx-1" />
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="rounded p-1 hover:bg-gray-200 disabled:opacity-50"
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="rounded p-1 hover:bg-gray-200 disabled:opacity-50"
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    )
}
