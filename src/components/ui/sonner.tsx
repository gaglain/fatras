
import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-none dark:group-[.toaster]:bg-gray-800 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-gray-700",
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-900 group-[.toast]:hover:bg-gray-200 dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-100",
        },
      }}
      style={{
        '--normal-bg': '#ffffff',
        '--normal-border': '#e5e7eb',
        '--normal-text': '#111827',
      } as React.CSSProperties}
      {...props}
    />
  )
}

export { Toaster, toast }
