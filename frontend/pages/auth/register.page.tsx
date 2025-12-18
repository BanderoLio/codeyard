import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-16">
      <div className="bg-card rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign Up</h1>
        <RegisterForm />
      </div>
    </div>
  );
}
