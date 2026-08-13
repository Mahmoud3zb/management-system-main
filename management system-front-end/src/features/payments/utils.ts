/**
 * Null-safe helper for extracting student ID from string, populated User object, or unknown input.
 */
export const getStudentId = (studentID: unknown): string => {
  if (!studentID) return "";

  if (
    typeof studentID === "object" &&
    studentID !== null &&
    "_id" in studentID
  ) {
    const obj = studentID as { _id: unknown };
    return obj._id ? String(obj._id) : "";
  }

  return String(studentID);
};

/**
 * Reusable payment status evaluation helper.
 * Priority:
 * 1. If record.isPaid === true -> paid
 * 2. If record.isPaid === false -> unpaid
 * 3. Otherwise determine from paidAt string presence (paidAt exists and paidAt !== "-")
 */
export const isPaymentRecordPaid = (record: unknown): boolean => {
  if (!record || typeof record !== "object") return false;

  const item = record as {
    isPaid?: boolean;
    paidAt?: string | null;
  };

  if (item.isPaid === true) return true;
  if (item.isPaid === false) return false;

  return Boolean(item.paidAt && item.paidAt !== "-");
};
