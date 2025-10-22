import BuilderForm from "@/components/builder/BuilderForm";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

const Index = () => {
  const builderRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-gradient-primary">
          Customized Multi-Cloud Platform Environment Builder
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Provision isolated, customizable cloud environments across AWS, GCP, Azure or Kubernetes. Deploy a lightweight demo app with idempotent, template-driven workflows.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Button variant="hero" size="lg" onClick={() => builderRef.current?.scrollIntoView({ behavior: "smooth" })}>
            Start Building <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#docs" aria-label="Read docs">Read the plan</a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto pb-24 space-y-16">
        <section ref={builderRef} aria-labelledby="builder-heading" className="scroll-mt-24">
          <h2 id="builder-heading" className="text-2xl font-semibold mb-6">Build your environment</h2>
          <BuilderForm />
        </section>

        <section id="docs" aria-labelledby="docs-heading" className="space-y-4">
          <h2 id="docs-heading" className="text-2xl font-semibold">Architecture & Phases</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Phase 1: Core builder logic with one provider (Terraform init/plan/apply).</li>
            <li>Phase 2: Multi-cloud integration, customization & robust state management.</li>
            <li>Phase 3: Demo app (containerized) and deployment integration.</li>
            <li>Phase 4: Web UI/CLI for create, list, update, delete.</li>
            <li>Phase 5: Testing & comprehensive docs.</li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Index;
