import type { PageDictionary } from '../../../core/types'

/**
 * Wiki 编辑器：工具栏与标记语言帮助面板（Markdown、AsciiDoc、Org-mode、Pod、Textile）。
 * 帮助正文被 <code> 等元素拆成多个文本节点，按片段收录，<code> 中的语法示例不翻译；
 * 片段译文按原文顺序与示例拼接后成句；只括住示例的括号用半角，与两侧中文各空一格。短片段与菜单名只在 Wiki 生效（scoped）。
 * 上传出错的附件类型片段（with a GIF, … or WEBP.）由 common-ui 的全局正则翻译。
 */
export default {
  static: {
    // Markdown 帮助：块级元素
    'Block Elements': '块级元素',
    'Paragraphs & Breaks': '段落与换行',
    'To create a paragraph, simply create a block of text that is not separated by one or more blank lines. Blocks of text separated by one or more blank lines will be parsed as paragraphs.':
      '要创建段落，只需写一段中间没有空行的文本。由一个或多个空行分隔的文本块会被解析为段落。',
    'If you want to create a line break, end a line with two or more spaces, then hit Return/Enter.':
      '如需换行，请在行尾输入两个或更多空格，然后按 Return/Enter。',
    // … prefix your header text with the number of <code>#</code> characters to specify heading depth. For example: …
    'Markdown supports two header formats. The wiki editor uses the “atx”-style headers. Simply prefix your header text with the number of':
      'Markdown 支持两种标题格式。Wiki 编辑器使用“atx”风格的标题。只需在标题文本前加上若干个',
    'characters to specify heading depth. For example:': '字符来指定标题级别。例如：',
    'will be progressively smaller headers. You may end your headers with any number of hashes.':
      '会依次显示为逐级变小的标题。标题末尾可以加任意数量的井号。',
    // … email-style by prefixing each line with the <code>&gt;</code>. This looks best …
    'Markdown creates blockquotes email-style by prefixing each line with the':
      'Markdown 按电子邮件风格创建引用块的方法是在每行前加上',
    '. This looks best if you decide to hard-wrap text and prefix each line with a': '。手动换行并在每行前都加上',
    'character, but Markdown supports just putting': '字符时效果最好，不过 Markdown 也支持只在段落前放一个',
    'before your paragraph.': '。',
    'Markdown supports both ordered and unordered lists. To create an ordered list, simply prefix each line with a number (any number will do — this is why the editor only uses one number.) To create an unordered list, you can prefix each line with':
      'Markdown 支持有序列表和无序列表。要创建有序列表，只需在每行前加上数字（任何数字都可以——所以编辑器只使用一个数字。）要创建无序列表，可以在每行前加上',
    'List items can contain multiple paragraphs, however each paragraph must be indented by at least 4 spaces or a tab.':
      '列表项可以包含多个段落，但每个段落至少要缩进 4 个空格或一个制表符。',
    'Code Blocks': '代码块',
    'Markdown wraps code blocks in pre-formatted tags to preserve indentation in your code blocks. To create a code block, indent the entire block by at least 4 spaces or one tab. Markdown will strip the extra indentation you’ve added to the code block.':
      'Markdown 会用预格式化标签包裹代码块以保留其中的缩进。要创建代码块，请将整个块缩进至少 4 个空格或一个制表符。Markdown 会去掉你为代码块额外添加的缩进。',
    'Horizontal Rules': '水平分割线',
    'Horizontal rules are created by placing three or more hyphens, asterisks or underscores on a line by themselves. Spaces are allowed between the hyphens, asterisks or underscores.':
      '在单独一行中放置三个或更多连字符、星号或下划线即可创建水平分割线。连字符、星号或下划线之间可以有空格。',

    // Markdown 帮助：行内元素
    'Span Elements': '行内元素',
    'Markdown has two types of links:': 'Markdown 有两种链接：',
    '. For both types of links, the text you want to display to the user is placed in square brackets. For example, if you want your link to display the text “GitHub”, you write':
      '。两种链接都把要显示给用户的文本放在方括号中。例如，要让链接显示文本“GitHub”，就写',
    'To create an inline link, create a set of parentheses immediately after the brackets and write your URL within the parentheses. (e.g.,':
      '要创建内联链接，请紧接在方括号后加一对圆括号并在其中写入 URL。（例如，',
    '). Relative paths are allowed in inline links.': '）。内联链接可以使用相对路径。',
    'To create a reference link, use two sets of square brackets.': '要创建引用链接，请使用两组方括号。',
    'will link to the internal reference': '会链接到内部引用',
    'Asterisks (': '星号 (',
    ') and underscores (': ') 和下划线 (',
    ') are treated as emphasis and are wrapped with an': ') 表示强调并会被包裹在',
    'tag, which usually displays as italics in most browsers. Double asterisks (':
      '标签中，大多数浏览器通常将其显示为斜体。双星号 (',
    ') or double underscores (': ') 或双下划线 (',
    ') are treated as bold using the': ') 表示粗体并使用',
    'tag. To create italic or bold text, simply wrap your words in single/double asterisks/underscores. For example,':
      '标签。要创建斜体或粗体文本，只需用一个或两个星号/下划线包裹文字。例如，',
    'To create inline spans of code, simply wrap the code in backticks (': '要创建行内代码，只需用反引号 (',
    '). Markdown will turn': ') 包裹代码。Markdown 会把',
    'Markdown image syntax looks a lot like the syntax for links; it is essentially the same syntax preceded by an exclamation point (':
      'Markdown 的图片语法与链接语法非常相似；基本上就是在链接语法前加一个感叹号 (',
    '). For example, if you want to link to an image at': ')。例如，要链接到位于',
    'with the alternate text': '的图片并使用替代文本',

    // Markdown 帮助：其他
    'Automatic Links': '自动链接',
    'If you want to create a link that displays the actual URL, markdown allows you to quickly wrap the URL in':
      '如果要创建显示实际 URL 的链接，Markdown 允许你直接用',
    'to do so. For example, the link': '包裹 URL。例如，链接',
    'is easily produced by writing': '只需写成',
    'If you want to use a special Markdown character in your document (such as displaying literal asterisks), you can escape the character with the backslash (':
      '如果要在文档中使用 Markdown 特殊字符（例如显示星号本身），可以用反斜杠 (',
    '). Markdown will ignore the character directly after a backslash.':
      ') 转义该字符。Markdown 不会解析紧跟在反斜杠后的字符。',

    // AsciiDoc 帮助：文本格式
    'ASCIIDoc headers can be written in two ways: with differing underlines or with different indentation using':
      'ASCIIDoc 标题有两种写法：使用不同的下划线或使用不同层级的',
    '(equals sign). ASCIIDoc supports headings 1-4. The editor will automatically use the':
      '（等号）。ASCIIDoc 支持 1～4 级标题。编辑器会自动使用',
    'notation. To create a level one header, prefix your line with one': '写法。要创建一级标题，请在行首加一个',
    'Superscript and subscript is created the same way as other inline formats. To create superscript text, wrap your text in':
      '上标和下标的创建方式与其他行内格式相同。要创建上标文本，请用',
    '(carats). To create subscript text, wrap your text in': '（脱字符）包裹文本。要创建下标文本，请用',
    'ASCIIDoc will automatically convert textual representations of commonly-used special characters. For example,':
      'ASCIIDoc 会自动转换常用特殊字符的文本写法。例如，',

    // AsciiDoc 帮助：块
    'ASCIIDoc allows paragraphs to have optional titles or icons to denote special sections. To make a normal paragraph, simply add a line between blocks and a new paragraph will start. If you want to title your paragraphs, adda line prefixed by':
      'ASCIIDoc 允许段落带有用于标示特殊部分的可选标题或图标。要创建普通段落，只需在块之间加一个空行即可开始新段落。如果要为段落添加标题，请添加一行以',
    '(full stop). An example paragraph with optional title is displayed below:':
      '（句点）开头的文本。下面是一个带可选标题的段落示例：',
    'To create source blocks (long blocks of code), follow the same syntax as above but with an extra line denoting the inline source and lines of four dashes (':
      '要创建源代码块（较长的代码块），请在上面语法的基础上额外加一行标明源代码类型并用由四个连字符 (',
    ') delimiting the source block.. An example of Python source is below:':
      ') 组成的行界定源代码块。下面是一个 Python 源代码示例：',
    'Comment blocks are useful if you want to keep notes for yourself inline but do not want them displayed to the public. To create a comment block, simply wrap the paragraph in dividers with four slashes (':
      '想在正文中给自己留备注又不想公开显示时可以使用注释块。要创建注释块，只需用由四个斜杠 (',
    '). An example comment block is below:': ') 组成的分隔线包裹段落。下面是一个注释块示例：',
    'Quote blocks work much like comment blocks — simply create dividers using four underscores (':
      '引用块的用法与注释块非常相似——只需在引用内容前后用四个下划线 (',
    ') around your quote. An example quote block is displayed below:': ') 创建分隔线。下面是一个引用块示例：',

    // AsciiDoc 帮助：宏
    'To create links to external pages, you can simply write the URI if you want the URI to link to itself. (i.e.,':
      '要创建指向外部页面的链接，在希望 URI 链接到其自身时直接写出 URI 即可。（例如，',
    '. If you want different text to be displayed, simply append it to the end of the URI in between':
      '。如果要显示其他文本，只需将文本附加到 URI 末尾并放在',
    'Images in ASCIIDoc work much like hyperlinks, but image URLs are prefixed with':
      'ASCIIDoc 中图片的用法与超链接非常相似，只是图片 URL 要加上前缀',
    '. Alt text can be added by appending the text to the URI in': '。替代文本可附加到 URI 后并放在',

    // Org-mode 帮助
    'Simply prefix your header text with the number of': '只需在标题文本前加上若干个',
    'To create a blockquote, simple embed the text between': '要创建引用块，只需将文本放在',
    'Org-mode supports both ordered and unordered lists. To create an ordered list, simply prefix each line with a number (any number will do — this is why the editor only uses one number.) To create an unordered list, you can prefix each line with':
      'Org-mode 支持有序列表和无序列表。要创建有序列表，只需在每行前加上数字（任何数字都可以——所以编辑器只使用一个数字。）要创建无序列表，可以在每行前加上',
    'Code Blocks are similar to blockquote, except that': '代码块与引用块类似，只是改用',
    'Org-mode supports simple tables (tables with equal number of cells in each row). To create a simple table, just separate the contents of each cell with a':
      'Org-mode 支持简单表格（每行单元格数量相同的表格）。要创建简单表格，只需用',
    'will appear as a table with two rows and three columns. Additionally,': '会显示为两行三列的表格。此外，',
    'will also appear as a table, but the first row will be interpreted as a header row and the':
      '也会显示为表格，但第一行会被解析为表头行并使用',
    'To create links to external pages, you need to enclose the URI in double square brackets. (i.e.,':
      '要创建指向外部页面的链接，需要用双层方括号包裹 URI。（例如，',
    ')If you want to add text, to be displayed to the user, you write the URI and the text next to each other, both enclosed in square brackets and both of them together enclosed in another pair of square brackets. For example, if you want your link to display the text “GitHub”, you write':
      '）如果要添加显示给用户的文本，请将 URI 和文本并排写出，各自用方括号包裹，再用另一对方括号将两者一起包裹。例如，要让链接显示文本“GitHub”，就写',
    'To create inline spans of code, simply wrap the code in equal signs (': '要创建行内代码，只需用等号 (',
    "Org-mode image syntax is exactly same as the syntax that you would use for a URI to link to itself. The image URI is enclosed in double square brackets. Alt text on images is not currently supported by Gollum's Org-mode parser.":
      'Org-mode 的图片语法与让 URI 链接到其自身的语法完全相同。图片 URI 用双层方括号包裹。Gollum 的 Org-mode 解析器目前不支持图片替代文本。',

    // Pod 帮助：命令段落
    'All command paragraphs start with': '所有命令段落都以',
    'To create headings 1 through 4, begin your command paragraph with': '要创建 1～4 级标题，请在命令段落开头写',
    'is the number of the heading 1 through 4. For example, to make a first-order heading (the largest possible,) write':
      '是 1～4 的标题级别。例如，要创建一级标题（最大的标题），请写',
    ', then on the next line begin your paragraph that you want under the heading.':
      '，然后在下一行开始写该标题下的段落。',
    'Perl pod blocks should begin with': 'Perl pod 块应以',
    ', signifying to Pod parsers that the pod block has begun and ended. These command paragraphs only signal the beginning and end of a pod block.':
      '结尾，以此告知 Pod 解析器 pod 块的开始和结束。这两个命令段落只用于标示 pod 块的开始和结束。',
    'pod also allows blocks in other formats, such as HTML or plain text. To create one of these blocks, use the':
      'pod 还支持其他格式的块，例如 HTML 或纯文本。要创建这类块，请使用',
    '). At the end of your block, use the': '）。在块的末尾，请使用',
    'If you are having encoding troubles, use the': '如果遇到编码问题，请使用',
    '). This will affect the entire document, not just the block below the command.':
      '）。这会影响整个文档，而不只是命令下方的块。',

    // Pod 帮助：格式
    'is an abbreviation for the type of text you are trying to create. For example,':
      '是要创建的文本类型的缩写。例如，',
    'Writing hyperlinks in pod is much like formatting text, using the same':
      '在 pod 中编写超链接与格式化文本非常相似，使用相同的',
    'page, a Perl documentation page, or another web page. To link to a': '手册页、Perl 文档页或其他网页。要链接到',
    'or Perl documentation page, simply include the page name in the link (e.g.':
      '手册页或 Perl 文档页，只需在链接中写上页面名称（例如',
    '). If you want to link to a web page, separate the URL and the link text with a pipe (e.g. to link to github.com, write':
      '）。如果要链接到网页，请用竖线分隔 URL 和链接文本（例如要链接到 github.com，请写',

    // Textile 帮助：短语修饰
    'To place emphasis or strength on inline text, simply place': '要强调或加重行内文本，只需在文本两侧加上',
    '(underscores) around the text for emphasis or': '（下划线）表示强调或加上',
    '(asterisks) around the text for strength. In most browsers,': '（星号）表示加重。在大多数浏览器中，',
    'To force italics or bold, simply double the characters:': '要强制显示斜体或粗体，只需将字符加倍：',
    'To display citations, wrap your text in': '要显示引文，请用',
    'To display edit marks such as deleted text (strikethrough) or inserted text (underlined text), wrap your text in':
      '要显示删除文本（删除线）或插入文本（下划线文本）等编辑标记，请用',
    'To display superscript, wrap your text in': '要显示上标，请用',
    '(carets). To display subscript, wrap your text in': '（脱字符）包裹文本。要显示下标，请用',
    'To display monospace code, wrap your text in': '要显示等宽代码，请用',
    'To create an acronym, suffix the acronym with the definition in parentheses. For example,':
      '要创建缩写词，请在缩写词后用括号写出完整释义。例如，',

    // Textile 帮助：块修饰
    'To display a heading in Textile, prefix your line of text with': '要在 Textile 中显示标题，请在文本行前加上',
    'equals the heading size you want (1 is largest, 6 is smallest).': '表示所需的标题大小（1 最大，6 最小）。',
    'To create a new paragraph, prefix your first line of a block of text with':
      '要创建新段落，请在文本块的第一行前加上',
    'To create a blockquote, make sure at least one blank line exists between your text and any surrounding text, and then prefix that block with':
      '要创建引用块，请确保文本与周围的文本之间至少有一个空行，然后在该块前加上',
    'If you need to extend a blockquote to more than one text block, write': '如果引用块需要延续到多个文本块，请写',
    '(note the two periods) and prefix your next normal paragraph with': '（注意是两个句点）并在下一个普通段落前加上',
    'Code blocks in textile are simply prefixed like any other block. To create a code block, place the beginning of the block on a separate line and prefix it with':
      'Textile 中的代码块与其他块一样只需加上前缀。要创建代码块，请将块的开头单独放在一行并在前面加上',
    'To display a preformatted block, prefix the block with': '要显示预格式化块，请在块前加上',
    'To create ordered lists, prefix each line with': '要创建有序列表，请在每行前加上',
    '. To create unordered lists, prefix each line with': '。要创建无序列表，请在每行前加上',

    // Textile 帮助：链接与图片
    'To display a link, put the text you want to display in quotes, then a colon (':
      '要显示链接，请将要显示的文本放在引号中，后接冒号 (',
    '), then the URL after the colon. For example': ')，再在冒号后写 URL。例如',
    'To display an image, simply wrap the image’s URL in': '要显示图片，只需用',
    '(exclamation points). If you want to link the image to a URL, you can blend the image and link syntax: place your image URL in the exclamation points and suffix that with a colon and your URL. For example, an image at':
      '（感叹号）包裹图片的 URL。如果要将图片链接到某个 URL，可以组合使用图片和链接语法：将图片 URL 放在感叹号之间并在后面加上冒号和你的 URL。例如，位于',
  },
  scoped: {
    // 新版编辑器工具栏（登录后）
    'Insert h1': '插入一级标题',
    'Insert h2': '插入二级标题',
    'Insert h3': '插入三级标题',
    'Add bold text': '添加粗体文本',
    'Add italic text': '添加斜体文本',
    'Add link': '添加链接',
    'Add image': '添加图片',
    'Insert code': '插入代码',
    'Add unordered list': '添加无序列表',
    'Add ordered list': '添加有序列表',
    'Insert blockquote': '插入引用块',
    'Insert horizontal rule': '插入水平分割线',
    'Markup help': '标记语言帮助',
    'Element type help navigation bar': '元素类型帮助导航栏',
    'Element type options help navigation bar': '元素类型选项帮助导航栏',

    // 帮助菜单（Markdown）
    Image: '图片',
    Images: '图片',
    Links: '链接',
    Blockquote: '引用块',
    Blockquotes: '引用块',
    Headers: '标题',
    Emphasis: '强调',
    Escaping: '转义',
    Miscellaneous: '其他',
    // 帮助菜单（AsciiDoc、Org-mode、Pod、Textile）；中文之间的斜杠两侧不加空格
    'Text Formatting': '文本格式',
    'Bold / Italic': '粗体/斜体',
    Scripts: '上标与下标',
    'Special Characters': '特殊字符',
    Blocks: '块',
    Paragraphs: '段落',
    'Source Blocks': '源代码块',
    'Comment Blocks': '注释块',
    'Quote Blocks': '引用块',
    Macros: '宏',
    Tables: '表格',
    'Command Paragraphs': '命令段落',
    Headings: '标题',
    'Beginning & Ending': '开头与结尾',
    'Other Formats': '其他格式',
    Encoding: '编码',
    Formatting: '格式',
    Text: '文本',
    Hyperlinks: '超链接',
    'Phrase Modifiers': '短语修饰',
    'Emphasis / Strength': '强调/加重',
    'Citations / Editing': '引文/编辑标记',
    'Superscript / Subscript': '上标/下标',
    Acronyms: '缩写词',
    'Block Modifiers': '块修饰',
    'Paragraphs / Quotes': '段落/引用',
    'Links / Images': '链接/图片',

    // Markdown 帮助中的短片段
    inline: '内联',
    reference: '引用',
    becomes: '会变成',
    ', and': '，而',
    into: '变成',
    ', you would write': '，就写',

    // AsciiDoc 帮助中的短片段：To display text as <strong>bold</strong>, wrap the text in <code>*</code> (asterisks). …
    // … Level two headers are created with <code>==</code> and so on.（原文无逗号，译文不加）
    '. Level two headers are created with': '。二级及以下标题依次用',
    'and so on.': '等创建。',
    'To display text as': '要将文本显示为',
    bold: '粗体',
    italic: '斜体',
    ', wrap the text in': '，请用',
    '(asterisks). To display text as': '（星号）包裹文本。要将文本显示为',
    '(underscores). To create': '（下划线）包裹文本。要创建',
    'text, wrap the text in': '文本，请用',
    '(plus signs).': '（加号）包裹文本。',
    '(tildes).': '（波浪号）包裹文本。',
    // <code>(R)</code> becomes ®, <code>(C)</code> becomes © and <code>(TM)</code> becomes ™.
    'becomes ®,': '会变成 ®，',
    'becomes © and': '会变成 © 而',
    'becomes ™.': '会变成 ™。',
    'will automatically be parsed to': '会被自动解析为',
    '(brackets.) For example,': '（方括号）中。例如，',
    'will be parsed as': '会被解析为',
    ', with the URI pointing to': '，URI 指向',
    '. For example, to link to an image at': '。例如，要链接到位于',
    ', write': '的图片，请写',
    '(brackets).': '（方括号）中。',

    // Org-mode 帮助中的短片段
    'will be progressively smaller headers.': '会依次显示为逐级变小的标题。',
    '. An example quote block is displayed below:': '之间。下面是一个引用块示例：',
    'are used.': '标记。',
    'character. For example,': '字符分隔各单元格的内容。例如，',
    'tag will be used to render it.': '标签渲染。',
    'Forward slashes (': '正斜杠 (',
    'tag. Asterisks (': '标签中。星号 (',
    'tag.': '标签。',
    '). Orgmode will turn': ') 包裹代码。Orgmode 会把',

    // Pod 帮助中的短片段
    '(equals sign).': '（等号）开头。',
    ', where': '，其中',
    'and end with': '开头并以',
    'command paragraph, where': '命令段落，其中',
    'is the syntax of the block (e.g.': '是块的语法（例如',
    'block.': '块。',
    'command, where': '命令，其中',
    'is the encoding type (e.g.': '是编码类型（例如',
    'Formatting text as': '将文本格式化为',
    'works in the': '可使用',
    'syntax, where': '语法，其中',
    'syntax. Instead of': '语法。只是不用',
    ', use': '，而是用',
    'to begin a hyperlink.': '开始超链接。',
    'pod allows you to hyperlink to a': 'pod 允许你链接到',

    // Textile 帮助中的短片段
    'will appear as italics and': '会显示为斜体而',
    'will appear as bold.': '会显示为粗体。',
    'will appear italic and': '会显示为斜体而',
    'will appear as bold text.': '会显示为粗体文本。',
    '(two question marks).': '（两个问号）包裹文本。',
    '(minuses) or': '（减号）或',
    '(pluses). For example': '（加号）包裹文本。例如',
    'will be rendered as': '会渲染为',
    '(at symbol). For example,': '（@ 符号）包裹文本。例如，',
    'will appear as': '会显示为',
    'will be displayed as': '会显示为',
    'that should link to': '并要链接到',
    'should be written as': '的图片应写为',
  },
  // 分句之间单独的“ and ”文本节点按片段命中 common 的“和”，分句读成名词并列；整句收录，改作“而”
  // （同面板名词并列的 and 仍作“和”，不加 scoped）。上面的片段键保留作后备
  inline: [
    // Textile 帮助：… wrap your text in <code>-</code> (minuses) or <code>+</code> (pluses). For example
    // <code>-mytext-</code> will be rendered as <span>mytext</span> and <code>+mytext+</code> will be rendered as …
    // 原文结尾无标点，译文不加
    [
      'To display edit marks such as deleted text (strikethrough) or inserted text (underlined text), wrap your text in {} (minuses) or {} (pluses). For example {} will be rendered as {} and {} will be rendered as {}',
      '要显示删除文本（删除线）或插入文本（下划线文本）等编辑标记，请用 {}（减号）或 {}（加号）包裹文本。例如 {} 会渲染为 {} 而 {} 会渲染为 {}',
    ],
    // Pod 帮助：Formatting text as <strong>bold</strong>, <em>italic</em> or <code>code</code> works in the …
    // For example, <code>B…</code> becomes <strong>…</strong>,  <code>I…</code> becomes <em>…</em> and …
    // 逗号后原有两个空格，句型写一个；原文 and 前无逗号，译文不加
    // bold / italic 槽位由上面的 scoped 译出：“将文本格式化为粗体、斜体或 code 可使用 S<word> 语法，……”
    // 例句后半：“……I<italic text> 会变成 italic text 而 C<code here()> 会变成 code here()。”
    [
      'Formatting text as {}, {} or {} works in the {} syntax, where {} is an abbreviation for the type of text you are trying to create. For example, {} becomes {}, {} becomes {} and {} becomes {}.',
      '将文本格式化为{}、{}或 {} 可使用 {} 语法，其中 {} 是要创建的文本类型的缩写。例如，{} 会变成 {}，{} 会变成 {} 而 {} 会变成 {}。',
    ],
  ],
} satisfies PageDictionary
