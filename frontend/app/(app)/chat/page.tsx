"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MessageCircle } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="stagger">
      <PageTitle icon={MessageCircle}>Chat</PageTitle>
      <Card>
        <SectionHeading eyebrow="Assistant" title="Ask Plate" />
        <ChatInterface />
      </Card>
    </div>
  );
}
