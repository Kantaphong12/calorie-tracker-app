export default interface CalorieItem {
  ID?: number; //optional
  user_id: number | undefined;
  date: string | undefined;
  foodname: string;
  calories: number | null;
  serving_size: number | null;
  carbs: number | null;
  protein: number | null;
  fat: number | null;
  leucine: number | null;
  magnesium: number | null;
  zinc: number | null;
}
export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  cholesterol: number;
  leucine: number;
  sodium: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  vitaminD: number;
  vitaminB12: number;
  water: number;
}
export interface FoodItem {
  id: number;
  name: string;
  serving_size: string;
  nutrition: NutritionInfo;
}
export //DataTable
type RowData = {
  foodname: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
  sodium: number;
  calcium: string;
  iron: string;
};
export type Column = {
  name: string;
  label: string;
  required?: boolean;
  align?: 'left' | 'right' | 'center';
  field: string | ((row: RowData) => string | number);
  format?: (val: string | number) => string;
  sortable?: boolean;
  sort?: (a: string | number, b: string | number) => number;
};

export interface listNameFood {
  id: number;
  name: string;
}
export interface UserCals {
  ID: number | null;
  Name: string | null;
  Email: string | null;
  Password: string | null;
  Age: number | null;
  Fat: string | number | null;
  Weight: string | number | null;
  Height: number | null;
  Gender: string | null;
  ActivityLevel: number | null;
  TargetCals: number | null;
}
