import axios from "axios";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const navigate = useNavigate()
    const token = localStorage.getItem("token")
    return (
        <div>
            <Appbar />
            <div className="flex justify-center w-full pt-8">
                <div className="max-w-screen-lg w-full space-y-6">
                    <input
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-md font-medium rounded-md focus:ring-blue-500 focus:border-blue-500 block pl-3 py-2 shadow-sm"
                        placeholder="Enter the title of your article..."
                    />

                    <TextEditor onChange={(e) => setContent(e.target.value)} />
                    <button
                        type="submit"
                        className="cursor-pointer inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        onClick={async () => {
                            const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                                title,
                                content
                            }, {
                                headers: {

                                    Authorization: `Bearer ${token}`
                                }
                            })
                            navigate(`/blog/${response.data.id}`)
                        }}
                    >
                        Publish Article
                    </button>
                </div>
            </div>
        </div>
    );
};
function TextEditor({ onChange }: { onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void }) {
    return (
        <>
            <form className="space-y-4">
                <div className="w-full border border-gray-300 rounded-lg bg-white shadow-sm">
                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
                        <label htmlFor="editor" className="text-sm font-medium text-gray-700">
                            Write your article
                        </label>
                    </div>
                    <div className="px-4 py-2">
                        <textarea
                            onChange={onChange}
                            id="editor"
                            rows={10}
                            className="block w-full px-0 text-base text-gray-800 bg-white border-0 focus:ring-0 focus:outline-none placeholder-gray-400 resize-none"
                            placeholder="Start writing your article here..."
                            required
                        ></textarea>
                    </div>
                </div>


            </form>
        </>
    );
}