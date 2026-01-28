const translation = {
  // Login page titles
  login_title: '登录 Monie 账户',
  signup_title: '注册 Monie 账户',
  // Welcome messages
  welcome_back: '欢迎回来',
  login_to_your_monie_account: '登录你的 Monie 账号',
  // Form placeholders
  your_email_placeholder: 'your@email.com',
  enter_password_placeholder: '请输入密码',
  enter_6_digit_code_placeholder: '请输入6位验证码',
  request_verification_code: '请重新请求验证码',
  // Buttons and actions
  login_button: '登录',
  send_verification_code: '发送验证码',
  forgot_password: '忘记密码？',
  go_back: '返回',
  // Social login
  or_login_with: '或者使用以下方式登录',
  login_with_google: '使用 Google 账号登录',
  // Account related
  no_account_yet: '还没有账号？',
  signup_now: '立即注册',
  // Verification
  verification_code_sent_to: '验证码已发送至',
  // Error messages
  email_check_error: '邮箱账户检测错误',
  enter_email_first: '请先输入邮箱',
  send_verification_code_failed: '发送验证码失败',
  use_email_code_login: '使用邮箱验证码登陆',
  // Terms and agreements
  login_agreement_prefix: '登录即表示你同意我们的',
  terms_of_service: '服务条款',
  login_agreement_and: '和',
  privacy_policy: '隐私政策',
  welcome_to_monie: '欢迎加入 Monie！',
  one_step_to_start: '只需一步，开启智能体验',
  // Form placeholders
  email_placeholder: 'your@email.com',
  enter_6_digit_code: '请输入6位验证码',
  username_placeholder: '用户名：zhangsan、ai_creator_2024',
  // Buttons and actions
  processing: '正在处理...',
  start_creation: '开始创建',
  login_now: '立即登录',
  // Username tips
  username_tip1: '• 用户名将作为你的唯一标识',
  username_tip2: '• 支持中文、英文、数字和下划线',
  username_tip3: '• 2-20个字符，注册后不可修改',
  // Username availability
  username_available: '用户名可用',
  // Error messages
  enter_username: '请输入用户名',
  username_min_length: '用户名至少需要2个字符',
  username_max_length: '用户名不能超过20个字符',
  registration_failed: '注册失败，请稍后重试',
  login_failed: '登录失败，请稍后重试',
  // Alternative options
  or_choose_other_way: '或选择其他方式',
  // Account status
  already_have_account: '已有 Monie 账号？',
  // Terms and agreements
  agreement_prefix: '登录即表示你同意我们的',
  forgot_password_title: "重置密码",
  reset_password_description: "输入您的邮箱以重置密码",
  enter_email_to_reset_password: "输入您的邮箱以重置密码",
  verification_code_sent_to_email: "验证码已发送至 {email}",
  enter_verification_code: "输入验证码",
  verification_code_must_be_6_digits: "验证码必须为6位数字",
  verification_code_must_be_numbers: "验证码必须是数字",
  enter_new_password: "输入新密码",
  confirm_new_password: "确认新密码",
  password_min_length: "密码至少需要6个字符",
  password_max_length: "密码最多32个字符",
  send_verification_code_button: "发送验证码",
  passwords_do_not_match: "两次输入的密码不一致",
  reset_password_button: "重置密码",
  verify_code_button: "验证验证码",
  password_reset_success: "密码重置成功！正在跳转到登录页...",
  password_reset_failed: "密码重置失败",
  invalid_verification_code: "验证码无效",
  verification_code_send_failed: "验证码发送失败",
  back_to_login: "返回登录",
  go_back_to_email: "返回修改邮箱",
  go_back_to_verification: "返回修改验证码",
  password_reset_success_message: "您的密码已重置成功，现在可以使用新密码登录。",
  redirecting_to_login: "正在跳转到登录页面...",
  password_requirements: "密码必须为6-32个字符，包含大小写字母和至少一个特殊字符",
  my_account: "我的账户",
  manage_your_account_settings: "管理您的账户设置",
  account_id: "账户ID",
  member_since: "加入时间",
  delete_account: "删除账户",
  delete_account_warning: "删除账户是永久性操作，无法撤销。这将永久删除您的所有数据，包括：",
  delete_warning_data: "所有个人资料和数据",
  delete_warning_history: "使用历史记录",
  delete_warning_subscription: "订阅信息",
  delete_warning_access: "所有项目和团队访问权限",
  username: "用户名",
  enter_username_placeholder: "输入用户名",
  change_avatar: "编辑裁剪头像",
  image_input: {
    drop_image_here: "将图片拖放到此处，或",
    browse: '浏览',
  },
  image_uploader: {
    upload_limit_exceeded: "上传文件不能超过3MB",
    read_error: "图片文件读取错误"
  },
  countdown: {
    seconds_to_resend: '{{count}}秒后可重新发送',
    // 倒计时文本
    countdown_format: '剩余{{seconds}}秒',
    can_resend: '可重新发送验证码',
    resend_code: '重新发送验证码',
    resend: '重新发送',
    didnot_receive_code: '未收到验证码？',
  },
  change_email: {
    // 对话框标题和按钮
    title: '修改邮箱',
    cancel: '取消',
    confirm: '确认',

    // 步骤指示器
    step_verify_old: '验证旧邮箱',
    step_set_new: '设置新邮箱',

    // 第一步：验证旧邮箱
    old_email_section_title: '验证当前邮箱',
    old_email_description: '为了保护您的账户安全，我们将向您的当前邮箱 {{email}} 发送验证码。',
    send_code: '发送验证码',
    sending: '发送中...',
    verification_code: '验证码',
    verification_code_placeholder: '请输入6位数字验证码',
    next_step: '下一步',
    verifying: '验证中...',

    // 第二步：设置新邮箱
    new_email_section_title: '设置新邮箱',
    new_email_label: '新邮箱地址',
    new_email_placeholder: '请输入新的邮箱地址',
    new_verification_code: '新邮箱验证码',
    new_verification_code_placeholder: '请输入6位数字验证码',
    previous_step: '上一步',
    submit_changes: '确认更改',
    submitting: '提交中...',

    // 错误信息
    error_code_required: '请输入验证码',
    error_code_invalid: '验证码错误或已过期',
    error_email_required: '请输入邮箱地址',
    error_email_invalid: '邮箱格式不正确',
    error_email_same: '新邮箱不能与当前邮箱相同',
    error_send_failed: '发送验证码失败，请重试',
    error_verification_failed: '验证失败，请检查验证码',

    // 安全提示
    security_tip: '邮箱更改后，您将使用新邮箱登录。所有通知和密码重置都将发送到新邮箱。',

    // 成功消息
    success_message: '邮箱修改成功',
  },
  delete: {
    title: "删除账户",
    warning_title: "重要警告",
    warning_description: "您即将永久删除您的账户。此操作不可逆，请谨慎考虑。",
    warning_1: "所有账户数据将被永久删除",
    warning_2: "所有工作空间和项目将被移除",
    warning_3: "所有订阅和付费服务将立即终止",
    warning_4: "此操作无法撤销",
    verification_will_send: "我们将向 {{email}} 发送验证邮件以确认此操作",
    continue: "继续删除",
    verification_sent: "验证码已发送至 {{email}}",
    verification_instruction: "请输入邮件中的6位验证码以继续",
    verification_code: "验证码",
    verification_code_required: "请输入验证码",
    invalid_verification_code: "验证码无效",
    verification_failed: "验证失败，请重试",
    resend_code: "重新发送",
    confirm_title: "最终确认",
    confirm_warning: "这是最后的确认步骤，点击确认后账户将立即被删除",
    confirm_description: "您确定要永久删除您的账户吗？",
    confirm_note: "账户删除后，您将失去所有数据和访问权限",
    confirm_button: "确认删除"
  },
  activate_account: '激活账户',
  activate_account_button: '激活账户',
};
export default translation;