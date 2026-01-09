import { ArrowRight, Bot, Brain, CheckCircle, Lock, MessageSquare, Palette, Sparkles, Users, Workflow, Zap } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function MainContent() {
  const { t } = useTranslation();
  // 功能特性数据
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: t('home.features.multi_model_agents.title'),
      description: t('home.features.multi_model_agents.description'),
      highlights: [
        t('home.features.multi_model_agents.highlights.intelligent_dialogue'),
        t('home.features.multi_model_agents.highlights.content_creation'),
        t('home.features.multi_model_agents.highlights.code_generation')
      ]
    },
    {
      icon: <Workflow className="w-12 h-12 text-purple-500" />,
      title: t('home.features.visual_workflow.title'),
      description: t('home.features.visual_workflow.description'),
      highlights: [
        t('home.features.visual_workflow.highlights.automation'),
        t('home.features.visual_workflow.highlights.data_processing'),
        t('home.features.visual_workflow.highlights.report_generation')
      ]
    },
    {
      icon: <Zap className="w-12 h-12 text-green-500" />,
      title: t('home.features.task_automation.title'),
      description: t('home.features.task_automation.description'),
      highlights: [
        t('home.features.task_automation.highlights.intelligent_scheduling'),
        t('home.features.task_automation.highlights.conditional_triggers'),
        t('home.features.task_automation.highlights.batch_processing')
      ]
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-500" />,
      title: t('home.features.creative_generation.title'),
      description: t('home.features.creative_generation.description'),
      highlights: [
        t('home.features.creative_generation.highlights.ai_drawing'),
        t('home.features.creative_generation.highlights.video_generation'),
        t('home.features.creative_generation.highlights.website_creation')
      ]
    }
  ];

  // 为什么选择 Monie 的理由
  const whyChooseMonie = [
    {
      icon: <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />,
      title: t('home.why_choose.low_threshold.title'),
      description: t('home.why_choose.low_threshold.description')
    },
    {
      icon: <Workflow className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      title: t('home.why_choose.high_scalability.title'),
      description: t('home.why_choose.high_scalability.description')
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      title: t('home.why_choose.private_deployment.title'),
      description: t('home.why_choose.private_deployment.description')
    },
    {
      icon: <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />,
      title: t('home.why_choose.community_sharing.title'),
      description: t('home.why_choose.community_sharing.description')
    }
  ];

  // 应用场景
  const useCases = [
    {
      icon: <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      title: t('home.use_cases.intelligent_dialogue.title'),
      description: t('home.use_cases.intelligent_dialogue.description')
    },
    {
      icon: <Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
      title: t('home.use_cases.creative_generation.title'),
      description: t('home.use_cases.creative_generation.description')
    },
    {
      icon: <Zap className="w-8 h-8 text-green-600 dark:text-green-400" />,
      title: t('home.use_cases.task_automation.title'),
      description: t('home.use_cases.task_automation.description')
    },
    {
      icon: <Bot className="w-8 h-8 text-pink-600 dark:text-pink-400" />,
      title: t('home.use_cases.app_factory.title'),
      description: t('home.use_cases.app_factory.description')
    }
  ];

  // Footer 链接数据
  const footerLinks = {
    product: [
      { label: t('home.footer.product.agent_platform'), href: "#" },
      { label: t('home.footer.product.workflow_engine'), href: "#" },
      { label: t('home.footer.product.api'), href: "#" },
      { label: t('home.footer.product.app_store'), href: "#" }
    ],
    solutions: [
      { label: t('home.footer.solutions.enterprise'), href: "#" },
      { label: t('home.footer.solutions.developer_tools'), href: "#" },
      { label: t('home.footer.solutions.education'), href: "#" },
      { label: t('home.footer.solutions.startups'), href: "#" }
    ],
    resources: [
      { label: t('home.footer.resources.docs'), href: "#" },
      { label: t('home.footer.resources.blog'), href: "#" },
      { label: t('home.footer.resources.tutorials'), href: "#" },
      { label: t('home.footer.resources.api_reference'), href: "#" }
    ],
    company: [
      { label: t('home.footer.company.about'), href: "#" },
      { label: t('home.footer.company.careers'), href: "#" },
      { label: t('home.footer.company.contact'), href: "#" },
      { label: t('home.footer.company.media'), href: "#" }
    ],
    legal: [
      { label: t('home.footer.legal.terms'), href: "#" },
      { label: t('home.footer.legal.privacy'), href: "#" },
      { label: t('home.footer.legal.agreement'), href: "#" },
      { label: t('home.footer.legal.cookie'), href: "#" }
    ]
  };
  return (
    <main className="pt-16">
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* 内容 */}
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                {t('home.hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              {t('home.hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-lg font-semibold inline-flex items-center justify-center active:bg-green-800"
              >
                {t('home.hero.cta_primary')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 text-lg font-semibold inline-flex items-center justify-center"
              >
                {t('home.hero.cta_secondary')}
                <Sparkles className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section >

      {/* Platform Features */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t('home.features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Monie */}
      <section className="py-20 bg-amber-50 dark:bg-amber-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                {t('home.why_choose.title')}
              </h2>
              <div className="space-y-6">
                {whyChooseMonie.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`p-3 ${index === 0 ? 'bg-green-100 dark:bg-green-900/30' :
                      index === 1 ? 'bg-purple-100 dark:bg-purple-900/30' :
                        index === 2 ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-pink-100 dark:bg-pink-900/30'
                      } rounded-xl`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-3xl p-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  {t('home.use_cases.title')}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {useCases.map((useCase, index) => (
                    <div key={index} className={`
                        p-4 rounded-xl ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/20' :
                        index === 1 ? 'bg-purple-50 dark:bg-purple-900/20' :
                          index === 2 ? 'bg-green-50 dark:bg-green-900/20' :
                            'bg-pink-50 dark:bg-pink-900/20'
                      }
                      `}>
                      {useCase.icon}
                      <h4 className="font-bold text-gray-900 dark:text-white mt-3">
                        {useCase.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {useCase.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main >
  );
}