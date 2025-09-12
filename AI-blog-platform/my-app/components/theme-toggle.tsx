"use client"

import { useTheme } from "@/contexts/theme-context"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { 
  Sun, 
  Moon, 
  Monitor
} from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <ToggleGroup
      type="single"
      value={theme}
      onValueChange={(value) => value && setTheme(value as "light" | "dark" | "system")}
      className="border rounded-md bg-background/50 backdrop-blur-sm"
    >
      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        return (
          <ToggleGroupItem
            key={themeOption.value}
            value={themeOption.value}
            className="px-2 py-1.5 hover:bg-accent/50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            title={themeOption.label}
          >
            <Icon className="h-4 w-4" />
            <span className="sr-only">{themeOption.label}</span>
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
