import axios from "axios";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Unauthorized } from "../components/Unauthorized";
import { Spinner } from "../components/Spinner";
import { BackButton } from "../components/BackButton";
import { useAuthStore } from "../store/auth";
import { toast } from "react-toastify";
import { Sparkle } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";

export const Publish = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { token } = useAuthStore();

  const notifyWarn = () => toast.warning("Please fill all the fields");
  const notifyError = () =>
    toast.error("An error occurred while publishing the blog");

  if (!token) {
    return <Unauthorized />;
  }

  const handlePublish = async () => {
    if (!title || !content) {
      notifyWarn();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog`,
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate(`/blog/${response.data.id}`);
    } catch (error) {
      console.error("Error publishing the blog:", error);
      notifyError();
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async (title: string) => {
    if (!title) {
      toast.error("Please write a title to generate content");
      return;
    }

    try {
      setLoading(true)
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog/ai-post`,
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setLoading(false)
      setContent(response.data.content);
    } catch (error) {
      console.log("Error generating content : ", error);
      toast.error("Error generating ai content");
    }
  };

  return (
    <div>
      <Appbar navigateTo="/blogs" label={<BackButton />} />
      <div>
        <div className="flex justify-center px-2 sm:w-full pt-8">
          <div className="max-w-screen-lg w-full space-y-6 flex flex-col h-screen overflow-y-auto">
            <div className="flex w-full gap-2">
              <input
                onChange={(e) => setTitle(e.target.value)}
                type="text"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-md font-medium rounded-md focus:ring-blue-500 focus:border-blue-500 block pl-3 py-2 shadow-sm"
                placeholder="Enter the title of your article..."
                required
                autoFocus
                value={title}
              />
              <button
                onClick={() => generateAIContent(title)}
                className="border border-neutral-300 p-2 rounded-lg bg-neutral-100 cursor-pointer shadow-sm"
                disabled={loading}
                title="Generate AI Content"
              >
                {loading ? <Spinner size="small" /> : <Sparkle />}
                
              </button>
            </div>
            <TextEditor value={content} onChange={setContent} />

            <button
              type="button"
              className="cursor-pointer min-w-[150px] inline-flex items-center justify-center px-6 py-2 text-base font-semibold text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? <Spinner size="small" /> : "Publish Article"}
            </button>
          </div>
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
    <div className="w-full border bg-white border-gray-300 rounded-lg shadow-sm">
      <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
        <label htmlFor="editor" className="text-sm font-medium text-gray-700">
          Write your article
        </label> 
      </div>

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
    </div>
  );
}
