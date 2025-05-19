import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FlashlightOff, HistoryIcon, HelpCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const { toast } = useToast();

  const handleSignIn = () => {
    toast({
      title: "Coming soon",
      description: "Sign in functionality will be available soon!",
    });
  };

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2">
            <FlashlightOff className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold">Instant Website</h1>
          </a>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/history">
            <a className="hidden md:flex items-center space-x-1 text-sm text-gray-600 hover:text-purple-500 transition">
              <HistoryIcon className="h-4 w-4" />
              <span>History</span>
            </a>
          </Link>
          <Link href="/help">
            <a className="hidden md:flex items-center space-x-1 text-sm text-gray-600 hover:text-purple-500 transition">
              <HelpCircleIcon className="h-4 w-4" />
              <span>Help</span>
            </a>
          </Link>
          <Button
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
          >
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
}
