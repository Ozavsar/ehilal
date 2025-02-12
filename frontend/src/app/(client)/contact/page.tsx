import ContactContainer from "@/containers/contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function Contact() {
  return <ContactContainer />;
}
