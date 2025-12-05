"use client";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";

export default function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  const handleThemeSwitch = () => {
    if (currentTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <>
      <button
        className="h-6 w-6 hover:scale-110 hover:text-brand cursor-pointer transition-all duration-300"
        onClick={handleThemeSwitch}
      >
        {currentTheme === "light" ? (
          <MoonIcon className="w-5 h-5" />
        ) : (
          <SunIcon className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
