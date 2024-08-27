"use client";
import { z, ZodErrorMap } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import CustomButton from "@/components/CustomButton";
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

const customErrorMap: ZodErrorMap = (issue, ctx) => {
  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return { message: "This field is required. Please provide a value." };
  }
  if (issue.code === "too_small") {
    return { message: `Please enter at least ${issue.minimum} characters.` };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter a username with at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  subject: z
    .string()
    .min(5, "Subject is required. Please provide the subject."),
  message: z
    .string()
    .min(5, "Your message should contain at least 5 characters."),
});

const formFields = [
  { name: "name", label: "Name", placeholder: "Your name", type: "input" },
  {
    name: "email",
    label: "Email",
    placeholder: "example@domain.com",
    type: "input",
  },
  { name: "subject", label: "Subject", placeholder: "Subject", type: "input" },
  {
    name: "message",
    label: "Message",
    placeholder: "Your message",
    type: "textarea",
  },
];

export default function FormSection({
  className = "",
}: {
  className?: string;
}) {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (data: Record<string, string>) => {
    console.log(data);
  };

  return (
    <section className={`${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {formFields.slice(0, 3).map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof typeof formSchema._type}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={field.placeholder}
                        {...formField}
                        className="rounded-3xl bg-muted px-4 py-2 text-lg focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors[field.name]?.message?.toString()}
                    </FormMessage>
                  </FormItem>
                )}
              />
            ))}
          </div>

          <div>
            {formFields.slice(3).map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name as keyof typeof formSchema._type}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={field.placeholder}
                        {...formField}
                        className="rounded-3xl bg-muted px-4 py-2 text-lg focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors[field.name]?.message?.toString()}
                    </FormMessage>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <CustomButton type="submit" text="send message" />
        </form>
      </Form>
    </section>
  );
}
