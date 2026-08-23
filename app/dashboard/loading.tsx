export default function Loading() {
    return (
        <main className="min-h-screen bg-[#F4F6F5] text-[#0C2340]">

            {/* Header */}
            <div className="bg-[#071522]">
                <div className="mx-auto max-w-md px-5 pb-8 pt-9">

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="h-3 w-24 animate-pulse rounded bg-gray-700" />
                            <div className="mt-2 h-2 w-36 animate-pulse rounded bg-gray-800" />
                        </div>

                        <div className="h-10 w-16 animate-pulse rounded-lg bg-gray-800" />
                    </div>

                    <div className="mt-8">
                        <div className="h-3 w-24 animate-pulse rounded bg-gray-700" />

                        <div className="mt-3 h-9 w-40 animate-pulse rounded bg-gray-800" />

                        <div className="mt-4 h-3 w-44 animate-pulse rounded bg-gray-700" />
                    </div>

                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-md px-5 py-6">

                {/* Community card */}
                <div className="mb-7 overflow-hidden rounded-2xl bg-white shadow-sm">
                    <div className="h-1 bg-[#16803A]" />

                    <div className="p-5">
                        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
                        <div className="mt-3 h-4 w-64 animate-pulse rounded bg-gray-200" />
                    </div>
                </div>

                {/* Quick Access */}
                <div className="mb-4">
                    <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">

                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="rounded-2xl bg-white p-5 shadow-sm"
                        >
                            <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-200" />

                            <div className="mt-4 h-4 w-20 animate-pulse rounded bg-gray-200" />

                            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
                        </div>
                    ))}

                </div>

                {/* Upcoming section */}
                <div className="mt-9">

                    <div className="mb-4 h-5 w-40 animate-pulse rounded bg-gray-200" />

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                        <div className="h-24 animate-pulse bg-gray-200" />

                        <div className="p-5">

                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

                            <div className="mt-3 h-3 w-full animate-pulse rounded bg-gray-100" />

                            <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-gray-100" />

                            <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-gray-200" />

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}