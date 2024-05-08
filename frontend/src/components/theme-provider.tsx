"use client";
import { useHotkeys } from "@mantine/hooks";
import { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

const defaultTheme: Theme = "light";

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: defaultTheme,
  toggleTheme: () => {},
});

interface ThemeProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProps) => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  useHotkeys([["mod+L", () => toggleTheme()]]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
