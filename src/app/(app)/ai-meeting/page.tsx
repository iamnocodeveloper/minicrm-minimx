import { MeetingSummary } from "@/components/ai/meeting-summary";

export default function AIMeetingPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Resumir reunião com IA</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cole a transcrição ou as anotações. A IA organiza em resumo,
          decisões, objeções, próximos passos e sugere tarefas.
        </p>
      </header>
      <MeetingSummary />
    </div>
  );
}
