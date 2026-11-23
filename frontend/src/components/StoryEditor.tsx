import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { EditorContent, useEditor, useEditorState, type ChainedCommands, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Placeholder } from "@tiptap/extensions";
import { TextSelection } from "@tiptap/pm/state";
import {
  ArrowUUpLeft,
  ArrowUUpRight,
  CodeBlock,
  ImageSquare,
  LinkSimple,
  ListBullets,
  ListNumbers,
  Quotes,
  TextB,
  TextHThree,
  TextHTwo,
  TextItalic,
  TextStrikethrough,
  TextUnderline,
} from "@phosphor-icons/react";
import { buttonClasses } from "./ui/button";
import { cn } from "../lib/utils";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? "Cmd" : "Ctrl";

interface StoryEditorProps {
  /** Story HTML. Changing it from outside (loading a draft, an AI draft) replaces the editor content. */
  value: string;
  /** Called with the new HTML whenever the writer changes the text. */
  onChange: (html: string) => void;
  disabled?: boolean;
}

export function StoryEditor({ value, onChange, disabled = false }: StoryEditorProps) {
  // The last HTML this editor reported, so we can tell our own updates apart
  // from content pushed in from outside.
  const lastHtml = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  const [prompt, setPrompt] = useState<Prompt>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          // Autolink makes links "sticky", so text typed right after a link
          // joins it. Pasted URLs are still linked (linkOnPaste).
          autolink: false,
          defaultProtocol: "https",
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
        },
      }),
      Image.configure({ allowBase64: false }),
      // Keeps alignment on older stories written with the previous editor.
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Tell your story..." }),
    ],
    content: value,
    editable: !disabled,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "article-body prose max-w-none min-h-[460px] px-5 py-8 focus:outline-none sm:px-10",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "Story",
      },
      // Cmd/Ctrl+K opens the link box, like most editors.
      handleKeyDown: (_view, event) => {
        if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "k") {
          event.preventDefault();
          setPrompt("link");
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      lastHtml.current = html;
      onChangeRef.current(html);
    },
  });

  // Content replaced from outside: a loaded draft, an AI draft, or a fresh story.
  useEffect(() => {
    if (!editor || value === lastHtml.current) return;
    lastHtml.current = value;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!disabled, false);
  }, [editor, disabled]);

  return (
    <div className={cn("story-editor rounded-lg border border-line bg-surface", disabled && "opacity-70")}>
      {editor && <Toolbar editor={editor} disabled={disabled} prompt={prompt} setPrompt={setPrompt} />}
      <EditorContent editor={editor} />
      {editor && <EditorFooter editor={editor} />}
    </div>
  );
}

type Prompt = null | "link" | "image";

