import { ref, reactive } from 'vue';

export function useFormValidation(rules) {
  const errors = reactive({});
  const isValid = ref(true);

  const validate = (data) => {
    let valid = true;
    for (const key in errors) {
      delete errors[key];
    }
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        if (!rule.validator(data[field])) {
          errors[field] = rule.message;
          valid = false;
          break; // Stop at first error for this field
        }
      }
    }
    isValid.value = valid;
    return valid;
  };

  const clearErrors = () => {
    for (const key in errors) {
      delete errors[key];
    }
    isValid.value = true;
  };

  return { errors, isValid, validate, clearErrors };
}
