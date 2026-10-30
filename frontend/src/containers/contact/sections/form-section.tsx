"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CustomButton from "@/components/custom-button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendContactMessage } from "@/lib/actions/contact";
import {
  CONTACT_HONEYPOT_FIELD,
  CONTACT_LIMITS,
  contactFormSchema,
  type ContactFormField,
  type ContactFormState,
  type ContactFormValues,
} from "@/lib/validations/contact";
import { cn } from "@/lib/utils";

const defaultValues: ContactFormValues = { name: "", email: "", subject: "", message: "" };
const initialState: ContactFormState = { status: "idle", message: "" };

// sonner loads with the first toast instead of with the page
const Toaster = dynamic(() => import("@/components/ui/sonner").then((mod) => mod.Toaster), {
  ssr: false,
});

const inputFields = [
  { name: "name", label: "Name", placeholder: "Your name", type: "text", autoComplete: "name" },
  {
    name: "email",
    label: "Email",
    placeholder: "example@domain.com",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "subject",
    label: "Subject",
    placeholder: "Subject",
    type: "text",
    autoComplete: "off",
    // Full row wherever name and email share one
    className: "sm:col-span-2 md:col-span-1 lg:col-span-2",
  },
] as const;

export default function FormSection({ className = "" }: { className?: string }) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });
  const [toasterMounted, setToasterMounted] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToasterMounted(true);
    // The Toaster replays toasts created before it subscribed, so the order of the two loads doesn't matter
    import("sonner")
      .then(({ toast }) => toast[type](message))
      // Without the chunk the status line below still reports the result
      .catch(() => {});
  };

  const [state, formAction, isPending] = useActionState(
    async (prevState: ContactFormState, formData: FormData): Promise<ContactFormState> => {
      let result: ContactFormState;
      try {
        result = await sendContactMessage(prevState, formData);
      } catch {
        // Network failure or a stale deployment; keep the visitor's input
        result = {
          status: "error",
          message: "Something went wrong. Please check your connection and try again.",
        };
      }

      if (result.status === "success") {
        showToast("success", result.message);
        form.reset(defaultValues);
      } else {
        showToast("error", result.message);
        // Show server-side validation errors next to the matching fields
        const fieldErrors = Object.entries(result.fieldErrors ?? {}) as [
          ContactFormField,
          string[],
        ][];
        fieldErrors.forEach(([name, messages], index) => {
          form.setError(name, { type: "server", message: messages[0] }, { shouldFocus: !index });
        });
      }
      return result;
    },
    initialState,
  );

  // Validate on the client first, then hand the native form data (incl. honeypot) to the action
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    // currentTarget is cleared after dispatch, so grab the form before async validation
    const formElement = event.currentTarget;
    form.handleSubmit(() => {
      if (isPending) return;
      const formData = new FormData(formElement);
      startTransition(() => formAction(formData));
    })(event);
  };

  return (
    // @starting-style fade-up (Tailwind `starting:`): visible without JS, still for reduced motion
    <section
      className={cn(
        "ease-emphasized-decelerate transition-[opacity,translate] duration-500 motion-reduce:transition-none starting:translate-y-2 starting:opacity-0",
        className,
      )}
    >
      {/* The form in a card, so it reads as one pane beside the channel list card. Not an interactive
          card: the card-wide state layer stays off while the button is hovered or focused */}
      <Card className="p-4 sm:p-6">
        <Form {...form}>
          <form action={formAction} onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
            {/* M3: explain the asterisk once, before the fields */}
            <p className="type-body-small text-on-surface-variant">
              Fields marked with an asterisk (*) are required.
            </p>
            {/* Name and email side by side when the form is wide enough (single pane or large) */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {inputFields.map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: formField }) => (
                    <FormItem className={"className" in field ? field.className : undefined}>
                      <FormLabel required>{field.label}</FormLabel>
                      <FormControl>
                        <Input
                          type={field.type}
                          autoComplete={field.autoComplete}
                          placeholder={field.placeholder}
                          required
                          aria-required
                          {...formField}
                          maxLength={CONTACT_LIMITS[field.name].max}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel required>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your message"
                      required
                      aria-required
                      {...formField}
                      rows={5}
                      maxLength={CONTACT_LIMITS.message.max}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Honeypot: hidden from visitors and assistive tech; submissions that fill it are dropped */}
            <div aria-hidden="true" className="sr-only">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name={CONTACT_HONEYPOT_FIELD}
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <div className="flex w-full flex-col items-start gap-4 max-sm:items-center">
              <CustomButton
                type="submit"
                text={isPending ? "Sending..." : "Send Message"}
                disabled={isPending}
                aria-busy={isPending}
              />
              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "type-body-medium",
                  state.status === "error" ? "text-error" : "text-on-surface-variant",
                )}
              >
                {/* Cleared while sending, so a repeated message is announced again */}
                {!isPending && state.message}
              </p>
            </div>
          </form>
        </Form>
      </Card>
      {/* Visual only: the status line above is what screen readers announce. inert keeps the toast out of
          the accessibility tree and focus order (aria-hidden alone would leave the focusable toast reachable) */}
      {toasterMounted && (
        <div inert>
          <Toaster />
        </div>
      )}
    </section>
  );
}
