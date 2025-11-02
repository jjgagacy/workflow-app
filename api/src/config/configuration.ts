export default () => ({
    hi: 'hello nest',
    defaultApplicationName: process.env.APPLICATION_NAME || 'monie/workflow',
    systemSupportsEmail: process.env.SYSTEM_SUPPORTS_EMAIL || 'supports@monie.cc',
});
