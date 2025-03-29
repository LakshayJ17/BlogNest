export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    return <div className="h-screen flex justify-center flex-col">
        <div className="flex justify-center">
            <div>
                <div className="text-3xl font-extrabold">
                    Create an account
                </div>
                <div>
                    Already have an account ? Login
                </div>
            </div>
        </div>

    </div>
}