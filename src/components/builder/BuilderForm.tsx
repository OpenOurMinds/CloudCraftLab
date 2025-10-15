import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Database, Cloud, ServerCog, Tags } from "lucide-react";

export type Provider = "aws" | "gcp" | "azure" | "kubernetes";
export type DbType = "postgres" | "mysql";

interface EnvironmentConfig {
  name: string;
  provider: Provider;
  region: string;
  vpcCidr: string;
  publicSubnets: number;
  privateSubnets: number;
  compute: {
    orchestrator: "kubernetes" | "vm";
    instanceType: string;
    nodeCount: number;
    autoscaling: boolean;
  };
  database: {
    type: DbType;
    tier: "dev" | "prod";
    size: "small" | "medium" | "large";
  };
  loadBalancer: {
    type: "public" | "private";
  };
  options: {
    monitoring: boolean;
    logging: boolean;
  };
  tags: Record<string, string>;
}

type Status = "idle" | "planning" | "applying" | "deployed" | "destroying" | "destroyed";

const defaultConfig: EnvironmentConfig = {
  name: "mcp-demo",
  provider: "aws",
  region: "us-east-1",
  vpcCidr: "10.0.0.0/16",
  publicSubnets: 2,
  privateSubnets: 2,
  compute: {
    orchestrator: "kubernetes",
    instanceType: "t3.medium",
    nodeCount: 3,
    autoscaling: true,
  },
  database: {
    type: "postgres",
    tier: "dev",
    size: "small",
  },
  loadBalancer: {
    type: "public",
  },
  options: {
    monitoring: true,
    logging: true,
  },
  tags: {
    project: "mcp",
    env: "demo",
  },
};

export function BuilderForm() {
  const [config, setConfig] = useState<EnvironmentConfig>(defaultConfig);
  const [status, setStatus] = useState<Status>("idle");

  const template = useMemo(() => JSON.stringify({
    apiVersion: "mcp/v1",
    kind: "Environment",
    metadata: { name: config.name, tags: config.tags },
    spec: config,
  }, null, 2), [config]);

  const update = <K extends keyof EnvironmentConfig>(key: K, value: EnvironmentConfig[K]) => {
    setConfig((c) => ({ ...c, [key]: value }));
  };

  const updateTag = (k: string, v: string) => {
    setConfig((c) => ({ ...c, tags: { ...c.tags, [k]: v } }));
  };

  const simulateProvision = () => {
    toast("Provisioning started", { description: "Planning your environment…" });
    setStatus("planning");
    setTimeout(() => {
      setStatus("applying");
      toast("Applying plan", { description: "Creating cloud resources…" });
    }, 1200);
    setTimeout(() => {
      setStatus("deployed");
      toast.success("Environment deployed", { description: "Demo app is ready to deploy." });
    }, 3600);
  };

  const simulateDestroy = () => {
    toast("Destroying environment", { description: "Cleaning up resources…" });
    setStatus("destroying");
    setTimeout(() => {
      setStatus("destroyed");
      toast.success("All resources destroyed");
      setTimeout(() => setStatus("idle"), 800);
    }, 2000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="shadow-elevate">
        <CardHeader>
          <CardTitle className="text-xl">Environment Builder</CardTitle>
          <CardDescription>Template-driven provisioning across clouds with idempotent state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={config.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={config.provider} onValueChange={(v: string) => update("provider", v as Provider)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws">AWS</SelectItem>
                  <SelectItem value="gcp">GCP</SelectItem>
                  <SelectItem value="azure">Azure</SelectItem>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" value={config.region} onChange={(e) => update("region", e.target.value)} />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vpc">VPC CIDR</Label>
              <Input id="vpc" value={config.vpcCidr} onChange={(e) => update("vpcCidr", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pub">Public subnets</Label>
              <Input id="pub" type="number" min={1} max={6} value={config.publicSubnets} onChange={(e) => update("publicSubnets", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priv">Private subnets</Label>
              <Input id="priv" type="number" min={0} max={6} value={config.privateSubnets} onChange={(e) => update("privateSubnets", Number(e.target.value))} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Orchestrator</Label>
              <Select value={config.compute.orchestrator} onValueChange={(v: string) => update("compute", { ...config.compute, orchestrator: v as "kubernetes" | "vm" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select orchestrator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kubernetes">Kubernetes</SelectItem>
                  <SelectItem value="vm">VMs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itype">Instance/Node type</Label>
              <Input id="itype" value={config.compute.instanceType} onChange={(e) => update("compute", { ...config.compute, instanceType: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nodes">Node count</Label>
              <Input id="nodes" type="number" min={1} max={50} value={config.compute.nodeCount} onChange={(e) => update("compute", { ...config.compute, nodeCount: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 items-end">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1.5">
                <Label>Autoscaling</Label>
                <p className="text-sm text-muted-foreground">Enable cluster autoscaler</p>
              </div>
              <Switch checked={config.compute.autoscaling} onCheckedChange={(v) => update("compute", { ...config.compute, autoscaling: v })} />
            </div>
            <div className="space-y-2">
              <Label>Database</Label>
              <Select value={config.database.type} onValueChange={(v: string) => update("database", { ...config.database, type: v as DbType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select database" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Load Balancer</Label>
              <Select value={config.loadBalancer.type} onValueChange={(v: string) => update("loadBalancer", { ...config.loadBalancer, type: v as "public" | "private" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>DB Tier</Label>
              <Select value={config.database.tier} onValueChange={(v: string) => update("database", { ...config.database, tier: v as "dev" | "prod" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dev">Dev</SelectItem>
                  <SelectItem value="prod">Prod</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>DB Size</Label>
              <Select value={config.database.size} onValueChange={(v: string) => update("database", { ...config.database, size: v as "small" | "medium" | "large" })}>
                <SelectTrigger>
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag_env">Tag: env</Label>
              <Input id="tag_env" value={config.tags.env || ""} onChange={(e) => updateTag("env", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Cloud className="h-4 w-4" /> Multi-cloud ready</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><ServerCog className="h-4 w-4" /> Idempotent</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Database className="h-4 w-4" /> DB integrated</div>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground"><Tags className="h-4 w-4" /> Tagged resources</div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-sm">
            Status: {" "}
            <span className="font-medium">
              {status === "idle" && "Idle"}
              {status === "planning" && "Planning"}
              {status === "applying" && "Applying"}
              {status === "deployed" && "Deployed"}
              {status === "destroying" && "Destroying"}
              {status === "destroyed" && "Destroyed"}
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="hero" onClick={simulateProvision} disabled={status === "planning" || status === "applying"}>Provision</Button>
            <Button variant="outline" onClick={simulateDestroy} disabled={status !== "deployed" && status !== "destroying"}>Destroy</Button>
          </div>
        </CardFooter>
      </Card>

      <Card className="shadow-elevate">
        <CardHeader>
          <CardTitle className="text-xl">Template Preview</CardTitle>
          <CardDescription>Generated environment spec (export to Terraform/Helm in next phase).</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-md bg-muted text-sm overflow-auto max-h-[520px]">
{template}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default BuilderForm;
