import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-6 glass-panel p-12 rounded-3xl border-destructive/20 max-w-md">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
        <h1 className="text-4xl font-display font-bold">404</h1>
        <p className="text-muted-foreground text-lg">System sector not found. Return to main terminal.</p>
        <Link href="/">
          <Button variant="outline" className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            Initialize Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
