import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import type { VivaQA } from "@/lib/lab/types";

/** Renders viva questions with answers hidden inside collapsible accordions. */
export default function VivaAccordion({ items }: { items: VivaQA[] }) {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          value={`viva-${i}`}
          className="border border-border rounded-lg px-4 bg-card"
        >
          <AccordionTrigger className="text-left hover:no-underline py-3">
            <span className="flex items-start gap-2 text-sm font-medium">
              <HelpCircle className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                <span className="text-primary font-semibold mr-1">Q{i + 1}.</span>
                {item.q}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-6">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
