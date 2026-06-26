import type { Stage } from "@prisma/client";

import { ContactCard, type ContactWithMessages } from "./contact-card";

interface StageConfig {
  label: string;
  color: string;
  bg: string;
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
}

interface PipelineColumnProps {
  stage: Stage;
  config: StageConfig;
  contacts: ContactWithMessages[];
  onContactClick: (contact: ContactWithMessages) => void;
}

export function PipelineColumn({ stage, config, contacts, onContactClick }: PipelineColumnProps) {
  const Icon = config.icon;

  return (
    <div
      className="w-64 sm:w-72 flex-shrink-0 rounded-xl overflow-hidden flex flex-col md:w-full md:flex-shrink"
      style={{ 
        backgroundColor: "var(--color-base)",
        border: "1px solid var(--color-edge)",
      }}
    >
      {/* Column Header */}
      <div
        className="p-3 sm:p-4 flex items-center justify-between"
        style={{ 
          backgroundColor: config.bg,
          borderBottom: "1px solid var(--color-edge)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <Icon className="w-4 h-4" style={{ color: config.color }} />
          </div>
          <h3
            className="font-semibold text-sm"
            style={{ color: config.color }}
          >
            {config.label}
          </h3>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            color: config.color,
          }}
        >
          {contacts.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[55vh] md:max-h-[60vh]">
        {contacts.length === 0 ? (
          <div 
            className="py-8 text-center rounded-lg"
            style={{ 
              backgroundColor: "var(--color-void)",
              border: "1px dashed var(--color-edge)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--color-ghost)" }}>
              No contacts
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onContactClick(contact)}
            />
          ))
        )}
      </div>
    </div>
  );
}
