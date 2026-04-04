/**
 * RecurrenceDisplay Component
 * Display recurrence information for a task
 */

import React from "react";
import { RecurrenceType } from "@/lib/api/types";
import { RECURRENCE_TYPES } from "@/lib/utils/constants";

interface RecurrenceDisplayProps {
  recurrenceType: RecurrenceType;
  recurrenceInterval?: number | null;
}

export const RecurrenceDisplay: React.FC<RecurrenceDisplayProps> = ({
  recurrenceType,
  recurrenceInterval,
}) => {
  if (recurrenceType === "NONE" || !recurrenceType) {
    return <span className="text-sm text-gray-500">Does not repeat</span>;
  }

  const intervalLabel = () => {
    switch (recurrenceType) {
      case "DAILY":
        return recurrenceInterval && recurrenceInterval > 1
          ? `Every ${recurrenceInterval} days`
          : "Daily";
      case "WEEKLY":
        return recurrenceInterval && recurrenceInterval > 1
          ? `Every ${recurrenceInterval} weeks`
          : "Weekly";
      case "MONTHLY":
        return recurrenceInterval && recurrenceInterval > 1
          ? `Every ${recurrenceInterval} months`
          : "Monthly";
      default:
        return RECURRENCE_TYPES[recurrenceType];
    }
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
      <span>🔁</span>
      <span>{intervalLabel()}</span>
    </div>
  );
};
