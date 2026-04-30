import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="rounded-xl p-10 text-center max-w-sm w-full bg-card border border-border">
        <div className="text-3xl mb-2">⌂</div>
        <h1 className="text-xl font-bold mb-1">iso-life</h1>
        <p className="text-sm mb-8 text-muted-foreground">Personal life OS</p>
        <form action={async () => { "use server"; await signIn("github", { redirectTo: "/today" }); }}>
          <button
            type="submit"
            className="w-full font-semibold py-3 rounded-lg hover:opacity-90 transition bg-primary text-primary-foreground"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
