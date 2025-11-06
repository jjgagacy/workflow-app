export default () => ({
    loginMaxErrorLimit: 5,
    forgetPasswordMaxErrorLimit: 5,
    emailChangeMaxErrorLimit: 5,
    // passwordPattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/, // 要求大小写字母和特殊字符
    passwordPattern: /^(?=.*[a-zA-Z])(?=.*\d).{8,20}$/,
});
