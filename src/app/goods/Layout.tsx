// app/goods/layout.tsx
import AdminNav from "../components/AdminNav";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-slate-900">
        <AdminNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AdminProtectedRoute>
  );
}