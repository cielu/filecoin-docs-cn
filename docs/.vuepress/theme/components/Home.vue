<template>
  <main class="home">
    <div class="home-container theme-default-content">
      <Content class="intro" />
      <div class="grid">
        <div
          v-for="(category, i) in manualSidebar"
          :key="i"
          v-bind:class="{
            category: true,
            meta: category.title === 'Community' || category.title === 'Project'
          }"
        >
          <h2>
            <RouterLink :to="category.path" class="title">
              {{ category.title }}
            </RouterLink>
          </h2>
          <p v-for="(item, j) in category.children" :key="j">
            <RouterLink v-if="!isExternal(item.path)" :to="item.path">
              {{ item.title }}
            </RouterLink>
            <a v-else :href="item.path" target="_blank">
              {{ item.title }}
              <OutboundLink />
            </a>
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { isExternal } from '@parent-theme/util/'

export default {
  name: 'Home',
  data: function () {
    return {
      manualSidebar: [
        {
          title: '开始',
          path: '/get-started',
          children: [
            {
              title: 'Filecoin是什么?',
              path: '/about-filecoin/what-is-filecoin'
            },
            {
              title: 'Filecoin是怎么工作的',
              path: '/about-filecoin/how-filecoin-works'
            },
            {
              title: 'Filecoin网络',
              path: 'https://networks.filecoin.io'
            },
            {
              title: 'Lotus的安装与使用',
              path: '/get-started/lotus/installation'
            },
            {
              title: 'Lotus钱包',
              path: '/get-started/lotus/send-and-receive-fil'
            },
            {
              title: 'Filecoin 问答',
              path: '/about-filecoin/faq'
            },
            {
              title: '词汇表',
              path: '/reference/glossary'
            }
          ]
        },
        {
          title: '存储文件',
          path: '/store',
          children: [
            {
              title: '弹弓竞赛(Slingshot)',
              path: 'http://slingshot.filecoin.io/'
            },
            {
              title: '使用Slate存储文件',
              path: '/store/slate'
            },
            {
              title: '使用Lotus存储文件',
              path: '/store/lotus/store-data'
            },
            {
              title: '存储超大文件',
              path: '/store/lotus/very-large-files'
            },
            {
              title: '检索数据',
              path: '/store/lotus/retrieve-data'
            },
            {
              title: '从IPFS导入数据',
              path: '/store/lotus/import-data-from-ipfs'
            }
          ]
        },
        {
          title: '挖矿',
          path: '/mine',
          children: [
            {
              title: '矿工是怎么工作的',
              path: '/mine/how-mining-works'
            },
            {
              title: '硬件要求',
              path: '/mine/hardware-requirements'
            },
            {
              title: '挖矿架构',
              path: '/mine/mining-architectures'
            },
            {
              title: 'Lotus miner 程序',
              path: '/mine/lotus'
            },
            {
              title: 'Lotus miner 的使用',
              path: '/mine/lotus/miner-setup'
            },
            {
              title: '配置参考',
              path: '/mine/lotus/miner-configuration'
            },
            {
              title: '密封工作者',
              path: '/mine/lotus/seal-workers'
            }
          ]
        },
        {
          title: '构建',
          path: '/build',
          children: [
            {
              title: 'Textile Buckets',
              path: '/build/textile-buckets'
            },
            {
              title: '托管 Powergate',
              path: '/build/hosted-powergate'
            },
            {
              title: 'Glif 节点',
              path: '/build/hosted-lotus'
            },
            {
              title: '固定服务',
              path: '/build/filecoin-pinning-services'
            },
            {
              title: 'Lotus API',
              path: '/reference/lotus-api'
            },
            {
              title: '应用案例',
              path: '/build/examples'
            },
            {
              title: 'Filecoin社区资源',
              path:
                'https://github.com/filecoin-project/docs/wiki#community-resources'
            },
            {
              title: '协议规范',
              path: 'https://github.com/filecoin-project/specs'
            }
          ]
        },
        {
          title: '社区',
          path: '/community',
          children: [
            {
              title: '贡献方式',
              path: '/community/contribute/ways-to-contribute'
            },
            {
              title: '聊天与讨论区',
              path: '/community/chat-and-discussion-forums'
            },
            {
              title: '社交媒体',
              path: '/community/social-media/social-media'
            },
            {
              title: 'Docs：语法，格式和样式',
              path: '/community/contribute/grammar-formatting-and-style'
            },
            {
              title: 'Docs：写作指南',
              path: '/community/contribute/writing-guide'
            },
            {
              title: 'Docs：贡献教程',
              path: '/community/contribute/contribution-tutorial'
            }
          ]
        },
        {
          title: '项目',
          path: '/project',
          children: [
            {
              title: '安全问题',
              path:
                'https://github.com/filecoin-project/community/blob/master/SECURITY.md'
            },
            {
              title: '路线图',
              path:
                'https://app.instagantt.com/shared/s/1152992274307505/latest'
            },
            {
              title: '研究',
              path: 'https://research.filecoin.io/'
            },
            {
              title: '相关项目',
              path: '/project/related-projects'
            },
            {
              title: '行为守则',
              path:
                'https://github.com/filecoin-project/community/blob/master/CODE_OF_CONDUCT.md'
            }
          ]
        }
      ]
    }
  },
  methods: {
    isExternal
  }
}
</script>

<style lang="stylus">
.home .header-anchor {
  display: none;
}
</style>

<style lang="stylus" scoped>
@media (min-width: $MQNarrow) {
  .home {$contentClass}:not(.custom) {
      background: no-repeat url("/images/main-page-background.png");
      background-position: right 3rem;
      background-size: 280px 336px;
  }
}
.home {$contentClass}:not(.custom) > h1:first-child {
    font-weight: normal;
    margin: 0 0 3rem;
}
.home {
    .intro {
	max-width: 500px;
	margin-top: 3rem;
    }
    .grid {
	margin-top: 4rem;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-auto-flow: row dense;
	grid-auto-rows: auto;
	grid-gap: 32px;
    }
    .category {
	background: linear-gradient(-50deg, #effcf5, #e2f6f7);
	padding: 1em;
    }
    .category.meta {
	background: linear-gradient(-50deg, #dbe7f4, #e9dbf4);
    }
    .category h2 {
	font-weight: normal;
	font-size: 1.4rem;
	border-bottom: none;
	margin: 0 0 0.5rem;
    }
    .category p {
	margin: 0;
    }
    .category a {
	font-weight: normal;
    }
    .category.meta a {
	color: #5c456e;
    }

    .category a.title {
	color: black;
    }

    @media (max-width: $MQNarrow) {
	.grid {
	    grid-template-columns: 1fr;
	    /* grid-auto-rows: minmax(16rem, max-content); */
	    grid-auto-rows: auto;

	}
	.category {
	    grid-column: auto !important;
	    grid-row: auto !important;
	}

	.intro {
	  margin-top: 0;
	}
    }
}
</style>
