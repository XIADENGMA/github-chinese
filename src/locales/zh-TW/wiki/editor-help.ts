import type { PageDictionary } from '../../../core/types'

/**
 * Wiki 编辑器：工具列与标记语言说明面板（Markdown、AsciiDoc、Org-mode、Pod、Textile）。
 * 说明正文被 <code> 等元素拆成多个文本节点，按片段收录，<code> 中的语法示例不翻译；
 * 片段译文按原文顺序与示例拼接后成句；只括住示例的括号用半角，与两侧中文各空一格。短片段与选单名只在 Wiki 生效（scoped）。
 * 上传出错的附件类型片段（with a GIF, … or WEBP.）由 common-ui 的全局正则翻译。
 * 用词：blockquote → 區塊引用（与 common-ui 编辑器一致），code block → 程式碼區塊，parse → 剖析，render → 轉譯，
 * HTML 的 tag → 標籤，escape → 逸出（与 search/tips 一致，取微软繁中），tab → 定位字元，表格的 row / column / cell → 列 / 欄 / 儲存格。
 */
export default {
  static: {
    // Markdown 说明：区块元素
    'Block Elements': '區塊元素',
    'Paragraphs & Breaks': '段落和換行',
    'To create a paragraph, simply create a block of text that is not separated by one or more blank lines. Blocks of text separated by one or more blank lines will be parsed as paragraphs.':
      '若要建立段落，只要寫一段中間沒有空行的文字。以一個或多個空行分隔的文字區塊會剖析為段落。',
    'If you want to create a line break, end a line with two or more spaces, then hit Return/Enter.':
      '如果要換行，請在行尾輸入兩個以上的空格，然後按 Return/Enter。',
    // … prefix your header text with the number of <code>#</code> characters to specify heading depth. For example: …
    'Markdown supports two header formats. The wiki editor uses the “atx”-style headers. Simply prefix your header text with the number of':
      'Markdown 支援兩種標題格式。Wiki 編輯器使用「atx」樣式的標題。只要在標題文字前面加上若干個',
    'characters to specify heading depth. For example:': '字元來指定標題層級。例如：',
    'will be progressively smaller headers. You may end your headers with any number of hashes.':
      '會依序顯示為越來越小的標題。標題結尾可以加上任意數量的井字號。',
    // … email-style by prefixing each line with the <code>&gt;</code>. This looks best …
    'Markdown creates blockquotes email-style by prefixing each line with the':
      'Markdown 以電子郵件風格建立區塊引用的方法是在每一行前面加上',
    '. This looks best if you decide to hard-wrap text and prefix each line with a': '。手動換行並在每一行前面都加上',
    'character, but Markdown supports just putting': '字元時效果最好，不過 Markdown 也支援只在段落前面加上',
    'before your paragraph.': '。',
    'Markdown supports both ordered and unordered lists. To create an ordered list, simply prefix each line with a number (any number will do — this is why the editor only uses one number.) To create an unordered list, you can prefix each line with':
      'Markdown 支援有序清單和無序清單。若要建立有序清單，只要在每一行前面加上數字（任何數字都可以——所以編輯器只使用一個數字。）若要建立無序清單，可以在每一行前面加上',
    'List items can contain multiple paragraphs, however each paragraph must be indented by at least 4 spaces or a tab.':
      '清單項目可以包含多個段落，但每個段落至少要縮排 4 個空格或一個定位字元。',
    'Code Blocks': '程式碼區塊',
    'Markdown wraps code blocks in pre-formatted tags to preserve indentation in your code blocks. To create a code block, indent the entire block by at least 4 spaces or one tab. Markdown will strip the extra indentation you’ve added to the code block.':
      'Markdown 會用預先格式化的標籤包住程式碼區塊以保留其中的縮排。若要建立程式碼區塊，請將整個區塊縮排至少 4 個空格或一個定位字元。Markdown 會移除你在程式碼區塊中額外加入的縮排。',
    'Horizontal Rules': '水平分隔線',
    'Horizontal rules are created by placing three or more hyphens, asterisks or underscores on a line by themselves. Spaces are allowed between the hyphens, asterisks or underscores.':
      '在單獨一行中放置三個以上的連字號、星號或底線可建立水平分隔線。連字號、星號或底線之間可以有空格。',

    // Markdown 说明：行内元素
    'Span Elements': '行內元素',
    'Markdown has two types of links:': 'Markdown 有兩種連結：',
    '. For both types of links, the text you want to display to the user is placed in square brackets. For example, if you want your link to display the text “GitHub”, you write':
      '。兩種連結都會把要顯示給使用者的文字放在方括號中。例如，若要讓連結顯示文字「GitHub」，就寫成',
    'To create an inline link, create a set of parentheses immediately after the brackets and write your URL within the parentheses. (e.g.,':
      '若要建立行內連結，請在方括號後面緊接著加上一對圓括號並在其中寫入 URL。（例如，',
    '). Relative paths are allowed in inline links.': '）。行內連結可以使用相對路徑。',
    'To create a reference link, use two sets of square brackets.': '若要建立參考連結，請使用兩組方括號。',
    'will link to the internal reference': '會連結到內部參考',
    'Asterisks (': '星號 (',
    ') and underscores (': ') 和底線 (',
    ') are treated as emphasis and are wrapped with an': ') 表示強調並會以',
    'tag, which usually displays as italics in most browsers. Double asterisks (': '標籤包住，大多數瀏覽器通常會將其顯示為斜體。雙星號 (',
    ') or double underscores (': ') 或雙底線 (',
    ') are treated as bold using the': ') 表示粗體並使用',
    'tag. To create italic or bold text, simply wrap your words in single/double asterisks/underscores. For example,':
      '標籤。若要建立斜體或粗體文字，只要用一個或兩個星號/底線包住文字。例如，',
    'To create inline spans of code, simply wrap the code in backticks (': '若要建立行內程式碼，只要用反引號 (',
    '). Markdown will turn': ') 包住程式碼。Markdown 會把',
    'Markdown image syntax looks a lot like the syntax for links; it is essentially the same syntax preceded by an exclamation point (':
      'Markdown 的圖片語法和連結語法很像；基本上就是在連結語法前面加上驚嘆號 (',
    '). For example, if you want to link to an image at': ')。例如，若要連結到位於',
    'with the alternate text': '的圖片並使用替代文字',

    // Markdown 说明：其他
    'Automatic Links': '自動連結',
    'If you want to create a link that displays the actual URL, markdown allows you to quickly wrap the URL in':
      '如果要建立顯示實際 URL 的連結，Markdown 可讓你直接用',
    'to do so. For example, the link': '包住 URL。例如，連結',
    'is easily produced by writing': '只要寫成',
    'If you want to use a special Markdown character in your document (such as displaying literal asterisks), you can escape the character with the backslash (':
      '如果要在文件中使用 Markdown 特殊字元（例如顯示星號本身），可以用反斜線 (',
    '). Markdown will ignore the character directly after a backslash.': ') 逸出該字元。Markdown 會忽略緊接在反斜線後面的字元。',

    // AsciiDoc 说明：文字格式
    'ASCIIDoc headers can be written in two ways: with differing underlines or with different indentation using':
      'ASCIIDoc 標題有兩種寫法：使用不同的底線或使用不同層級的',
    '(equals sign). ASCIIDoc supports headings 1-4. The editor will automatically use the':
      '（等號）。ASCIIDoc 支援 1～4 級標題。編輯器會自動使用',
    'notation. To create a level one header, prefix your line with one': '寫法。若要建立一級標題，請在該行開頭加上一個',
    'Superscript and subscript is created the same way as other inline formats. To create superscript text, wrap your text in':
      '上標和下標的建立方式與其他行內格式相同。若要建立上標文字，請用',
    '(carats). To create subscript text, wrap your text in': '（插入號）包住文字。若要建立下標文字，請用',
    'ASCIIDoc will automatically convert textual representations of commonly-used special characters. For example,':
      'ASCIIDoc 會自動轉換常用特殊字元的文字表示法。例如，',

    // AsciiDoc 说明：区块
    'ASCIIDoc allows paragraphs to have optional titles or icons to denote special sections. To make a normal paragraph, simply add a line between blocks and a new paragraph will start. If you want to title your paragraphs, adda line prefixed by':
      'ASCIIDoc 允許段落加上選用的標題或圖示來標示特殊區段。若要建立一般段落，只要在區塊之間加一個空行就會開始新段落。如果要為段落加上標題，請新增一行以',
    '(full stop). An example paragraph with optional title is displayed below:': '（句點）開頭的文字。下方是帶有選用標題的段落範例：',
    'To create source blocks (long blocks of code), follow the same syntax as above but with an extra line denoting the inline source and lines of four dashes (':
      '若要建立原始碼區塊（較長的程式碼區塊），請沿用上方的語法並額外加上一行標明原始碼語言的文字和由四個連字號 (',
    ') delimiting the source block.. An example of Python source is below:': ') 組成的分隔線來界定原始碼區塊。下方是 Python 原始碼範例：',
    'Comment blocks are useful if you want to keep notes for yourself inline but do not want them displayed to the public. To create a comment block, simply wrap the paragraph in dividers with four slashes (':
      '想在內文中為自己留下附註又不想公開顯示時可以使用註解區塊。若要建立註解區塊，只要用由四個斜線 (',
    '). An example comment block is below:': ') 組成的分隔線包住段落。下方是註解區塊範例：',
    'Quote blocks work much like comment blocks — simply create dividers using four underscores (':
      '引用區塊的用法和註解區塊很像——只要用四個底線 (',
    ') around your quote. An example quote block is displayed below:': ') 在引用內容前後建立分隔線。下方是引用區塊範例：',

    // AsciiDoc 说明：巨集
    'To create links to external pages, you can simply write the URI if you want the URI to link to itself. (i.e.,':
      '若要建立連到外部頁面的連結，在希望 URI 連結到其本身時可以直接寫出 URI。（例如，',
    '. If you want different text to be displayed, simply append it to the end of the URI in between':
      '。如果要顯示其他文字，只要將文字附加在 URI 結尾並放在',
    'Images in ASCIIDoc work much like hyperlinks, but image URLs are prefixed with':
      'ASCIIDoc 中的圖片用法和超連結很像，但圖片 URL 前面要加上',
    '. Alt text can be added by appending the text to the URI in': '。替代文字可以附加在 URI 後面並放在',

    // Org-mode 说明
    'Simply prefix your header text with the number of': '只要在標題文字前面加上若干個',
    'To create a blockquote, simple embed the text between': '若要建立區塊引用，只要將文字放在',
    'Org-mode supports both ordered and unordered lists. To create an ordered list, simply prefix each line with a number (any number will do — this is why the editor only uses one number.) To create an unordered list, you can prefix each line with':
      'Org-mode 支援有序清單和無序清單。若要建立有序清單，只要在每一行前面加上數字（任何數字都可以——所以編輯器只使用一個數字。）若要建立無序清單，可以在每一行前面加上',
    'Code Blocks are similar to blockquote, except that': '程式碼區塊和區塊引用類似，只是改用',
    'Org-mode supports simple tables (tables with equal number of cells in each row). To create a simple table, just separate the contents of each cell with a':
      'Org-mode 支援簡單表格（每一列儲存格數量相同的表格）。若要建立簡單表格，只要用',
    'will appear as a table with two rows and three columns. Additionally,': '會顯示為兩列三欄的表格。此外，',
    'will also appear as a table, but the first row will be interpreted as a header row and the':
      '也會顯示為表格，但第一列會視為標題列並使用',
    'To create links to external pages, you need to enclose the URI in double square brackets. (i.e.,':
      '若要建立連到外部頁面的連結，需要用雙層方括號包住 URI。（例如，',
    ')If you want to add text, to be displayed to the user, you write the URI and the text next to each other, both enclosed in square brackets and both of them together enclosed in another pair of square brackets. For example, if you want your link to display the text “GitHub”, you write':
      '）如果要加入顯示給使用者的文字，請將 URI 和文字並排寫出，各自用方括號包住，再用另一對方括號把兩者一起包住。例如，若要讓連結顯示文字「GitHub」，就寫成',
    'To create inline spans of code, simply wrap the code in equal signs (': '若要建立行內程式碼，只要用等號 (',
    "Org-mode image syntax is exactly same as the syntax that you would use for a URI to link to itself. The image URI is enclosed in double square brackets. Alt text on images is not currently supported by Gollum's Org-mode parser.":
      'Org-mode 的圖片語法和讓 URI 連結到其本身的語法完全相同。圖片 URI 要用雙層方括號包住。Gollum 的 Org-mode 剖析器目前不支援圖片替代文字。',

    // Pod 说明：命令段落
    'All command paragraphs start with': '所有命令段落都以',
    'To create headings 1 through 4, begin your command paragraph with': '若要建立 1～4 級標題，請在命令段落開頭寫上',
    'is the number of the heading 1 through 4. For example, to make a first-order heading (the largest possible,) write':
      '是 1～4 的標題層級。例如，若要建立一級標題（最大的標題），請寫上',
    ', then on the next line begin your paragraph that you want under the heading.': '，然後在下一行開始撰寫該標題下的段落。',
    'Perl pod blocks should begin with': 'Perl pod 區塊應以',
    ', signifying to Pod parsers that the pod block has begun and ended. These command paragraphs only signal the beginning and end of a pod block.':
      '結尾，藉此告知 Pod 剖析器 pod 區塊的開始和結束。這些命令段落只用來標示 pod 區塊的開始和結束。',
    'pod also allows blocks in other formats, such as HTML or plain text. To create one of these blocks, use the':
      'pod 也支援其他格式的區塊，例如 HTML 或純文字。若要建立這類區塊，請使用',
    '). At the end of your block, use the': '）。在區塊結尾，請使用',
    'If you are having encoding troubles, use the': '如果遇到編碼問題，請使用',
    '). This will affect the entire document, not just the block below the command.': '）。這會影響整份文件，而不只是命令下方的區塊。',

    // Pod 说明：格式设定
    'is an abbreviation for the type of text you are trying to create. For example,': '是你要建立的文字類型的縮寫。例如，',
    'Writing hyperlinks in pod is much like formatting text, using the same': '在 pod 中撰寫超連結和設定文字格式很像，使用相同的',
    // man page 作「man 手冊頁」
    'page, a Perl documentation page, or another web page. To link to a': '手冊頁、Perl 說明文件頁面或其他網頁。若要連結到',
    'or Perl documentation page, simply include the page name in the link (e.g.':
      '手冊頁或 Perl 說明文件頁面，只要在連結中加入頁面名稱（例如',
    '). If you want to link to a web page, separate the URL and the link text with a pipe (e.g. to link to github.com, write':
      '）。如果要連結到網頁，請用垂直線分隔 URL 和連結文字（例如若要連結到 github.com，請寫成',

    // Textile 说明：片语修饰
    'To place emphasis or strength on inline text, simply place': '若要強調或加重行內文字，只要在文字兩側加上',
    '(underscores) around the text for emphasis or': '（底線）表示強調或加上',
    '(asterisks) around the text for strength. In most browsers,': '（星號）表示加重。在大多數瀏覽器中，',
    'To force italics or bold, simply double the characters:': '若要強制顯示斜體或粗體，只要將字元重複兩次：',
    'To display citations, wrap your text in': '若要顯示引文，請用',
    'To display edit marks such as deleted text (strikethrough) or inserted text (underlined text), wrap your text in':
      '若要顯示刪除文字（刪除線）或插入文字（底線文字）等編輯標記，請用',
    'To display superscript, wrap your text in': '若要顯示上標，請用',
    '(carets). To display subscript, wrap your text in': '（插入號）包住文字。若要顯示下標，請用',
    'To display monospace code, wrap your text in': '若要顯示等寬程式碼，請用',
    'To create an acronym, suffix the acronym with the definition in parentheses. For example,':
      '若要建立縮寫，請在縮寫後面用括號加上完整名稱。例如，',

    // Textile 说明：区块修饰
    'To display a heading in Textile, prefix your line of text with': '若要在 Textile 中顯示標題，請在文字行前面加上',
    'equals the heading size you want (1 is largest, 6 is smallest).': '代表你要的標題大小（1 最大，6 最小）。',
    'To create a new paragraph, prefix your first line of a block of text with': '若要建立新段落，請在文字區塊的第一行前面加上',
    'To create a blockquote, make sure at least one blank line exists between your text and any surrounding text, and then prefix that block with':
      '若要建立區塊引用，請確認文字和周圍的文字之間至少有一個空行，然後在該區塊前面加上',
    'If you need to extend a blockquote to more than one text block, write': '如果區塊引用需要延續到多個文字區塊，請寫上',
    '(note the two periods) and prefix your next normal paragraph with': '（注意是兩個句點）並在下一個一般段落前面加上',
    'Code blocks in textile are simply prefixed like any other block. To create a code block, place the beginning of the block on a separate line and prefix it with':
      'Textile 中的程式碼區塊和其他區塊一樣只要在前面加上標記。若要建立程式碼區塊，請將區塊開頭單獨放在一行並在前面加上',
    'To display a preformatted block, prefix the block with': '若要顯示預先格式化的區塊，請在區塊前面加上',
    'To create ordered lists, prefix each line with': '若要建立有序清單，請在每一行前面加上',
    '. To create unordered lists, prefix each line with': '。若要建立無序清單，請在每一行前面加上',

    // Textile 说明：连结与图片
    'To display a link, put the text you want to display in quotes, then a colon (':
      '若要顯示連結，請將要顯示的文字放在引號中，後面接冒號 (',
    '), then the URL after the colon. For example': ')，再在冒號後面寫上 URL。例如',
    'To display an image, simply wrap the image’s URL in': '若要顯示圖片，只要用',
    '(exclamation points). If you want to link the image to a URL, you can blend the image and link syntax: place your image URL in the exclamation points and suffix that with a colon and your URL. For example, an image at':
      '（驚嘆號）包住圖片的 URL。如果要將圖片連結到某個 URL，可以結合圖片和連結語法：將圖片 URL 放在驚嘆號之間並在後面加上冒號和你的 URL。例如，位於'
  },
  scoped: {
    // 新版编辑器工具列（登入后）；h1～h3 作「標題 1～3」（与 common-ui 编辑器的「標題 N」一致）
    'Insert h1': '插入標題 1',
    'Insert h2': '插入標題 2',
    'Insert h3': '插入標題 3',
    'Add bold text': '新增粗體文字',
    'Add italic text': '新增斜體文字',
    'Add link': '新增連結',
    'Add image': '新增圖片',
    'Insert code': '插入程式碼',
    'Add unordered list': '新增無序清單',
    'Add ordered list': '新增有序清單',
    'Insert blockquote': '插入區塊引用',
    'Insert horizontal rule': '插入水平分隔線',
    'Markup help': '標記語言說明',
    'Element type help navigation bar': '元素類型說明導覽列',
    'Element type options help navigation bar': '元素類型選項說明導覽列',

    // 说明选单（Markdown）
    Image: '圖片',
    Images: '圖片',
    Links: '連結',
    Blockquote: '區塊引用',
    Blockquotes: '區塊引用',
    Headers: '標題',
    Emphasis: '強調',
    Escaping: '逸出',
    Miscellaneous: '其他',
    // 说明选单（AsciiDoc、Org-mode、Pod、Textile）；中文之间的斜线两侧不加空格
    'Text Formatting': '文字格式',
    'Bold / Italic': '粗體/斜體',
    Scripts: '上標和下標',
    'Special Characters': '特殊字元',
    Blocks: '區塊',
    Paragraphs: '段落',
    'Source Blocks': '原始碼區塊',
    'Comment Blocks': '註解區塊',
    'Quote Blocks': '引用區塊',
    Macros: '巨集',
    Tables: '表格',
    'Command Paragraphs': '命令段落',
    Headings: '標題',
    'Beginning & Ending': '開頭和結尾',
    'Other Formats': '其他格式',
    Encoding: '編碼',
    Formatting: '格式設定',
    Text: '文字',
    Hyperlinks: '超連結',
    'Phrase Modifiers': '片語修飾',
    'Emphasis / Strength': '強調/加重',
    'Citations / Editing': '引文/編輯標記',
    'Superscript / Subscript': '上標/下標',
    Acronyms: '縮寫',
    'Block Modifiers': '區塊修飾',
    'Paragraphs / Quotes': '段落/引用',
    'Links / Images': '連結/圖片',

    // Markdown 说明中的短片段：Markdown has two types of links: <strong>inline</strong> and <strong>reference</strong>.
    inline: '行內',
    reference: '參考',
    becomes: '會變成',
    ', and': '，而',
    into: '變成',
    ', you would write': '，就寫成',

    // AsciiDoc 说明中的短片段：To display text as <strong>bold</strong>, wrap the text in <code>*</code> (asterisks). …
    // … Level two headers are created with <code>==</code> and so on.（原文无逗号，译文不加）
    '. Level two headers are created with': '。二級及以下的標題依序使用',
    'and so on.': '等建立。',
    'To display text as': '若要將文字顯示為',
    bold: '粗體',
    italic: '斜體',
    ', wrap the text in': '，請用',
    '(asterisks). To display text as': '（星號）包住文字。若要將文字顯示為',
    '(underscores). To create': '（底線）包住文字。若要建立',
    'text, wrap the text in': '文字，請用',
    '(plus signs).': '（加號）包住文字。',
    '(tildes).': '（波浪號）包住文字。',
    // <code>(R)</code> becomes ®, <code>(C)</code> becomes © and <code>(TM)</code> becomes ™.
    'becomes ®,': '會變成 ®，',
    'becomes © and': '會變成 © 而',
    'becomes ™.': '會變成 ™。',
    'will automatically be parsed to': '會自動剖析為',
    '(brackets.) For example,': '（方括號）中。例如，',
    'will be parsed as': '會剖析為',
    ', with the URI pointing to': '，URI 指向',
    '. For example, to link to an image at': '。例如，若要連結到位於',
    ', write': '的圖片，請寫成',
    '(brackets).': '（方括號）中。',

    // Org-mode 说明中的短片段
    'will be progressively smaller headers.': '會依序顯示為越來越小的標題。',
    '. An example quote block is displayed below:': '之間。下方是引用區塊範例：',
    // Code Blocks are similar to blockquote, except that <code>#+BEGIN_EXAMPLE</code> and <code>#+END_EXAMPLE</code> are used.
    // 「只是改用 … 和 …」已含 are used 的意思，只留句号
    'are used.': '。',
    'character. For example,': '字元分隔各儲存格的內容。例如，',
    'tag will be used to render it.': '標籤來轉譯。',
    'Forward slashes (': '正斜線 (',
    'tag. Asterisks (': '標籤包住。星號 (',
    'tag.': '標籤。',
    '). Orgmode will turn': ') 包住程式碼。Orgmode 會把',

    // Pod 说明中的短片段
    '(equals sign).': '（等號）開頭。',
    ', where': '，其中',
    'and end with': '開頭並以',
    'command paragraph, where': '命令段落，其中',
    'is the syntax of the block (e.g.': '是區塊的語法（例如',
    'block.': '區塊。',
    'command, where': '命令，其中',
    'is the encoding type (e.g.': '是編碼類型（例如',
    'Formatting text as': '將文字格式設定為',
    'works in the': '可使用',
    'syntax, where': '語法，其中',
    'syntax. Instead of': '語法。只是不用',
    ', use': '，而是用',
    'to begin a hyperlink.': '來開始超連結。',
    'pod allows you to hyperlink to a': 'pod 可讓你以超連結連到',

    // Textile 说明中的短片段
    'will appear as italics and': '會顯示為斜體而',
    'will appear as bold.': '會顯示為粗體。',
    'will appear italic and': '會顯示為斜體而',
    'will appear as bold text.': '會顯示為粗體文字。',
    '(two question marks).': '（兩個問號）包住文字。',
    '(minuses) or': '（減號）或',
    '(pluses). For example': '（加號）包住文字。例如',
    'will be rendered as': '會轉譯為',
    '(at symbol). For example,': '（@ 符號）包住文字。例如，',
    'will appear as': '會顯示為',
    'will be displayed as': '會顯示為',
    'that should link to': '並要連結到',
    'should be written as': '的圖片應寫成'
  },
  // 分句之间单独的「 and 」文本节点按片段命中 common 的「和」，分句读成名词并列；整句收录，改作「而」
  // （同面板名词并列的 and 仍作「和」，不加 scoped）。上面的片段键保留作后备
  inline: [
    // Textile 说明：… wrap your text in <code>-</code> (minuses) or <code>+</code> (pluses). For example
    // <code>-mytext-</code> will be rendered as <span>mytext</span> and <code>+mytext+</code> will be rendered as …
    // 原文结尾无标点，译文不加
    [
      'To display edit marks such as deleted text (strikethrough) or inserted text (underlined text), wrap your text in {} (minuses) or {} (pluses). For example {} will be rendered as {} and {} will be rendered as {}',
      '若要顯示刪除文字（刪除線）或插入文字（底線文字）等編輯標記，請用 {}（減號）或 {}（加號）包住文字。例如 {} 會轉譯為 {} 而 {} 會轉譯為 {}'
    ],
    // Pod 说明：Formatting text as <strong>bold</strong>, <em>italic</em> or <code>code</code> works in the …
    // For example, <code>B…</code> becomes <strong>…</strong>,  <code>I…</code> becomes <em>…</em> and …
    // 逗号后原有两个空格，句型写一个；原文 and 前无逗号，译文不加
    // bold / italic 槽位由上面的 scoped 译出：「將文字格式設定為粗體、斜體或 code 可使用 S<word> 語法，……」
    // 例句后半：「……I<italic text> 會變成 italic text 而 C<code here()> 會變成 code here()。」
    [
      'Formatting text as {}, {} or {} works in the {} syntax, where {} is an abbreviation for the type of text you are trying to create. For example, {} becomes {}, {} becomes {} and {} becomes {}.',
      '將文字格式設定為{}、{}或 {} 可使用 {} 語法，其中 {} 是你要建立的文字類型的縮寫。例如，{} 會變成 {}，{} 會變成 {} 而 {} 會變成 {}。'
    ]
  ]
} satisfies PageDictionary
