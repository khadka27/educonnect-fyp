import { Sun, Moon } from "lucide-react"
import { Switch } from "src/components/ui/switch"

const DarkModeToggle = ({ theme, toggleDarkMode }:any) => {
  return (
    <div className="flex items-center">
      <Sun className={`h-4 w-4 ${theme === "light" ? "text-yellow-500" : "text-gray-400"}`} />
      <Switch checked={theme === "dark"} onCheckedChange={toggleDarkMode} className="mx-2" />
      <Moon className={`h-4 w-4 ${theme === "dark" ? "text-blue-400" : "text-gray-400"}`} />
    </div>
  )
}

export default DarkModeToggle

