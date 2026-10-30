import type { PageDictionary } from '../../../core/types'
import { joinCjk } from '../helpers'
import { millions } from './numbers'

/**
 * 合作伙伴页（/education/partners）：首屏、数据、合作方式折叠面板、CTA、三类合作伙伴卡片、常见问题。
 * 常见问题里只隔注释的相邻文本（our partnership application、partner portal 等）先整组匹配，整句照录；
 * 再给出各段，供分段时回退。推荐语由 shared 的忽略规则排除。
 */
export default {
  static: {
    // 首屏
    'Connect and collaborate with educators and students worldwide': '與全球的教育工作者和學生交流並協作',
    'Join us in our mission to empower the next generation of developers': '與我們一同肩負培育下一代開發人員的使命',
    'Partner with GitHub Education': '與 GitHub 教育合作',

    // 数据（数字见 regexp）
    'Your presence with us now can set the stage for future partnerships.':
      '現在與我們同行，就能為未來的合作奠定基礎。',
    'Integrate your tools with our resources to amplify the learning path of tomorrow’s developers.':
      '將你的工具與我們的資源整合，拓展未來開發人員的學習路徑。',
    'Connect with us to help them build their skills and become an integral part of their career.':
      '與我們聯絡，協助他們培養技能，並成為他們職涯中不可或缺的一部分。',

    // 合作方式折叠面板：<b>Expand your impact.</b> Increase your product’s exposure …
    'Expand your impact.': '擴大你的影響力。',
    'Increase your product’s exposure in the GitHub learning community and the tech industry at large.':
      '提升你的產品在 GitHub 學習社群乃至整個科技業的曝光度。',
    'Join the Student Developer Pack': '加入學生開發人員套件',
    'Let’s get you some new lifelong users through the Student Developer Pack! Join our bundle of 80+ professional-grade tools that only verified students can access, so they can ship their projects like a pro.':
      '透過學生開發人員套件，為你贏得一批新的終身使用者！加入我們由 80 多款專業級工具組成的組合，這些工具僅限已驗證的學生使用，讓他們能像專業人士一樣交付專案。',
    'Protect your brand from fraud and abuse': '保護你的品牌免受詐欺和濫用',
    'Reach real students worldwide, while maintaining your brand’s authenticity and trust. Our system meticulously verifies users, monitors to prevent misuse, and ensures the program remains true to its purpose of enabling the next generation of developers.':
      '觸及全球真正的學生，同時維護品牌的真實性和信任度。我們的系統會嚴格驗證使用者、監控以防止濫用，並確保這項計畫始終忠於培育下一代開發人員的宗旨。',
    'Connect with our student community': '與我們的學生社群交流',
    'Want a direct line to the students of the world? Work with us to engage with our incredible community of student learners through content, events, and more.':
      '想直接接觸全球的學生嗎？與我們合作，透過內容、活動等方式，與我們出色的學生學習者社群互動。',
    'Hack the future with us': '與我們一起開創未來',
    'Join forces with us to make a mark in the hackathon circuit. Provide coveted prizes, showcase your branded swag, and enjoy mutual promotion at key coding events. These partnerships will put your brand in the spotlight and inspire the next wave of tech talent.':
      '與我們攜手，在黑客松賽事中留下印記。提供令人嚮往的獎品、展示你的品牌周邊，並在重要的程式設計活動中互相宣傳。這些合作將讓你的品牌成為焦點，並激勵下一波科技人才。',

    // 合作伙伴评价：<b>Our partners love working with us.</b> Discover why …（视觉隐藏的标题是整句）
    'Our partners love working with us. Discover why our partners continually choose to engage with our exceptional community.':
      '我們的合作夥伴樂於與我們合作。瞭解合作夥伴為何持續選擇參與我們卓越的社群。',
    'Our partners love working with us.': '我們的合作夥伴樂於與我們合作。',
    'Discover why our partners continually choose to engage with our exceptional community.':
      '瞭解合作夥伴為何持續選擇參與我們卓越的社群。',

    // CTA
    'Ready to work with us?': '準備好與我們合作了嗎？',
    'Join us today in our mission to empower the tech innovators of tomorrow.':
      '立即與我們一同肩負培育未來科技創新者的使命。',

    // 三类合作伙伴卡片
    'There are multiple ways you can partner with us. Choose what best aligns with your business goals.':
      '與我們合作的方式有很多種。選擇最符合你業務目標的方式。',
    'Community partner': '社群合作夥伴',
    'Want to work directly with our communities, like the Campus Experts? You can get involved through co-branded content, meetups, and more.':
      '想直接與校園專家等我們的社群合作嗎？你可以透過聯名內容、聚會等方式參與。',
    'Resource partner': '資源合作夥伴',
    'Looking to share your product with students worldwide? This option is the perfect fit for those who want a long-term partnership with a global reach.':
      '想與全球學生分享你的產品嗎？這個選項最適合希望建立長期合作、觸及全球的夥伴。',
    'Events partner': '活動合作夥伴',
    'Get in on the action. Sponsor a prize category, collaborate on an event, or create your own mini-event.':
      '加入行列。贊助獎項類別、合辦活動，或自行舉辦小型活動。',

    // 常见问题
    'How do I become a Student Developer Pack Partner?': '如何成為學生開發人員套件合作夥伴？',
    // … Please fill out <!-- -->our partnership application<!-- --> to have your company considered. …
    'Student Developer Pack partners are an essential part of our student’s learning experience. We seek out and onboard 5-10 new partners per year. Partner tools and resources must align with the developer lifecycle or related fields and be offered at no cost to the student. Please fill out our partnership application to have your company considered. Please note that not all who inquire are approved to join the Student Developer Pack.':
      '學生開發人員套件合作夥伴是學生學習體驗中不可或缺的一環。我們每年會尋找並引進 5-10 家新的合作夥伴。合作夥伴的工具和資源必須符合開發人員生命週期或相關領域，並免費提供給學生。請填寫我們的合作申請表，以便我們評估你的公司。請注意，並非所有洽詢者都會獲准加入學生開發人員套件。',
    'Student Developer Pack partners are an essential part of our student’s learning experience. We seek out and onboard 5-10 new partners per year. Partner tools and resources must align with the developer lifecycle or related fields and be offered at no cost to the student. Please fill out':
      '學生開發人員套件合作夥伴是學生學習體驗中不可或缺的一環。我們每年會尋找並引進 5-10 家新的合作夥伴。合作夥伴的工具和資源必須符合開發人員生命週期或相關領域，並免費提供給學生。請填寫',
    'our partnership application': '我們的合作申請表',
    'to have your company considered. Please note that not all who inquire are approved to join the Student Developer Pack.':
      '，以便我們評估你的公司。請注意，並非所有洽詢者都會獲准加入學生開發人員套件。',
    'What kind of ways can my company partner with GitHub Education?': '我的公司可以透過哪些方式與 GitHub 教育合作？',
    'We have three main ways you can partner with GitHub Education. You can be a Resource Partner through the Student Developer Pack or by otherwise offering free tools or resources to students. You can be a Community Partner, supporting students in their communities or an Event and Strategic Partner, by collaborating on a Hackathon, conference, or other event.':
      '與 GitHub 教育合作主要有三種方式。你可以透過學生開發人員套件，或以其他方式向學生免費提供工具或資源，成為資源合作夥伴；也可以在學生所屬的社群中支援他們，成為社群合作夥伴；或是透過合辦黑客松、研討會或其他活動，成為活動和策略合作夥伴。',
    'Is there a difference between partnering with GitHub Education and partnering with GitHub?':
      '與 GitHub 教育合作和與 GitHub 合作有什麼不同？',
    // … please visit the <!-- -->partner portal<!-- --> to better understand …（首段超过采集上限，按快照照录）
    'GitHub Education partnerships drive adoption and engagement by seeking out and providing industry standard tools and resources for all future developers. We do this by partnering with companies who support our learners with free use of their tools, special events, training opportunities, product testing, and more for a mutually beneficial learning environment. To grow your business with GitHub, please visit the partner portal to better understand Channel, Service, and Technical Partnership opportunities.':
      'GitHub 教育的合作關係致力於為所有未來的開發人員尋找並提供業界標準的工具和資源，藉此推動採用和參與。為此，我們與各家公司合作，由它們為學習者提供免費使用的工具、特別活動、培訓機會、產品測試等，共同打造互惠的學習環境。若要與 GitHub 一起拓展業務，請造訪合作夥伴入口網站，進一步瞭解通路、服務和技術合作機會。',
    'GitHub Education partnerships drive adoption and engagement by seeking out and providing industry standard tools and resources for all future developers. We do this by partnering with companies who support our learners with free use of their tools, special events, training opportunities, product testing, and more for a mutually beneficial learning environment. To grow your business with GitHub, please visit the':
      'GitHub 教育的合作關係致力於為所有未來的開發人員尋找並提供業界標準的工具和資源，藉此推動採用和參與。為此，我們與各家公司合作，由它們為學習者提供免費使用的工具、特別活動、培訓機會、產品測試等，共同打造互惠的學習環境。若要與 GitHub 一起拓展業務，請造訪',
    'partner portal': '合作夥伴入口網站',
    'to better understand Channel, Service, and Technical Partnership opportunities.':
      '，進一步瞭解通路、服務和技術合作機會。',
    'What kinds of partners are you looking for?': '你們在尋找什麼樣的合作夥伴？',
    'GitHub Education’s mission is to enable all future developers. We seek partners who align with this mission to share knowledge, tools, and resources to make the future of development as strong as it can be. Partners must be willing to offer free resources to students that align with the learning journey.':
      'GitHub 教育的使命是培育所有未來的開發人員。我們尋找認同這項使命的合作夥伴，一起分享知識、工具和資源，讓軟體開發的未來盡可能茁壯。合作夥伴必須願意向學生免費提供符合學習歷程的資源。',
    'My company wants to partner with GitHub Education on an in-person event. What is the process for this?':
      '我的公司想與 GitHub 教育合作舉辦實體活動。流程是什麼？',
    // … but please fill out <!-- -->our partnership form<!-- --> and we will be in touch …
    'We have limited capacity to support all in person event requests, but please fill out our partnership form and we will be in touch if we are able to move forward with your request.':
      '我們能支援的實體活動申請有限，但請填寫我們的合作表單，如果我們能推進你的申請，會再與你聯絡。',
    'We have limited capacity to support all in person event requests, but please fill out':
      '我們能支援的實體活動申請有限，但請填寫',
    'our partnership form': '我們的合作表單',
    'and we will be in touch if we are able to move forward with your request.':
      '，如果我們能推進你的申請，會再與你聯絡。',
    'There was a product I thought was in the Student Developer Pack but I no longer see it. What happened?':
      '我以為學生開發人員套件裡有某項產品，但現在看不到了。這是怎麼回事？',
    // … visit our <!-- -->Student Developer Pack public repository<!-- -->, which is updated regularly.
    'Sometimes, a company has to leave the Student Developer Pack and no longer offers their resources to students through our system. In some cases, it’s because the company has decided to offer their own student benefit directly. In other cases, it’s because offering a free benefit isn’t aligned with their business goals. For the most up to date list of Pack partners, visit our Student Developer Pack public repository, which is updated regularly.':
      '有時，某家公司必須退出學生開發人員套件，不再透過我們的系統向學生提供資源。有些是因為該公司決定直接提供自己的學生優惠，有些則是因為提供免費優惠不符合其業務目標。如需最新的套件合作夥伴清單，請造訪我們的學生開發人員套件公開儲存庫，該儲存庫會定期更新。',
    'Sometimes, a company has to leave the Student Developer Pack and no longer offers their resources to students through our system. In some cases, it’s because the company has decided to offer their own student benefit directly. In other cases, it’s because offering a free benefit isn’t aligned with their business goals. For the most up to date list of Pack partners, visit our':
      '有時，某家公司必須退出學生開發人員套件，不再透過我們的系統向學生提供資源。有些是因為該公司決定直接提供自己的學生優惠，有些則是因為提供免費優惠不符合其業務目標。如需最新的套件合作夥伴清單，請造訪我們的',
    'Student Developer Pack public repository': '學生開發人員套件公開儲存庫',
  },
  scoped: {
    'Partner now': '立即合作',
    // 只用于「… visit our <!-- -->Student Developer Pack public repository<!-- -->, which is updated regularly.」逐段回退，「該儲存庫」只对本句成立
    ', which is updated regularly.': '，該儲存庫會定期更新。',
  },
  regexp: [
    // +50% of students will influence their workplaces / 75% of student developers actively self-educate
    [/^\+(\d+)% of students will influence their workplaces$/, '超過 $1% 的學生將影響其職場'],
    [/^(\d+)% of student developers actively self-educate$/, '$1% 的學生開發人員主動自學'],
    // 5M students use GitHub Education
    [/^(\d+)M students use GitHub Education$/, (_, count) => joinCjk(millions(count!), '位學生使用 GitHub 教育')],
  ],
} satisfies PageDictionary
