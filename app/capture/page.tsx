import { CaptureClient } from "./capture-client";

export default function CapturePage() {
  return (
    <div className="@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Capture</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Write or speak. Triage agent classifies and routes within ~30s. View results in <a href="/feed" className="underline">Feed</a>.
        </p>
      </div>
      <CaptureClient />
    </div>
  );
}
