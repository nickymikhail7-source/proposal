import Link from "next/link"
import { ArrowRight, CheckCircle2, FileText, Layout, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-gray-900">ProposalSpace</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Create beautiful proposals that{" "}
              <span className="text-indigo-600">win more deals</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Stop sending static PDFs. Build interactive, trackable proposals that
              your clients will love. Close deals faster with real-time analytics.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:shadow-xl"
              >
                Start for Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-gray-200 bg-white px-8 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50"
              >
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Layout className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Drag & Drop Editor
                </h3>
                <p className="text-gray-600">
                  Create professional proposals in minutes with our intuitive
                  block-based editor. No design skills needed.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Client Interaction
                </h3>
                <p className="text-gray-600">
                  Let clients comment directly on specific sections. Answer
                  questions and resolve objections in real-time.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Smart Analytics
                </h3>
                <p className="text-gray-600">
                  Know exactly when clients open your proposal and which sections
                  they spend the most time on.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2024 ProposalSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
