<?php
try {
    echo "<h1>🚀 PHP + Nginx + MySQL Docker 环境运行成功！</h1>";
    echo "<p>✅ PHP 版本: " . PHP_VERSION . "</p>";
    
    // 显示已安装的扩展
    echo "<h3>已安装的 PHP 扩展:</h3>";
    $extensions = get_loaded_extensions();
    sort($extensions);
    echo "<ul>";
    foreach ($extensions as $ext) {
        echo "<li>$ext</li>";
    }
    echo "</ul>";
    
} catch (Exception $e) {
    echo "<p>错误信息: " . $e->getMessage() . "</p>";
}

// 显示服务器信息
echo "<h3>服务器信息:</h3>";
echo "<p>服务器软件: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>当前时间: " . date('Y-m-d H:i:s') . "</p>";
