"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CustomButton from "@/components/custom-button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
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
import { motion } from "motion/react";

const defaultValues: ContactFormValues = { name: "", email: "", subject: "", message: "" };
const initialState: ContactFormState = { status: "idle", message: "" };

const inputFields = [
  { name: "name", label: "Name", placeholder: "Your name", type: "text", autoComplete: "name" },
  {
    name: "email",
    label: "Email",
    placeholder: "example@domain.com",
    type: "email",
    autoComplete: "email",
  },
  { name: "subject", label: "Subject", placeholder: "Subject", type: "text", autoComplete: "off" },
] as const;

export default function FormSection({ className = "" }: { className?: string }) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

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
        toast.success(result.message);
        form.reset(defaultValues);
      } else {
        toast.error(result.message);
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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`${className}`}
    >
      <Form {...form}>
        <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {inputFields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground ml-1 text-xs font-bold tracking-wide uppercase">
                      {field.label}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={field.type}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        required
                        {...formField}
                        maxLength={CONTACT_LIMITS[field.name].max}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage className="ml-1 text-xs" />
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
                <FormLabel className="text-muted-foreground ml-1 text-xs font-bold tracking-wide uppercase">
                  Message
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Your message"
                    required
                    {...formField}
                    rows={5}
                    maxLength={CONTACT_LIMITS.message.max}
                    className="mt-1 resize-none"
                  />
                </FormControl>
                <FormMessage className="ml-1 text-xs" />
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

          <div className="flex w-full flex-col gap-4 max-sm:items-center">
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
                "ml-1 text-sm",
                state.status === "error" ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {/* Cleared while sending, so a repeated message is announced again */}
              {!isPending && state.message}
            </p>
          </div>
        </form>
      </Form>
      {/* Visual only: the status line above is what screen readers announce. inert keeps the toast out of
          the accessibility tree and focus order (aria-hidden alone would leave the focusable toast reachable) */}
      <div inert>
        <Toaster />
      </div>
    </motion.section>
  );
}
