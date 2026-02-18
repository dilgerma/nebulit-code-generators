import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { useReservationTemplates, useSaveReservationTemplate } from "@/hooks/api/useReservationTemplates";
import { Skeleton } from "@/components/ui/skeleton";

const TEMPLATE_VARIABLES = [
  { key: "name", label: "Name" },
  { key: "from", label: "From" },
  { key: "to", label: "To" },
  { key: "persons", label: "Persons" },
  { key: "location", label: "Location" },
];

export function ReservationTemplates() {
  const { data: templates = [], isLoading } = useReservationTemplates();
  const saveMutation = useSaveReservationTemplate();

  const [emailTemplate, setEmailTemplate] = useState("");
  const [phoneTemplate, setPhoneTemplate] = useState("");
  const [focusedField, setFocusedField] = useState<"email" | "phone" | null>(null);

  const emailRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef = useRef<HTMLTextAreaElement>(null);

  // Load templates when data is fetched
  useEffect(() => {
    const emailTpl = templates.find(t => t.templateType === "EMAIL");
    const phoneTpl = templates.find(t => t.templateType === "PHONE");

    if (emailTpl) setEmailTemplate(emailTpl.template);
    if (phoneTpl) setPhoneTemplate(phoneTpl.template);
  }, [templates]);

  const insertVariable = (variable: string) => {
    const insertion = `{${variable}}`;

    if (focusedField === "email" && emailRef.current) {
      const textarea = emailRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = emailTemplate.slice(0, start) + insertion + emailTemplate.slice(end);
      setEmailTemplate(newValue);

      // Restore cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    } else if (focusedField === "phone" && phoneRef.current) {
      const textarea = phoneRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = phoneTemplate.slice(0, start) + insertion + phoneTemplate.slice(end);
      setPhoneTemplate(newValue);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertion.length, start + insertion.length);
      }, 0);
    } else {
      toast.error("Please select a text field first");
    }
  };

  const handleSaveEmail = async () => {
    const existingTemplate = templates.find(t => t.templateType === "EMAIL");
    const templateId = existingTemplate?.templateId || `tpl-email-${Date.now()}`;

    try {
      await saveMutation.mutateAsync({
        templateId,
        templateType: "EMAIL",
        template: emailTemplate,
      });
      toast.success("Email template saved");
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSavePhone = async () => {
    const existingTemplate = templates.find(t => t.templateType === "PHONE");
    const templateId = existingTemplate?.templateId || `tpl-phone-${Date.now()}`;

    try {
      await saveMutation.mutateAsync({
        templateId,
        templateType: "PHONE",
        template: phoneTemplate,
      });
      toast.success("SMS template saved");
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Variable buttons */}
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_VARIABLES.map((variable) => (
            <Button
              key={variable.key}
              variant="outline"
              size="sm"
              onClick={() => insertVariable(variable.key)}
              className="text-xs"
            >
              {variable.label}
            </Button>
          ))}
        </div>

        {/* Templates grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Email template */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Email</Label>
            </div>
            <Textarea
              ref={emailRef}
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              onFocus={() => setFocusedField("email")}
              placeholder="Enter email template..."
              className="min-h-[150px] resize-none"
            />
            <Button
              onClick={handleSaveEmail}
              disabled={saveMutation.isPending}
              className="w-full"
            >
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>

          {/* Phone/SMS template */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Label>SMS</Label>
            </div>
            <Textarea
              ref={phoneRef}
              value={phoneTemplate}
              onChange={(e) => setPhoneTemplate(e.target.value)}
              onFocus={() => setFocusedField("phone")}
              placeholder="Enter SMS template..."
              className="min-h-[150px] resize-none"
            />
            <Button
              onClick={handleSavePhone}
              disabled={saveMutation.isPending}
              className="w-full"
            >
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
