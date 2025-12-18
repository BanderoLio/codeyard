import { LoginForm } from '@/features/auth/components/login-form';

export function LoginPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Login</h1>
        <LoginForm />
      </div>
    </div>
  );
}
