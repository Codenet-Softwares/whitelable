import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, "User Name Must Be At Least 2 Characters")
    .max(25, "User Name Must Not Exceed 25 Characters")
    .matches(/^\S*$/, "User Name Must Not contain spaces")
    .required("User Name Is Required"),
  password: Yup.string()
    .min(6, "Password Must Be At Least 6 Characters")
    .required("Password Is Required"),
});

export const CreateSubAdminSchema = Yup.object().shape({
  userName: Yup.string()
    .min(2, "User Name Must Be At Least 2 Characters")
    .max(25, "User Name Must Not Exceed 25 Characters")
    .matches(/^\S*$/, "User Name Must Not contain spaces")
    .required("Username Is Required"),

  password: Yup.string()
    .min(6, "Password Must Be At Least 6 Characters")
    .required("Password Is Required"),

  permission: Yup.array()
    .min(1, "At Least One Permission Is Required")
    .of(Yup.string().required())
    .required("Permissions Are Required"),
});


export const UpdateCreditRefAndPartnershipSchema = Yup.object().shape({
  amount: Yup.number().required("Amount is required"),
  password: Yup.string()
    .min(6, "Password Must Be At Least 6 Characters")
    .required("Password Is Required"),
});

export const AddWalletBalanceSchema = Yup.object().shape({
  amount: Yup.number().required("Amount Is Required"),
  remarks: Yup.string()
    .min(2, "Remarks Must Be At Least 2 Characters")
    .required("Remarks Is Required"),
  password: Yup.string()
    .min(6, "Password Must Be At Least 6 Characters")
    .required("Password Is Required"),
});

export const AddCashSchema = Yup.object().shape({
  amount: Yup.number().required("Amount Is Required"),
});

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password Is Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password Is Required"),
});

