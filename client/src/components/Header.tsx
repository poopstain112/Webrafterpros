import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, HistoryIcon, HelpCircleIcon, HomeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  currentPath?: string;
}

export default function Header({ currentPath = "/" }: HeaderProps) {
  const { toast } = useToast();

  const handleSignIn = () => {
    toast({
      title: "Coming soon",
      description: "Sign in functionality will be available soon!",
    });
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">Instant Website</h1>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/" className={`flex items-center space-x-1 text-sm ${isActive('/') ? 'text-blue-500 font-medium' : 'text-gray-600 hover:text-blue-500'} transition-colors duration-200`}>
            <HomeIcon className="h-4 w-4" />
            <span>Create</span>
          </Link>
          <Link href="/history" className={`hidden md:flex items-center space-x-1 text-sm ${isActive('/history') ? 'text-blue-500 font-medium' : 'text-gray-600 hover:text-blue-500'} transition-colors duration-200`}>
            <HistoryIcon className="h-4 w-4" />
            <span>History</span>
          </Link>
          <Link href="/help" className={`hidden md:flex items-center space-x-1 text-sm ${isActive('/help') ? 'text-blue-500 font-medium' : 'text-gray-600 hover:text-blue-500'} transition-colors duration-200`}>
            <HelpCircleIcon className="h-4 w-4" />
            <span>Help</span>
          </Link>
          <Button
            onClick={handleSignIn}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-all duration-200"
          >
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  );
}
