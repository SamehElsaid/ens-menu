export interface SearchFormData {
  speciality: { label: string; value: string } | null;
  state: { label: string; value: string } | null;
  city: { label: string; value: string } | null;
  search: string;
}
