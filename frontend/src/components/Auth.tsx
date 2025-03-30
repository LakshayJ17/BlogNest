import { SignupInput } from "@lakshayj17/common-app"
import { ChangeEvent, useState } from "react"
import { Link } from "react-router-dom"

export const Auth = ({ type }: { type: "signup" | "signin" }) => {

    // Type of inputs are specified using the npm package created using common folder
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: "",
    })

    return <div className="h-screen flex justify-center flex-col ">
        <div className="flex justify-center">
            <div>
                <div className="px-10">
                    <div className="text-3xl font-extrabold">
                        Create an account
                    </div>
                    <div className="text-slate-600">
                       {type === "signin" ? "Already have an account ?" : "Create an account"} 
                        <Link className="pl-2 underline" to={type === "signin" ? "/signup" : "/signin"}>
                        {type === "signin" ? "Sign up" : "Log in"}
                        </Link>
                    </div>
                </div>

                <div className="py-5 space-y-5">
                    <LabeledInput label="Name" placeholder="Enter your name" onChange={(e) => {
                        // When the input changes, update the state with the new value
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} />
                    <LabeledInput label="Email" placeholder="Enter your email" onChange={(e) => {
                        // When the input changes, update the state with the new value
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} />
                    <LabeledInput label="Password" type={"password"} placeholder="Enter password" onChange={(e) => {
                        // When the input changes, update the state with the new value
                        setPostInputs({
                            ...postInputs,
                            name: e.target.value
                        })
                    }} />
                    <button type="button" className="mt-8 w-full text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">{type === "signup" ? "Sign up" :  "Sign In"}</button>
                </div>
            </div>


        </div>

    </div>
}

interface LabeledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;

}

function LabeledInput({ label, placeholder, onChange, type }: LabeledInputType) {
    return <div>
        <label className="block mb-2 text-sm font-semibold text-black ">{label}</label>
        <input
            onChange={onChange}
            type={type || "text"}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
            placeholder={placeholder}
            required
        />
    </div>
}