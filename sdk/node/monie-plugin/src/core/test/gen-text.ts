/**
 * 生成随机中文文字段落
 */
export function generateRandomChineseText(length: number = 100): string {
  const chineseChars = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞';

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chineseChars.length);
    result += chineseChars[randomIndex];

    // 偶尔添加标点符号
    if (i > 0 && i % Math.floor(Math.random() * 15 + 8) === 0) {
      const punctuations = ['，', '。', '、', '；', '：'];
      result += punctuations[Math.floor(Math.random() * punctuations.length)];

      // 添加空格使阅读更自然
      if (Math.random() > 0.7) result += ' ';
    }
  }

  // 确保以句号结束
  if (!result.endsWith('。')) {
    result += '。';
  }

  return result;
}

/**
 * 生成随机英文段落
 */
export function generateRandomEnglishText(length: number = 100): string {
  const words = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
    'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
    'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us'
  ];

  let result = '';
  for (let i = 0; i < length; i++) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    result += randomWord;

    // 添加标点符号
    if (i > 0 && i % Math.floor(Math.random() * 10 + 5) === 0) {
      const punctuations = [',', '.', '!', '?', ';'];
      result += punctuations[Math.floor(Math.random() * punctuations.length)];
    }

    // 添加空格
    if (i < length - 1) {
      result += ' ';
    }
  }

  // 确保以句点结束
  if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
    result += '.';
  }

  // 首字母大写
  result = result.charAt(0).toUpperCase() + result.slice(1);

  return result;
}

/**
 * 生成随机测试句子（混合中英文）
 */
export function generateRandomTestSentence(): string {
  const sentences = [
    // 中文句子
    '人工智能正在改变我们的生活方式和工作模式。',
    '机器学习算法可以帮助我们更好地理解复杂数据。',
    '深度学习技术在图像识别领域取得了显著进展。',
    '自然语言处理让计算机能够理解和生成人类语言。',
    '云计算为大数据分析提供了强大的计算能力。',
    '物联网技术连接了物理世界和数字世界。',
    '区块链技术正在重塑金融和供应链管理。',
    '虚拟现实和增强现实创造了全新的用户体验。',
    '5G网络将推动自动驾驶和远程医疗的发展。',
    '量子计算可能在未来解决传统计算机无法解决的问题。',

    // 英文句子
    'The quick brown fox jumps over the lazy dog.',
    'Technology has transformed how we communicate and work.',
    'Innovation drives progress in every field of human endeavor.',
    'Data is the new oil in the digital economy.',
    'Sustainability is key to our future on this planet.',
    'Education opens doors to countless opportunities.',
    'Collaboration across borders leads to better solutions.',
    'Creativity combined with technology can solve complex problems.',
    'The future belongs to those who learn and adapt quickly.',
    'Small steps today can lead to giant leaps tomorrow.',

    // 混合句子
    'AI技术正在revolutionizing医疗行业。',
    '我们需要balance技术创新和社会responsibility。',
    'IoT设备让smart home成为现实。',
    'Big data分析帮助企业make better decisions。',
    'Cloud computing提供了scalable的解决方案。',
    'VR技术可以create immersive的培训体验。',
    'Blockchain确保data的security和transparency。',
    '5G network将enable更多innovative应用。',
    'Machine learning算法不断improve accuracy。',
    'Digital transformation是modern企业的necessity。'
  ];

  return sentences[Math.floor(Math.random() * sentences.length)] || '';
}
/**
 * 为 PinkTTS 端点生成测试文本
 */
export function generatePinkTTSTestData() {
  return {
    // 短文本测试
    shortChinese: {
      text: '欢迎使用智能语音合成系统，请输入您要转换的文本内容。',
      voice: 'female',
      format: 'mp3',
      speed: 1.0
    },

    // 中等长度文本测试
    mediumEnglish: {
      text: 'The advancement of technology has significantly improved our quality of life. From communication to transportation, healthcare to education, innovations continue to make our world more connected and efficient.',
      voice: 'male',
      format: 'wav',
      speed: 1.2
    },

    // 长文本测试
    longMixed: {
      text: '人工智能技术正在深刻改变我们的社会结构和工作方式。AI algorithms can analyze vast amounts of data to identify patterns and make predictions. 机器学习模型通过训练数据不断优化自身的性能。Deep learning has achieved remarkable success in image and speech recognition. 自然语言处理让计算机能够理解人类语言的复杂性。These technologies combined create powerful tools for solving complex problems.',
      voice: 'neutral',
      format: 'ogg',
      speed: 1.0,
      pitch: 1.1
    },

    // 特定场景测试
    scenarios: [
      {
        name: '导航提示',
        text: '前方300米右转，进入中山路。请注意，当前道路拥堵，预计通过时间5分钟。',
        voice: 'navigation',
        format: 'mp3',
        speed: 1.3
      },
      {
        name: '新闻播报',
        text: '最新消息，今天上午十点，国际科技创新大会在北京开幕。来自全球五十多个国家的专家齐聚一堂，共同探讨人工智能的未来发展。',
        voice: 'news',
        format: 'mp3',
        speed: 1.1
      },
      {
        name: '故事讲述',
        text: '在一个遥远的星球上，住着一群会说话的机器人。他们每天的工作是维护星球的生态平衡，保护各种奇异的植物和动物。',
        voice: 'story',
        format: 'mp3',
        speed: 0.9,
        pitch: 1.0
      },
      {
        name: '技术文档',
        text: '安装前请确保系统满足以下要求：操作系统版本不低于10.0，内存至少8GB，硬盘空间20GB以上。安装过程约需15分钟，期间请不要关闭电源。',
        voice: 'technical',
        format: 'mp3',
        speed: 1.0
      }
    ]
  };
}
