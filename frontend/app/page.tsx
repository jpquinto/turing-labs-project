import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  const sections = [
    {
      title: "Trials",
      description: "Manage taste test trials and experiments",
      href: "/trials",
      icon: "🧪",
      stats: "View all trials"
    },
    {
      title: "Recipes",
      description: "Sugar reduction recipe formulations",
      href: "/recipes",
      icon: "📝",
      stats: "View all recipes"
    },
    {
      title: "Participants",
      description: "Trial participants and their assignments",
      href: "/participants",
      icon: "👥",
      stats: "View all participants"
    },
    {
      title: "Submissions",
      description: "Participant taste test submissions and scores",
      href: "/submissions",
      icon: "📊",
      stats: "View all submissions"
    },
  ];

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Welcome to the Turing Labs trial management system
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {sections.map((section) => (
            <Link key={section.href} href={section.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{section.title}</CardTitle>
                    <span className="text-4xl">{section.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                    {section.description}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {section.stats} →
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
