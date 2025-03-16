export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
// validate email format
export const passwordRegex =
  /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/; // The password must be at least 8 characters, special characters, uppercase and lowercase letters, and numbers.
export const onlyLettersRegex = /^[a-zA-ZñÑ ]+$/; //This field must not have numeric characters or special characters
export const onlyNumbersRegex = /^[0-9 ]+$/; //This field should only have numeric characters.
export const onlyNumbersRegexWithoutZero = /^[1-9]+$/; //This field should only have numeric characters except 0.
export const onlyLettersAndNumbers = /^[a-zA-ZñÑ0-9]*$/; //This field allows numbers and letters but not special characters
export const onlyLettersNumbersAndSpace = /^[a-zA-ZñÑ0-9 ]*$/; //This field allows numbers and letters and space but not special characters
