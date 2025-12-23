import { RegisterForm } from '@/features/auth/components/register-form';

export function RegisterPage() {
  return (
    <div className="container mx-auto max-w-md px-4 py-8 sm:py-16">
      <div className="bg-card rounded-lg border p-4 shadow-sm sm:p-8">
        <h1 className="mb-4 text-center text-xl font-bold sm:mb-6 sm:text-2xl">
          Sign Up
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
