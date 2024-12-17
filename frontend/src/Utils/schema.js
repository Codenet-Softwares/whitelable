import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, "User Name must be at least 2 characters")
    .max(25, "User Name must not exceed 25 characters")
    .matches(/^\S*$/, "User Name must not contain spaces")
    .required("User Name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const CreateSubAdminSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, "User Name must be at least 2 characters")
    .max(25, "User Name must not exceed 25 characters")
    .matches(/^\S*$/, "User Name must not contain spaces")
    .required("User Name is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const UpdateCreditRefAndPartnershipSchema = Yup.object().shape({
  amount: Yup.number().required("Amount is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const AddWalletBalanceSchema = Yup.object().shape({
  amount: Yup.number().required("Amount is required"),
  remarks: Yup.string()
    .min(2, "Remarks must be at least 2 characters")
    .required("Remarks is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const AddCashSchema = Yup.object().shape({
  amount: Yup.number().required("Amount is required"),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

