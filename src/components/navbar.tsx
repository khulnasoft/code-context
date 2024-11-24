import { Code, LogOut, MessageSquare, Moon, Settings, Sun, Github } from "lucide-react";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navbar({ onSettingsClick }: { onSettingsClick: () => void }) {
  const [darkMode, setDarkMode] = useState(false)
  
  useEffect(() => {
    // Check for user's preference in localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (darkMode) {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('darkMode', 'false')
    } else {
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    }
  }
  
  return (
    <nav className="bg-background border-b sticky top-0 z-10">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Code className="h-8 w-8 text-primary" />
              <span className="ml-2 text-2xl font-bold text-primary">CodeContext</span>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="sm" className="gap-2" onClick={onSettingsClick}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Link href="https://github.fra1.qualtrics.com/jfe/form/SV_cYjJCFvBTu0xyqG" target="_blank" rel="noopener noreferrer" className=" hover:text-foreground mr-4">
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="https://github.com/khulnasoft/code-context" target="_blank" rel="noopener noreferrer" className="border-transparent hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
            <Button variant="ghost" onClick={() => signOut()} className="hover:text-foreground">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}