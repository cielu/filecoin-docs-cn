// .vuepress/config.js
const DEPLOY_DOMAIN = 'https://www.fildocs.cn'
const pageSuffix = '/'

const autometa_options = {
  site: {
    name: 'filecoin中文文档',
    twitter: 'filecoin中文文档',
  },
  canonical_base: 'https://www.fildocs.cn',
};

module.exports = {
  base: '/',
  head: require('./head'),
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'Filecoin中文文档',
      description: 'Filecoin中文文档'
    }
  },
  markdown: {
    pageSuffix,
    extendMarkdown: md => {
      md.set({
        breaks: true
      })
      md.use(require('markdown-it-video'))
      md.use(require('markdown-it-footnote'))
      md.use(require('markdown-it-task-lists'))
      md.use(require('markdown-it-deflist'))
    },
    externalLinks: {
      target: '_blank', rel: 'nofollow noopener noreferrer'
    }
  },
  themeConfig: {
    algolia: {
      apiKey: '6c3d7635474cdcd0a0aaf8ca397a4c44',
      indexName: 'filecoin'
    },
    betaTestFormUrl:
      'https://docs.google.com/forms/d/1LVaD1B2uyW6Ff0jfU_iQ5mCeyQcHfyQO6BDD99XAgK0/viewform',
    defaultImage: '/images/social-card.png',
    author: {
      name: 'Filecoin Team',
      twitter: '@filecoin'
    },
    keywords:
      'Filecoin, crypto, mining, blockchain, IPFS, dweb, protocol, libp2p, ipld, multiformats, bitswap, decentralized web, InterPlanetary File System, dapp, documentation, docs, Protocol Labs',
    domain: DEPLOY_DOMAIN,
    docsRepo: 'filecoin-project/filecoin-docs',
    docsDir: 'docs',
    docsBranch: 'master',
    feedbackWidget: {
      docsRepoIssue: 'filecoin-project/filecoin-docs'
    },
    editLinks: false,
    nextLinks: true,
    prevLinks: true,
    logo: '/images/filecoin-symbol-color.svg',
    locales: {
      '/': {
        label: 'English',
        selectText: '语言列表',
        ariaLabel: '选择语言',
        editLinkText: '编辑本页',
        lastUpdated: '最后更新',
        serviceWorker: {
          updatePopup: {
            message: '有新的内容.',
            buttonText: 'Refresh'
          }
        },
        nav: require('./nav/zh-CN'),
        sidebar: {
          '/get-started/': [
            'explore-the-network',
            [
              'https://proto.school/verifying-storage-on-filecoin/',
              'Protoschool tutorial'
            ],
            {
              title: 'LOTUS',
              path: '/get-started/lotus/',
              sidebarDepth: 2,
              collapsable: false,
              children: [
                ['lotus/installation', 'Install + Setup'],
                ['lotus/switch-networks', 'Switch networks'],
                ['lotus/upgrades', 'Upgrades'],
                ['lotus/send-and-receive-fil', 'Send and receive ⨎'],
                ['lotus/multisig', 'Multi-signature wallets'],
                ['lotus/chain', 'Chain management'],
                ['lotus/ledger', 'Ledger wallet'],
                ['lotus/tips-running-in-china', 'Tips when running in China'],
                ['lotus/configuration-and-advanced-usage', 'Advanced options'],
                ['lotus/troubleshooting', 'Troubleshooting']
              ]
            }
          ],

          '/store/': [
            ['http://slingshot.filecoin.io/', 'Slingshot competition'],
            'slate',
            'starling',
            {
              title: 'LOTUS',
              path: '/store/lotus/',
              sidebarDepth: 2,
              collapsable: false,
              children: [
                ['lotus/store-data', 'Store data'],
                ['lotus/very-large-files', 'Very large files'],
                ['lotus/retrieve-data', 'Retrieve data'],
                ['lotus/import-data-from-ipfs', 'Import data from IPFS'],
                ['lotus/store-troubleshooting', 'Troubleshooting']
              ]
            }
          ],

          '/mine/': [
            'how-mining-works',
            'hardware-requirements',
            'mining-architectures',
            //'storage-sector-lifecycle',
            ['mining-rewards', '挖矿奖励'],
            ['slashing', '惩罚机制 Slashing'],
            {
              title: '矿工 Lotus Miner',
              path: '/mine/lotus/',
              sidebarDepth: 2,
              collapsable: false,
              children: [
                ['lotus/miner-setup', '安装矿工程序'],
                ['lotus/miner-configuration', '配置参考'],
                ['lotus/miner-upgrades', 'Miner升级'],
                ['lotus/miner-lifecycle', '矿工的生命周期'],
                ['lotus/manage-storage-deals', '管理存储交易'],
                ['lotus/manage-retrieval-deals', '管理检索交易'],
                ['lotus/custom-storage-layout', '自定义存储位置'],
                ['lotus/sector-pledging', '扇区质押'],
                ['lotus/connectivity', '连通性'],
                ['lotus/miner-addresses', '矿工地址'],
                //'lotus/fees-control-and-limits',
                ['lotus/message-pool', '消息池'],
                ['lotus/seal-workers', '密封工作者'],
                ['lotus/benchmarks', '基准测试'],
                ['lotus/backup-and-restore', '备份与恢复'],
                ['lotus/gpus', '自定义GPU'],
                //'lotus/disaster-recovery',
                ['lotus/tips-running-in-china', '在国内跑的小建议'],
                ['lotus/miner-troubleshooting', '疑难解答']
              ]
            }
          ],

          '/build/': [
            'get-started',
            'textile-buckets',
            'hosted-powergate',
            'hosted-lotus',
            'powergate',
            {
              title: 'Lotus',
              path: '/build/lotus/',
              sidebarDepth: 2,
              collapsable: true,
              children: [
                ['lotus/enable-remote-api-access', '允许远程API访问'],
                ['lotus/api-tokens', 'API tokens'],
                ['lotus/api-client-libraries', 'API client libraries'],
                ['lotus/go-json-rpc', 'Use Go with JSON-RPC APIs'],
                ['lotus/payment-channels', 'Payment channels'],
                ['lotus/troubleshooting', 'Troubleshooting']
              ]
            },
            'filecoin-pinning-services',
            'signing-libraries',
            ['local-devnet', 'Local devnet'],
            {
              title: 'Example apps',
              path: '/build/examples/',
              sidebarDepth: 2,
              collapsable: true,
              children: [
                {
                  title: 'Simple Pinning Service',
                  path: '/build/examples/simple-pinning-service/overview/',
                  collapsable: true,
                  children: [
                    'examples/simple-pinning-service/powergate-lotus-go-ipfs-interactions',
                    'examples/simple-pinning-service/step-1-powergate-setup',
                    'examples/simple-pinning-service/step-2-react-app-setup',
                    'examples/simple-pinning-service/step-3-connecting-powergate-to-app',
                    'examples/simple-pinning-service/step-4-explore-pinning-service-app',
                    'examples/simple-pinning-service/step-5-shut-down-the-application',
                    'examples/simple-pinning-service/summary'
                  ]
                },
                {
                  title: 'Network Inspector',
                  path: '/build/examples/network-inspector/overview/',
                  collapsable: true,
                  children: [
                    '/build/examples/network-inspector/lotus-and-go-ipfs-interactions',
                    '/build/examples/network-inspector/step-1-start-lotus-devnet-and-go-ipfs',
                    '/build/examples/network-inspector/step-2-run-the-react-app',
                    '/build/examples/network-inspector/step-3-set-up-the-lotus-and-go-ipfs-api-clients',
                    '/build/examples/network-inspector/step-4-explore-the-filecoin-network-inspector-app',
                    '/build/examples/network-inspector/step-5-shut-down-the-application',
                    '/build/examples/network-inspector/summary'
                  ]
                },
                {
                  title: 'Meme Marketplace',
                  path: '/build/examples/meme-marketplace/overview/',
                  collapsable: true,
                  children: [
                    '/build/examples/meme-marketplace/textile-hub-buckets-and-erc721',
                    '/build/examples/meme-marketplace/step-1-blockchain-and-contracts-setup',
                    '/build/examples/meme-marketplace/step-2-run-react-app',
                    '/build/examples/meme-marketplace/step-3-run-hub-auth-server',
                    '/build/examples/meme-marketplace/step-4-connecting-app-with-auth-server',
                    '/build/examples/meme-marketplace/step-5-connecting-app-with-blockchain',
                    '/build/examples/meme-marketplace/step-6-explore-app',
                    '/build/examples/meme-marketplace/step-7-shut-down-the-application',
                    '/build/examples/meme-marketplace/summary'
                  ]
                }
              ]
            }
          ],

          '/reference/': [
            'glossary',
            ['https://github.com/filecoin-project/specs', 'Specification'],
            ['lotus-api', 'Lotus API']
          ],

          '/': [
            '/about-filecoin/what-is-filecoin',
            '/about-filecoin/how-filecoin-works',
            '/about-filecoin/why-filecoin',
            '/about-filecoin/ipfs-and-filecoin',
            '/about-filecoin/network-performance',
            '/about-filecoin/filecoin-compared-to',
            '/about-filecoin/faq',
            {
              title: 'Project',
              path: '/project/',
              children: [
                [
                  'https://app.instagantt.com/shared/s/1152992274307505/latest',
                  'Roadmap'
                ],
                ['https://research.filecoin.io/', 'Research'],
                '/project/related-projects',
                [
                  'https://github.com/filecoin-project/community/blob/master/CODE_OF_CONDUCT.md',
                  'Code of conduct'
                ],
                [
                  'https://github.com/filecoin-project/community/blob/master/SECURITY.md',
                  'Security issues'
                ]
              ]
            },

            {
              title: 'Community',
              path: '/community/',
              children: [
                {
                  title: 'Join the community',
                  sidebarDepth: 2,
                  collapsable: false,
                  children: [
                    '/community/contribute/ways-to-contribute',
                    '/community/chat-and-discussion-forums',
                    ['https://proto.school/#/events', 'ProtoSchool workshops'],
                    '/community/social-media/social-media'
                  ]
                },
                {
                  title: 'Write the docs',
                  sidebarDepth: 1,
                  collapsable: false,
                  children: [
                    '/community/contribute/grammar-formatting-and-style',
                    '/community/contribute/writing-guide',
                    '/community/contribute/contribution-tutorial'
                  ]
                }
              ]
            }
          ]
        }
      }
    }
  },
  plugins: [
    'autometa', autometa_options,
    'fulltext-search',
    '@vuepress/plugin-back-to-top',
    [
      '@vuepress/active-header-links',
      {
        sidebarLinkSelector: '.sidebar-link',
        headerAnchorSelector: '.header-anchor',
        headerTopOffset: 120
      }
    ],
    '@vuepress/plugin-last-updated',
    [
      'vuepress-plugin-clean-urls',
      {
        normalSuffix: pageSuffix,
        indexSuffix: pageSuffix,
        notFoundPath: '/404/'
      }
    ],
    [
      '@vuepress/google-analytics',
      {
        ga: 'UA-148766289-2'
      }
    ],
    ['vuepress-plugin-code-copy', { align: 'bottom', color: '#fff' }],
    [
      'vuepress-plugin-medium-zoom',
      {
        selector: '.theme-default-content img',
        delay: 500,
        options: {
          margin: 20,
          background: 'rgba(255,255,255,0.8)',
          scrollOffset: 0
        }
      }
    ],
    [
      'vuepress-plugin-seo',
      {
        siteTitle: ($page, $site) => $site.title,
        title: $page => $page.title,
        description: $page => $page.frontmatter.description,
        author: ($page, $site) =>
          $page.frontmatter.author || $site.themeConfig.author,
        tags: $page => $page.frontmatter.tags,
        twitterCard: _ => 'summary_large_image',
        type: $page =>
          ['articles', 'posts', 'blog'].some(folder =>
            $page.regularPath.startsWith('/' + folder)
          )
            ? 'article'
            : 'website',
        url: ($page, $site, path) => ($site.themeConfig.domain || '') + path,
        image: ($page, $site) =>
          $page.frontmatter.image
            ? ($site.themeConfig.domain || '') + $page.frontmatter.image
            : ($site.themeConfig.domain || '') + $site.themeConfig.defaultImage,
        publishedAt: $page =>
          $page.frontmatter.date && new Date($page.frontmatter.date),
        modifiedAt: $page => $page.lastUpdated && new Date($page.lastUpdated),
        customMeta: (add, context) => {
          const { $site, image } = context
          add(
            'twitter:site',
            ($site.themeConfig.author && $site.themeConfig.author.twitter) || ''
          )
          add('image', image)
          add('keywords', $site.themeConfig.keywords)
        }
      }
    ],
    [
      'vuepress-plugin-sitemap',
      {
        hostname: DEPLOY_DOMAIN,
        dateFormatter: _ => {
          return new Date().toISOString()
        },
        // 排除无实际内容的页面
        exclude: ["/404.html"]
      }
    ],
    [
      'vuepress-plugin-robots',
      {
        host: DEPLOY_DOMAIN
      }
    ],
    [
      'vuepress-plugin-canonical',
      {
        // add <link rel="canonical" header (https://tools.ietf.org/html/rfc6596)
        // to deduplicate SEO across all copies loaded from various public gateways
        baseURL: DEPLOY_DOMAIN
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'callout',
        defaultTitle: ''
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'right',
        defaultTitle: ''
      }
    ],
    [
      'vuepress-plugin-container',
      {
        type: 'left',
        defaultTitle: ''
      }
    ],
    'vuepress-plugin-check-md',
    'vuepress-plugin-ipfs'
  ],
  extraWatchFiles: ['.vuepress/nav/zh-CN.js']
}
