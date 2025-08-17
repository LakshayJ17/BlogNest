import axios from "axios";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Unauthorized } from "../components/Unauthorized";
import { Spinner } from "../components/Spinner";
import { BackButton } from "../components/BackButton";
import { useAuthStore } from "../store/auth";
import { toast } from "react-toastify";
import { PlusCircle, Sparkle, CheckCircle, XCircle } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

const labels = [
  "Technology",
  "Music",
  "Sports",
  "Space",
  "Entertainment",
  "Hobby",
];

export const Publish = () => {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState<null | "draft" | "publish" | "ai">(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const navigate = useNavigate();

  const { token } = useAuthStore();

  const notifyWarn = () => toast.warning("Please fill all the fields");
  const notifyError = () => toast.error("An error occurred while publishing the blog");

  useEffect(() => {
    // If id then working with draft else its a new post 
    // Get draft post content to show/edit in text editor 
    if (id) {
      axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          const post = res.data.post;
          setTitle(post.title || "");
          setContent(post.content || "");
          setSelectedLabels(post.labels || []);
          setIsAIGenerated(post.isAIGenerated || false);
        })
        .catch(() => {
          toast.error("Could not load draft");
        });
    } else {
      setTitle("");
      setContent("");
      setSelectedLabels([]);
      setIsAIGenerated(false);
    }

  }, [id, token]);

  if (!token) {
    return <Unauthorized />;
  }

  const labelsToSend = isAIGenerated ? Array.from(new Set([...selectedLabels, "AI Generated"])) : selectedLabels;

  const handlePublish = async (type: "draft" | "publish") => {
    if (!title || !content) {
      notifyWarn();
      return;
    }

    setLoading(type);
    try {
      let response;

      // If id is present send patch request for update in content of draft post
      if (id) {
        response = await axios.patch(
          `${BACKEND_URL}/api/v1/blog/${id}`,
          {
            title,
            content,
            labels: labelsToSend,
            status: type === "publish" ? "published" : "draft",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            validateStatus: () => true,
          }
        );
      } else {
        // else its a new post 
        response = await axios.post(`${BACKEND_URL}/api/v1/blog/${type}`,
          {
            title,
            content,
            labels: labelsToSend,
            status: type === "publish" ? "published" : "draft",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            validateStatus: () => true,
          }
        );
      }

      if (response.status !== 200) {
        toast.error(
          response.data?.error || "An error occurred while publishing the blog"
        );
        return;
      } else {
        toast.success(
          type === "publish"
            ? "Blog published successfully"
            : id
              ? "Draft updated"
              : "Blog saved as draft"
        );
      }

      const blogId = response.data.id || id;
      navigate(type === "publish" ? `/blog/${blogId}` : `/drafts`);
    } catch (error) {
      console.error("Error publishing the blog:", error);
      notifyError();
    } finally {
      setLoading(null);
    }
  };

  const generateAIContent = async (title: string) => {
    if (!title) {
      toast.error("Please write a title to generate content");
      return;
    }

    setLoading("ai");
    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/blog/ai-post`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent(response.data.content);
      setIsAIGenerated(true);
    } catch (error) {
      console.log("Error generating content : ", error);
      toast.error("Error generating ai content");
    } finally {
      setLoading(null);
    }
  };

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar
        navigateTo="/blogs"
        label={<BackButton />}
        buttons={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handlePublish("draft")}
              className="flex gap-2 items-center justify-center cursor-pointer text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium rounded-lg text-sm py-2 px-4 transition"
              disabled={loading !== null}
            >
              {loading === "draft" ? (
                <div className="flex gap-2 items-center justify-center">
                  <Spinner size="small" />
                  <p>Saving...</p>
                </div>
              ) : (
                <div className="flex gap-2 items-center justify-center">
                  <CheckCircle size={16} />
                  <p>Save to Draft</p>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => handlePublish("publish")}
              className="cursor-pointer text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium rounded-lg text-sm py-2 px-4 transition flex gap-2 items-center justify-center"
              disabled={loading !== null}
            >
              {loading === "publish" ? (
                <div className="flex gap-2 items-center justify-center">
                  <Spinner size="small" />
                  <p>Publishing...</p>
                </div>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <p>Publish</p>
                </>
              )}
            </button>
          </div>
        }
      />
      <div className="flex justify-center px-2 pt-8 min-h-screen">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-6 flex flex-col">
          <div className="flex w-full gap-2">
            <input
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-lg font-semibold rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-4 py-3 shadow-sm transition"
              placeholder="Enter the title of your article..."
              required
              autoFocus
              value={title}
              disabled={loading !== null}
            />
            <button
              onClick={() => generateAIContent(title)}
              className="border border-neutral-300 p-2 rounded-lg bg-neutral-100 cursor-pointer shadow-sm hover:bg-neutral-200 transition"
              disabled={loading !== null}
              title="Generate AI Content"
            >
              {loading === "ai" ? <Spinner size="small" /> : <Sparkle />}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 py-2">
            {isAIGenerated && (
              <span className="bg-blue-100 border border-blue-400 text-blue-700 font-semibold py-1.5 px-4 rounded-full flex items-center gap-1 text-sm select-none">
                <Sparkle size={16} className="text-blue-500" />
                AI Generated
              </span>
            )}
            {labels.map((label) => {
              const isSelected = selectedLabels.includes(label);
              const isHovered = hoveredLabel === label;
              return (
                <span
                  key={label}
                  onClick={() => toggleLabel(label)}
                  onMouseEnter={() => setHoveredLabel(label)}
                  onMouseLeave={() => setHoveredLabel(null)}
                  className={`py-1.5 px-4 rounded-full flex items-center gap-1 text-sm cursor-pointer border transition
                    ${isSelected
                      ? "bg-green-100 border-green-400 text-green-700 font-semibold"
                      : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
                    }`}
                >
                  {isSelected ? (
                    isHovered ? (
                      <XCircle size={16} className="text-red-500" />
                    ) : (
                      <CheckCircle size={16} className="text-green-500" />
                    )
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  {label}
                </span>
              );
            })}
          </div>

          <TextEditor value={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
};

function TextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Editor
      apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
      onEditorChange={onChange}
      value={value}
      id="editor"
      init={{
        height: 400,
        menubar: false,
        branding: false,
        statusbar: false,
        placeholder: "Start writing your article here...",
        plugins: [
          "advlist",
          "autolink",
          "lists",
          "link",
          "image",
          "charmap",
          "preview",
          "anchor",
          "searchreplace",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "code",
          "help",
          "wordcount",
        ],
        toolbar:
          "undo redo | blocks | " +
          "bold italic forecolor | alignleft aligncenter " +
          "alignright alignjustify | bullist numlist outdent indent | " +
          "removeformat | help",
        content_style:
          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
      }}
    />
  );
}
