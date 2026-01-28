const translation = {
  // Login page titles
  login_title: 'Login Monie Account',
  signup_title: 'Signup Monie Account',
  // Welcome messages
  welcome_back: 'Welcome back',
  login_to_your_monie_account: 'Login to your Monie account',
  // Form placeholders
  your_email_placeholder: 'your@email.com',
  enter_password_placeholder: 'Please enter password',
  enter_6_digit_code_placeholder: 'Please enter 6-digit verification code',
  request_verification_code: 'Please request verification code first',
  // Buttons and actions
  login_button: 'Login',
  send_verification_code: 'Send verification code',
  forgot_password: 'Forgot password?',
  go_back: 'Go back',
  // Social login
  or_login_with: 'Or login with',
  login_with_google: 'Login with Google account',
  // Account related
  no_account_yet: 'No account yet?',
  signup_now: 'Sign up now',
  // Verification
  verification_code_sent_to: 'Verification code sent to',
  // Error messages
  email_check_error: 'Email account check error',
  send_verification_code_failed: 'Failed to send verification code',
  // Terms and agreements
  agreement_prefix: 'By logging in, you agree to our',
  use_email_code_login: 'Use email code to log in',
  terms_of_service: 'Terms of Service',
  agreement_and: 'and',
  privacy_policy: 'Privacy Policy',
  welcome_to_monie: 'Welcome to Monie!',
  one_step_to_start: 'One step to start intelligent experience',
  // Form placeholders
  email_placeholder: 'your@email.com',
  enter_6_digit_code: 'Please enter 6-digit verification code',
  username_placeholder: 'Username: zhangsan, ai_creator_2024',
  // Buttons and actions
  processing: 'Processing...',
  start_creation: 'Start creation',
  login_now: 'Login now',
  // Username tips
  username_tip1: '• Username will be your unique identifier',
  username_tip2: '• Supports Chinese, English, numbers and underscores',
  username_tip3: '• 2-20 characters, cannot be modified after signup',
  // Username availability
  username_available: 'Username available',
  // Error messages
  enter_username: 'Please enter username',
  username_min_length: 'Username must be at least 2 characters',
  username_max_length: 'Username cannot exceed 20 characters',
  registration_failed: 'Registration failed, please try again later',
  login_failed: 'Login failed, please try again later',
  enter_email_first: 'Please enter email first',
  send_code_failed: 'Failed to send verification code',
  // Alternative options
  or_choose_other_way: 'Or choose other way',
  // Account status
  already_have_account: 'Already have Monie account?',
  forgot_password_title: "Reset Password",
  reset_password_description: "Enter your email to reset your password",
  enter_email_to_reset_password: "Enter your email to reset your password",
  verification_code_sent_to_email: "Verification code sent to {email}",
  enter_verification_code: "Enter verification code",
  verification_code_must_be_6_digits: "Verification code must be 6 digits",
  enter_new_password: "Enter new password",
  confirm_new_password: "Confirm new password",
  password_min_length: "Password must be at least 6 characters",
  password_max_length: "Password must be at most 32 characters",
  passwords_do_not_match: "Passwords do not match",
  reset_password_button: "Reset Password",
  send_verification_code_button: "Send Verification Code",
  verify_code_button: "Verify Code",
  password_reset_success: "Password reset successfully! Redirecting to login...",
  password_reset_failed: "Password reset failed",
  invalid_verification_code: "Invalid verification code",
  verification_code_send_failed: "Failed to send verification code",
  back_to_login: "Back to Login",
  go_back_to_email: "Back to email",
  go_back_to_verification: "Back to verification",
  password_reset_success_message: "Your password has been reset successfully. You can now login with your new password.",
  redirecting_to_login: "Redirecting to login page...",
  password_requirements: "Password must be 6-32 characters long, include uppercase and lowercase letters, and at least one special character",
  my_account: "My Account",
  manage_your_account_settings: "Manage your account settings",
  account_id: "Account ID",
  member_since: "Created At",
  delete_account: "Delete Account",
  delete_account_warning: "Deleting your account is an irreversible operation. All your data will be permanently erased, including:",
  delete_warning_data: "All personal profiles and data",
  delete_warning_history: "Usage history records",
  delete_warning_subscription: "Subscription information",
  delete_warning_access: "Access to all projects and workspaces",
  username: "Account Name",
  enter_username_placeholder: "enter your name",
  change_avatar: "Edit profile photo",
  image_input: {
    drop_image_here: "Drop your image here, or",
    browse: 'browse',
  },
  image_uploader: {
    upload_limit_exceeded: "Upload images cannot exceed 3MB",
    read_error: "Image reading failed"
  },
  countdown: {
    seconds_to_resend: '{{count}} seconds until resend',
    countdown_format: '{{seconds}} seconds remaining',
    can_resend: 'Can resend verification code',
    resend_code: 'Resend Verification Code',
    resend: 'Resend',
    didnot_receive_code: 'Didn’t receive the code?'
  },
  change_email: {
    // 对话框标题和按钮
    title: 'Change Email',

    // 步骤指示器
    step_verify_old: 'Verify Old Email',
    step_set_new: 'Set New Email',

    // 第一步：验证旧邮箱
    old_email_section_title: 'Verify Current Email',
    old_email_description: 'To protect your account security, we will send a verification code to your current email address: {{email}}.',
    send_code: 'Send Verification Code',
    sending: 'Sending...',
    verification_code: 'Verification Code',
    verification_code_placeholder: 'Enter 6-digit verification code',
    next_step: 'Next Step',
    verifying: 'Verifying...',

    // 第二步：设置新邮箱
    new_email_section_title: 'Set New Email',
    new_email_label: 'New Email Address',
    new_email_placeholder: 'Enter new email address',
    send_new_code: 'Send Verification Code',
    new_verification_code: 'New Email Verification Code',
    previous_step: 'Previous Step',
    submit_changes: 'Confirm Changes',
    submitting: 'Submitting...',

    // 错误信息
    error_code_required: 'Please enter verification code',
    error_code_invalid: 'Verification code is incorrect or expired',
    error_email_required: 'Please enter email address',
    error_email_invalid: 'Email format is incorrect',
    error_email_same: 'New email cannot be the same as current email',
    error_send_failed: 'Failed to send verification code, please try again',
    error_verification_failed: 'Verification failed, please check the code',

    // 安全提示
    security_tip: 'After changing your email, you will log in using the new email. All notifications and password resets will be sent to the new email.',

    // 成功消息
    success_message: 'Email changed successfully',
  },
  delete: {
    title: "Delete Account",
    warning_title: "Important Warning",
    warning_description: "You are about to permanently delete your account. This action is irreversible, please consider carefully.",
    warning_1: "All account data will be permanently deleted",
    warning_2: "All workspaces and projects will be removed",
    warning_3: "All subscriptions and paid services will be terminated immediately",
    warning_4: "This action cannot be undone",
    verification_will_send: "We will send a verification email to {{email}} to confirm this action",
    continue: "Continue to Delete",
    verification_sent: "Verification code has been sent to {{email}}",
    verification_instruction: "Please enter the 6-digit verification code from the email to continue",
    verification_code: "Verification Code",
    verification_code_required: "Please enter verification code",
    invalid_verification_code: "Invalid verification code",
    verification_failed: "Verification failed, please try again",
    resend_code: "Resend Code",
    confirm_title: "Final Confirmation",
    confirm_warning: "This is the final confirmation step, your account will be deleted immediately after clicking confirm",
    confirm_description: "Are you sure you want to permanently delete your account?",
    confirm_note: "After account deletion, you will lose all data and access",
    confirm_button: "Confirm Deletion"
  },
  activate_account: 'Activate Account',
  activate_account_button: 'Activate Account',
};
export default translation;