function Toolbar({
  editor,
  disabled,
  prompt,
  setPrompt,
}: {
  editor: Editor;
  disabled: boolean;
  prompt: Prompt;
  setPrompt: Dispatch<SetStateAction<Prompt>>;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      quote: e.isActive("blockquote"),
      code: e.isActive("codeBlock"),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const run = (fn: (chain: ChainedCommands) => ChainedCommands) => () => {
    fn(editor.chain().focus()).run();
  };

  // Arrow keys move between toolbar buttons, as expected in a toolbar.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  const off = disabled;

  return (
    <div className="sticky top-16 z-20 rounded-t-lg border-b border-line bg-surface/95 backdrop-blur-sm">
      <div
        role="toolbar"
        aria-label="Formatting"
        onKeyDown={onKeyDown}
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 sm:px-3"
      >
        <ToolButton label="Heading" active={state.h2} disabled={off} onClick={run((c) => c.toggleHeading({ level: 2 }))}>
          <TextHTwo size={18} />
        </ToolButton>
        <ToolButton label="Subheading" active={state.h3} disabled={off} onClick={run((c) => c.toggleHeading({ level: 3 }))}>
          <TextHThree size={18} />
        </ToolButton>
        <Divider />
        <ToolButton label="Bold" shortcut="B" active={state.bold} disabled={off} onClick={run((c) => c.toggleBold())}>
          <TextB size={18} weight="bold" />
        </ToolButton>
        <ToolButton label="Italic" shortcut="I" active={state.italic} disabled={off} onClick={run((c) => c.toggleItalic())}>
          <TextItalic size={18} />
        </ToolButton>
        <ToolButton label="Underline" shortcut="U" active={state.underline} disabled={off} onClick={run((c) => c.toggleUnderline())}>
          <TextUnderline size={18} />
        </ToolButton>
        <ToolButton label="Strikethrough" active={state.strike} disabled={off} onClick={run((c) => c.toggleStrike())}>
          <TextStrikethrough size={18} />
        </ToolButton>
        <Divider />
        <ToolButton label="Quote" active={state.quote} disabled={off} onClick={run((c) => c.toggleBlockquote())}>
          <Quotes size={18} />
        </ToolButton>
        <ToolButton label="Code block" active={state.code} disabled={off} onClick={run((c) => c.toggleCodeBlock())}>
          <CodeBlock size={18} />
        </ToolButton>
        <ToolButton
          label={state.link ? "Edit link" : "Link"}
          shortcut="K"
          active={state.link || prompt === "link"}
          disabled={off}
          onClick={() => setPrompt((p) => (p === "link" ? null : "link"))}
        >
          <LinkSimple size={18} />
        </ToolButton>
        <ToolButton
          label="Image"
          active={prompt === "image"}
          disabled={off}
          onClick={() => setPrompt((p) => (p === "image" ? null : "image"))}
        >
          <ImageSquare size={18} />
        </ToolButton>
        <Divider />
        <ToolButton label="Bulleted list" active={state.bullets} disabled={off} onClick={run((c) => c.toggleBulletList())}>
          <ListBullets size={18} />
        </ToolButton>
        <ToolButton label="Numbered list" active={state.numbers} disabled={off} onClick={run((c) => c.toggleOrderedList())}>
          <ListNumbers size={18} />
        </ToolButton>
        <Divider />
        <ToolButton label="Undo" shortcut="Z" disabled={off || !state.canUndo} onClick={run((c) => c.undo())}>
          <ArrowUUpLeft size={18} />
        </ToolButton>
        <ToolButton label="Redo" shortcut="Shift+Z" disabled={off || !state.canRedo} onClick={run((c) => c.redo())}>
          <ArrowUUpRight size={18} />
        </ToolButton>
      </div>

      {prompt === "link" && <LinkPrompt editor={editor} onDone={() => setPrompt(null)} />}
      {prompt === "image" && <ImagePrompt editor={editor} onDone={() => setPrompt(null)} />}
    </div>
  );
}

function ToolButton({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  const hint = shortcut ? `${label} (${MOD}+${shortcut})` : label;
  return (
    <button
      type="button"
      aria-label={label}
      title={hint}
      aria-pressed={active}
      disabled={disabled}
      // Keep the text selection in the editor when clicking with a mouse.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-ink-soft transition-colors",
        "hover:bg-bone hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
        active && "bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent-strong"
      )}
    >
      <span aria-hidden="true" className="contents">
        {children}
      </span>
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />;
}

function normalizeUrl(raw: string, { allowMail }: { allowMail: boolean }): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (allowMail && /^mailto:/i.test(value)) return value;
  if (allowMail && /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(value)) return `mailto:${value}`;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/**
 * Close a link/image box and put the cursor back in the story right away.
 * (Tiptap's focus command waits a frame, so fast typing after Enter was lost.)
 */
function backToEditor(editor: Editor, onDone: () => void) {
  editor.view.focus();
  onDone();
}

function LinkPrompt({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const current = (editor.getAttributes("link").href as string | undefined) ?? "";
  const [url, setUrl] = useState(current);
  const [error, setError] = useState("");

  const close = () => backToEditor(editor, onDone);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const href = normalizeUrl(url, { allowMail: true });
    if (!href) {
      setError("Enter a web address like example.com, or an email address.");
      return;
    }
    const chain = editor.chain().extendMarkRange("link");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      // Nothing selected: insert the address itself as the link text.
      chain.insertContent({ type: "text", text: url.trim(), marks: [{ type: "link", attrs: { href } }] }).run();
    } else {
      chain.setLink({ href }).run();
      // Put the cursor after the link so the next keystroke doesn't replace it.
      editor.commands.setTextSelection(editor.state.selection.to);
    }
    backToEditor(editor, onDone);
  };

  const remove = () => {
    editor.chain().extendMarkRange("link").unsetLink().run();
    backToEditor(editor, onDone);
  };

  return (
    <PromptRow onSubmit={submit} onCancel={close} error={error}>
      <input
        type="text"
        inputMode="url"
        autoFocus
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError("");
        }}
        placeholder="Paste or type a link"
        aria-label="Link address"
        aria-invalid={error ? true : undefined}
        className={promptInput}
      />
      <button type="submit" className={buttonClasses({ size: "sm" })}>
        {current ? "Update" : "Add link"}
      </button>
      {current && (
        <button type="button" onClick={remove} className={buttonClasses({ variant: "ghost", size: "sm" })}>
          Remove
        </button>
      )}
    </PromptRow>
  );
}

