export function computeAge(birthDate: Date | string, now: Date = new Date()): number {
  const birth = typeof birthDate === "string" ? new Date(birthDate) : birthDate;
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}
