interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-700/50 ${className}`}
      {...props}
    />
  );
}

// Chat list item skeleton
export function ChatListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-lg transition-colors">
      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-3 w-12 flex-shrink-0" />
    </div>
  );
}

// Message skeleton
export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex w-full mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[70%] ${isOwn ? "ml-auto" : "mr-auto"}`}>
        <div className={`rounded-lg p-3 ${isOwn ? "bg-[#FA266D]" : "bg-gray-700"}`}>
          <Skeleton className="h-4 w-48 mb-1 bg-gray-600" />
          <Skeleton className="h-3 w-16 bg-gray-600" />
        </div>
      </div>
    </div>
  );
}

// Multiple chat list skeletons
export function ChatListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <ChatListItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Multiple message skeletons
export function MessagesSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} isOwn={i % 3 === 0} />
      ))}
    </div>
  );
}

// Profile page skeleton
export function ProfilePageSkeleton() {
  return (
    <div className="min-h-screen bg-[#1F1B2C] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Skeleton className="h-8 w-48 mb-6" />
        
        {/* Profile Image Section */}
        <div className="bg-[#2A243E] rounded-lg p-6">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
          <Skeleton className="h-6 w-40 mx-auto" />
        </div>
        
        {/* Form Sections */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-[#2A243E] rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Profile detail page skeleton
export function ProfileDetailSkeleton() {
  return (
    <div className="h-full bg-[#1F1B2C] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Image Carousel */}
        <Skeleton className="h-96 w-full rounded-lg" />
        
        {/* Profile Info */}
        <div className="bg-[#2A243E] rounded-lg p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>
        
        {/* Services */}
        <div className="bg-[#2A243E] rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile card skeleton (for overview page)
export function ProfileCardSkeleton() {
  return (
    <div className="bg-[#2A243E] rounded-lg overflow-hidden">
      <Skeleton className="h-64 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2 mt-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-16 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Profile list skeleton (for overview page)
export function ProfileListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}