function ImagePrompt({ editor, onDone }: { editor: Editor; onDone: () => void }) {
  const [src, setSrc] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");

  const close = () => backToEditor(editor, onDone);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const url = normalizeUrl(src, { allowMail: false });
    if (!url) {
      setError("Enter the image's web address, starting with https://");
      return;
    }
    editor.chain().setImage({ src: url, alt: alt.trim() || undefined }).run();
    // The new image is left selected, so typing would replace it. Move the
    // cursor to the line below instead (there is always one: TrailingNode).
    const { state } = editor;
    const below = TextSelection.findFrom(state.doc.resolve(state.selection.to), 1, true);
    if (below) editor.view.dispatch(state.tr.setSelection(below));
    backToEditor(editor, onDone);
  };

  return (
    <PromptRow onSubmit={submit} onCancel={close} error={error}>
      <input
        type="text"
        inputMode="url"
        autoFocus
        value={src}
        onChange={(e) => {
          setSrc(e.target.value);
          setError("");
        }}
        placeholder="Image address (https://...)"
        aria-label="Image address"
        aria-invalid={error ? true : undefined}
        className={promptInput}
      />
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        placeholder="Describe the image"
        aria-label="Image description for screen readers"
        maxLength={200}
        className={cn(promptInput, "sm:max-w-56")}
      />
      <button type="submit" className={buttonClasses({ size: "sm" })}>
        Add image
      </button>
    </PromptRow>
  );
}

const promptInput =
  "h-9 min-w-0 flex-1 rounded-md border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-faint " +
  "focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function PromptRow({
  onSubmit,
  onCancel,
  error,
  children,
}: {
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
  error: string;
  children: ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
      className="border-t border-line px-3 py-2.5"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {children}
        <button type="button" onClick={onCancel} className={buttonClasses({ variant: "ghost", size: "sm" })}>
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-tag-red">
          {error}
        </p>
      )}
    </form>
  );
}

function EditorFooter({ editor }: { editor: Editor }) {
  const words = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const text = e.state.doc.textBetween(0, e.state.doc.content.size, " ", " ");
      return text.split(/\s+/).filter(Boolean).length;
    },
  });
  const minutes = Math.max(1, Math.round(words / 225));

  return (
    <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-2.5 font-mono text-[11px] text-muted sm:px-10">
      <span className="hidden sm:inline">
        Shortcuts: ## heading, &gt; quote, - list, {MOD}+K link
      </span>
      <span className="ml-auto tabular-nums">
        {words === 1 ? "1 word" : `${words.toLocaleString()} words`}
        {words > 0 && `, ${minutes} min read`}
      </span>
    </div>
  );
}
