// Create a dedicated file for store initialization to ensure consistent initial values
import { map } from 'nanostores';

// Create the store with explicit initial values
export const listUIState = map({
  isLoading: false, // Explicitly initialize as false, not null or undefined
  error: null
});

// Export other functions or utilities as needed