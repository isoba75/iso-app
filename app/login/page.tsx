import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-10 text-center max-w-sm w-full">
        <div className="text-3xl mb-2">⌂</div>
        <h1 className="text-xl font-bold mb-1">iso-life</h1>
        <p className="text-[#888] text-sm mb-8">Personal command centre</p>
        <form action={async () => { "use server"; await signIn("github"); }}>
          <button
            type="submit"
            className="w-full bg-[#7dd870] text-black font-semibold py-3 rounded-lg hover:opacity-90 transition"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
