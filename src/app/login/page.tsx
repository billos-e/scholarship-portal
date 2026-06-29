import Image from "next/image";

import { LoginForm } from "./login-form";
import { TestCredentials } from "./test-credentials";

const FEATURES = [
  {
    title: "Semester submissions",
    description:
      "Submit tuition payment requests and semester reports in one flow.",
  },
  {
    title: "Track your progress",
    description:
      "Follow your request from submission through review, approval, and payment.",
  },
  {
    title: "Secure access",
    description:
      "Your documents and bank details are protected behind authenticated access.",
  },
];

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col">
        <Image
          src="/images/login-hero.jpg"
          alt=""
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10 text-primary-foreground">
          <div>
            <div className="mb-8 flex size-12 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur">
              SP
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Scholarship Portal
            </h1>
            <p className="mt-2 max-w-md text-primary-foreground/90">
              Manage semester tuition requests and academic reports for
              scholarship students.
            </p>
          </div>

          <ul className="space-y-6">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="max-w-sm">
                <p className="font-semibold">{feature.title}</p>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {feature.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              SP
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Scholarship Portal
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to continue.
            </p>
          </div>

          <LoginForm />
          <TestCredentials />
        </div>
      </div>
    </div>
  );
}
