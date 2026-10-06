import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="border-b">
      <div className="container flex-1 items-start">
        <aside className="fixed top-14 z-30 -ml-2">
          <ScrollArea className="h-full py-6 pr-6 lg:py-8">
            <div className="w-full">
              <div className="pb-4">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </ScrollArea>
        </aside>
        <main className="relative py-6 lg:gap-10 lg:py-8">
          <div className="mx-auto w-full min-w-0">
            <div className="mb-4 flex items-center space-x-1 text-sm leading-none text-muted-foreground">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="flex items-center space-x-2 pt-4">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="pb-12 pt-8">
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
