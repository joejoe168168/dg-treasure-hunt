// ============================================================
// Question bank — Math / English / Chinese / General knowledge
// Three difficulty tiers:
//   easy   = P1–P2  (15s per question, ×1 score)
//   medium = P3–P4  (12s per question, ×1.5 score)
//   hard   = P5–P6  (10s per question, ×2 score)
// Each question: { cat, q, a: [4 choices], c: correct index }
// ============================================================

export const CATEGORIES = {
  math:    { label: '數學 Math',      cls: 'cat-math' },
  english: { label: 'English',        cls: 'cat-english' },
  chinese: { label: '中文 Chinese',   cls: 'cat-chinese' },
  general: { label: '常識 General',   cls: 'cat-general' },
};

export const DIFFICULTIES = {
  easy:   { label: '初級 Easy',   sub: 'P1–P2', time: 15, mult: 1,   emoji: '🟢' },
  medium: { label: '中級 Medium', sub: 'P3–P4', time: 12, mult: 1.5, emoji: '🟡' },
  hard:   { label: '高級 Hard',   sub: 'P5–P6', time: 10, mult: 2,   emoji: '🔴' },
};

const BANK = {
  // ==========================================================
  // EASY (P1–P2)
  // ==========================================================
  easy: [
    // ---- math ----
    { cat: 'math', q: '3 + 5 = ?', a: ['7', '8', '9', '6'], c: 1 },
    { cat: 'math', q: '10 − 4 = ?', a: ['5', '7', '6', '4'], c: 2 },
    { cat: 'math', q: '2 + 2 + 2 = ?', a: ['4', '6', '8', '2'], c: 1 },
    { cat: 'math', q: '哪個數最大？', a: ['3', '9', '5', '7'], c: 1 },
    { cat: 'math', q: '5 隻貓加 2 隻貓，一共幾多隻？', a: ['6', '7', '8', '3'], c: 1 },
    { cat: 'math', q: '10 個蘋果食咗 3 個，剩番幾多個？', a: ['6', '7', '8', '13'], c: 1 },
    { cat: 'math', q: '哪一個是雙位數？', a: ['7', '12', '9', '5'], c: 1 },
    { cat: 'math', q: '比 6 大 1 的數是？', a: ['5', '6', '7', '8'], c: 2 },
    { cat: 'math', q: '2 個 5 加起來是多少？', a: ['7', '10', '12', '25'], c: 1 },
    { cat: 'math', q: '一隻手有多少隻手指？', a: ['4', '5', '6', '10'], c: 1 },
    { cat: 'math', q: '9 − 9 = ?', a: ['9', '1', '0', '18'], c: 2 },
    { cat: 'math', q: '4 + 4 = ?', a: ['6', '7', '8', '9'], c: 2 },
    { cat: 'math', q: '由 1 數到 10，「7」之後是？', a: ['6', '8', '9', '10'], c: 1 },
    { cat: 'math', q: '一個三角形有多少條邊？', a: ['2', '3', '4', '5'], c: 1 },
    { cat: 'math', q: '一個正方形有多少條邊？', a: ['3', '4', '5', '6'], c: 1 },

    // ---- english ----
    { cat: 'english', q: 'Which animal says "meow"?', a: ['Dog', 'Cat', 'Cow', 'Duck'], c: 1 },
    { cat: 'english', q: 'What colour is a banana?', a: ['Red', 'Blue', 'Yellow', 'Green'], c: 2 },
    { cat: 'english', q: 'How many legs does a dog have?', a: ['Two', 'Three', 'Four', 'Six'], c: 2 },
    { cat: 'english', q: '"I ___ a student."', a: ['am', 'is', 'are', 'be'], c: 0 },
    { cat: 'english', q: 'The opposite of "big" is…', a: ['tall', 'small', 'fat', 'long'], c: 1 },
    { cat: 'english', q: 'Which one is a fruit?', a: ['Chair', 'Apple', 'Car', 'Book'], c: 1 },
    { cat: 'english', q: 'The plural of "cat" is…', a: ['cats', 'cates', 'caties', 'cat'], c: 0 },
    { cat: 'english', q: 'Which word means 狗?', a: ['Cat', 'Dog', 'Bird', 'Fish'], c: 1 },
    { cat: 'english', q: '"An ___" — which word fits?', a: ['banana', 'egg', 'cake', 'pencil'], c: 1 },
    { cat: 'english', q: 'What do you say in the morning?', a: ['Good night', 'Good morning', 'Goodbye', 'See you'], c: 1 },
    { cat: 'english', q: 'The sky is ___.', a: ['blue', 'green', 'pink', 'brown'], c: 0 },
    { cat: 'english', q: 'Which animal can fly?', a: ['Fish', 'Bird', 'Dog', 'Pig'], c: 1 },
    { cat: 'english', q: '"She ___ a girl."', a: ['am', 'is', 'are', 'be'], c: 1 },
    { cat: 'english', q: 'The opposite of "hot" is…', a: ['warm', 'cold', 'wet', 'dry'], c: 1 },
    { cat: 'english', q: 'Which day comes after Monday?', a: ['Sunday', 'Tuesday', 'Friday', 'Saturday'], c: 1 },
    { cat: 'english', q: 'We see with our ___.', a: ['ears', 'eyes', 'nose', 'mouth'], c: 1 },
    { cat: 'english', q: 'Which one is a colour?', a: ['Run', 'Red', 'Rice', 'Rain'], c: 1 },
    { cat: 'english', q: '"One, two, three, ___"', a: ['five', 'four', 'six', 'ten'], c: 1 },
    { cat: 'english', q: 'A baby drinks ___.', a: ['coffee', 'milk', 'tea', 'cola'], c: 1 },
    { cat: 'english', q: 'Which one can swim?', a: ['Fish', 'Cat', 'Bird', 'Hen'], c: 0 },

    // ---- chinese ----
    { cat: 'chinese', q: '「大」的相反詞是？', a: ['高', '小', '多', '長'], c: 1 },
    { cat: 'chinese', q: '一（　）狗 — 應填哪個量詞？', a: ['本', '隻', '張', '架'], c: 1 },
    { cat: 'chinese', q: '「日」+「月」合起來是哪個字？', a: ['明', '晶', '昌', '朋'], c: 0 },
    { cat: 'chinese', q: '「上」的相反是？', a: ['左', '下', '中', '前'], c: 1 },
    { cat: 'chinese', q: '哪個字是顏色？', a: ['跑', '紅', '吃', '看'], c: 1 },
    { cat: 'chinese', q: '「爸爸的媽媽」我們叫她？', a: ['姨媽', '祖母', '姑姐', '舅母'], c: 1 },
    { cat: 'chinese', q: '「木」字有多少筆畫？', a: ['3', '4', '5', '6'], c: 1 },
    { cat: 'chinese', q: '一（　）書 — 應填哪個量詞？', a: ['隻', '本', '條', '輛'], c: 1 },
    { cat: 'chinese', q: '哪一個是水果？', a: ['白菜', '蘋果', '雞蛋', '麵包'], c: 1 },
    { cat: 'chinese', q: '「人」字有多少筆畫？', a: ['1', '2', '3', '4'], c: 1 },
    { cat: 'chinese', q: '「白天」的相反是？', a: ['早上', '黑夜', '中午', '下午'], c: 1 },
    { cat: 'chinese', q: '「快」的相反詞是？', a: ['急', '慢', '早', '遲'], c: 1 },
    { cat: 'chinese', q: '一（　）魚 — 應填哪個量詞？', a: ['條', '張', '本', '把'], c: 0 },
    { cat: 'chinese', q: '「哥哥」是男孩還是女孩？', a: ['男孩', '女孩', '都可以', '不知道'], c: 0 },
    { cat: 'chinese', q: '春、夏、秋、冬，哪個季節最冷？', a: ['春', '夏', '秋', '冬'], c: 3 },
    { cat: 'chinese', q: '「笑」的相反詞是？', a: ['唱', '哭', '叫', '講'], c: 1 },
    { cat: 'chinese', q: '太陽從哪一邊升起？', a: ['東', '南', '西', '北'], c: 0 },
    { cat: 'chinese', q: '「水」字有多少筆畫？', a: ['3', '4', '5', '6'], c: 1 },
    { cat: 'chinese', q: '哪個字和「手」的動作有關？', a: ['看', '拍', '聽', '行'], c: 1 },
    { cat: 'chinese', q: '「高」的相反詞是？', a: ['大', '矮', '長', '肥'], c: 1 },

    // ---- general ----
    { cat: 'general', q: '紅綠燈中哪個顏色代表「停」？', a: ['綠色', '紅色', '黃色', '藍色'], c: 1 },
    { cat: 'general', q: '一星期有多少天？', a: ['5', '6', '7', '8'], c: 2 },
    { cat: 'general', q: '香港市區的士是什麼顏色？', a: ['黃色', '紅色', '綠色', '藍色'], c: 1 },
    { cat: 'general', q: '過馬路時應該走？', a: ['馬路中間', '斑馬線', '車路', '欄杆'], c: 1 },
    { cat: 'general', q: '香港人搭車購物常用什麼卡？', a: ['圖書卡', '八達通', '生日卡', '貼紙卡'], c: 1 },
    { cat: 'general', q: '一年有多少個月？', a: ['10', '11', '12', '13'], c: 2 },
    { cat: 'general', q: '魚住在哪裡？', a: ['樹上', '水裡', '泥土裡', '天空'], c: 1 },
    { cat: 'general', q: '下雨天出門應該帶什麼？', a: ['風箏', '雨傘', '太陽眼鏡', '滑板'], c: 1 },
    { cat: 'general', q: '天星小輪在哪裡行駛？', a: ['天空', '海上', '馬路', '山上'], c: 1 },
    { cat: 'general', q: '醫生通常在哪裡工作？', a: ['學校', '醫院', '機場', '街市'], c: 1 },
    { cat: 'general', q: '雪糕應該是？', a: ['熱的', '凍的', '辣的', '苦的'], c: 1 },
    { cat: 'general', q: '哪一個是交通工具？', a: ['枱', '巴士', '書包', '電視'], c: 1 },
    { cat: 'general', q: '蘋果長在哪裡？', a: ['樹上', '海裡', '泥土下', '石頭裡'], c: 0 },
    { cat: 'general', q: '晚上抬頭會見到什麼？', a: ['太陽', '月亮', '彩虹', '白雲'], c: 1 },
    { cat: 'general', q: '消防員救火時開什麼車？', a: ['救護車', '消防車', '校巴', '貨車'], c: 1 },
    { cat: 'general', q: '我們用什麼器官聽聲音？', a: ['眼睛', '耳朵', '鼻子', '嘴巴'], c: 1 },
    { cat: 'general', q: '哪種動物的頸最長？', a: ['大象', '長頸鹿', '獅子', '熊貓'], c: 1 },
    { cat: 'general', q: '香港的雙層巴士有多少層？', a: ['1 層', '2 層', '3 層', '4 層'], c: 1 },
    { cat: 'general', q: '刷牙應該每天最少幾多次？', a: ['0 次', '2 次', '10 次', '不用刷'], c: 1 },
    { cat: 'general', q: '尖沙咀有一個著名的高塔叫？', a: ['鐘樓', '燈塔', '水塔', '炮台'], c: 0 },
    // ---- more easy ----
    { cat: 'math', q: '6 + 7 = ?', a: ['12', '13', '14', '11'], c: 1 },
    { cat: 'math', q: '2、4、6、8，下一個數是？', a: ['9', '10', '12', '14'], c: 1 },
    { cat: 'math', q: '15 − 5 = ?', a: ['5', '10', '15', '20'], c: 1 },
    { cat: 'math', q: '一隻貓有幾多隻腳？', a: ['2', '4', '6', '8'], c: 1 },
    { cat: 'math', q: '哪個數最小？', a: ['8', '3', '6', '9'], c: 1 },
    { cat: 'math', q: '1 + 2 + 3 = ?', a: ['5', '6', '7', '8'], c: 1 },
    { cat: 'math', q: '一日有幾多個小時？', a: ['12', '20', '24', '30'], c: 2 },
    { cat: 'math', q: '5 個 2 加起來是多少？', a: ['7', '10', '12', '52'], c: 1 },
    { cat: 'english', q: 'Which one is an animal?', a: ['Lion', 'Table', 'Cup', 'Shoe'], c: 0 },
    { cat: 'english', q: '"I have two ___."', a: ['hand', 'hands', 'handes', 'handies'], c: 1 },
    { cat: 'english', q: 'What colour is grass?', a: ['Blue', 'Green', 'Red', 'White'], c: 1 },
    { cat: 'english', q: '"This is ___ apple."', a: ['a', 'an', 'the a', 'two'], c: 1 },
    { cat: 'english', q: 'The opposite of "up" is…', a: ['top', 'down', 'tall', 'over'], c: 1 },
    { cat: 'english', q: 'Which one can we eat?', a: ['Rock', 'Rice', 'Ruler', 'Radio'], c: 1 },
    { cat: 'english', q: 'A ___ says "woof woof".', a: ['cat', 'dog', 'bird', 'fish'], c: 1 },
    { cat: 'english', q: '"Good ___!" — what do you say before bed?', a: ['morning', 'night', 'afternoon', 'lunch'], c: 1 },
    { cat: 'english', q: 'How many fingers are on one hand?', a: ['Four', 'Five', 'Six', 'Ten'], c: 1 },
    { cat: 'english', q: 'Which one is big?', a: ['Ant', 'Elephant', 'Bee', 'Mouse'], c: 1 },
    { cat: 'chinese', q: '「多」的相反詞是？', a: ['大', '少', '高', '長'], c: 1 },
    { cat: 'chinese', q: '「天」字有多少筆畫？', a: ['3', '4', '5', '6'], c: 1 },
    { cat: 'chinese', q: '哪個字是動物？', a: ['馬', '書', '山', '門'], c: 0 },
    { cat: 'chinese', q: '「左」的相反是？', a: ['上', '右', '前', '後'], c: 1 },
    { cat: 'chinese', q: '「開」的相反詞是？', a: ['閂', '關', '推', '拉'], c: 1 },
    { cat: 'chinese', q: '「山」字有多少筆畫？', a: ['2', '3', '4', '5'], c: 1 },
    { cat: 'chinese', q: '一（　）車 — 應填哪個量詞？', a: ['隻', '輛', '本', '條'], c: 1 },
    { cat: 'chinese', q: '「冷」的相反詞是？', a: ['凍', '熱', '涼', '暖'], c: 1 },
    { cat: 'chinese', q: '「媽媽的媽媽」我們叫她？', a: ['姑媽', '外婆', '姨姨', '嬸嬸'], c: 1 },
    { cat: 'general', q: '香港嘅渡海小輪叫咩名？', a: ['大星小輪', '天星小輪', '月星小輪', '海星小輪'], c: 1 },
    { cat: 'general', q: '邊種動物識游水？', a: ['魚', '貓', '雞', '兔'], c: 0 },
    { cat: 'general', q: '紅綠燈邊個顏色先可以過馬路？', a: ['紅色', '綠色', '黃色', '白色'], c: 1 },
    { cat: 'general', q: '落雪係咩顏色？', a: ['黑色', '白色', '藍色', '黃色'], c: 1 },
    { cat: 'general', q: '邊個節日會收利是？', a: ['中秋節', '農曆新年', '復活節', '聖誕節'], c: 1 },
    { cat: 'general', q: '生日通常會食咩餅？', a: ['月餅', '生日蛋糕', '老婆餅', '蛋撻'], c: 1 },
    { cat: 'general', q: '幼稚園畢業之後讀咩？', a: ['中學', '小學', '大學', '幼兒園'], c: 1 },
    { cat: 'general', q: '中秋節會食咩？', a: ['湯圓', '月餅', '糭', '年糕'], c: 1 },
    { cat: 'general', q: '我哋用咩刷牙？', a: ['梳', '牙刷', '毛巾', '筷子'], c: 1 },
  ],

  // ==========================================================
  // MEDIUM (P3–P4)
  // ==========================================================
  medium: [
    // ---- math ----
    { cat: 'math', q: '小明有 $50，買了 $18 的筆，剩多少錢？', a: ['$28', '$32', '$38', '$42'], c: 1 },
    { cat: 'math', q: '一盒有 12 粒糖，3 盒共有多少粒？', a: ['24', '30', '36', '48'], c: 2 },
    { cat: 'math', q: '45 ÷ 5 = ?', a: ['8', '9', '7', '6'], c: 1 },
    { cat: 'math', q: '2 小時 30 分鐘等於多少分鐘？', a: ['120', '150', '180', '230'], c: 1 },
    { cat: 'math', q: '長方形長 6cm、闊 4cm，周界是？', a: ['10 cm', '20 cm', '24 cm', '12 cm'], c: 1 },
    { cat: 'math', q: '7 × 8 = ?', a: ['54', '56', '63', '48'], c: 1 },
    { cat: 'math', q: '100 − 37 = ?', a: ['53', '63', '73', '67'], c: 1 },
    { cat: 'math', q: '三角形內角和是多少度？', a: ['90°', '180°', '270°', '360°'], c: 1 },
    { cat: 'math', q: '哪一個是雙數？', a: ['7', '13', '14', '9'], c: 2 },
    { cat: 'math', q: '25 + 25 + 25 = ?', a: ['65', '70', '75', '85'], c: 2 },
    { cat: 'math', q: '一星期返學 5 日，4 星期返學幾多日？', a: ['9', '16', '20', '24'], c: 2 },
    { cat: 'math', q: '時鐘長針指住 6，即是幾多分鐘？', a: ['6 分', '15 分', '30 分', '45 分'], c: 2 },
    { cat: 'math', q: '哪個數可以被 3 整除？', a: ['25', '27', '28', '32'], c: 1 },
    { cat: 'math', q: '1 公斤等於多少克？', a: ['10', '100', '1000', '10000'], c: 2 },
    { cat: 'math', q: '2, 4, 8, 16, … 下一個數是？', a: ['18', '24', '32', '20'], c: 2 },

    // ---- english ----
    { cat: 'english', q: 'The past tense of "go" is…', a: ['goed', 'went', 'gone', 'going'], c: 1 },
    { cat: 'english', q: '"She ___ to school every day."', a: ['go', 'goes', 'going', 'gone'], c: 1 },
    { cat: 'english', q: 'The plural of "child" is…', a: ['childs', 'childes', 'children', 'childrens'], c: 2 },
    { cat: 'english', q: 'Which word is a verb?', a: ['quickly', 'beautiful', 'jump', 'happiness'], c: 2 },
    { cat: 'english', q: '"The bird is flying ___ the sky."', a: ['in', 'on', 'at', 'under'], c: 0 },
    { cat: 'english', q: 'The opposite of "expensive" is…', a: ['dear', 'cheap', 'rich', 'poor'], c: 1 },
    { cat: 'english', q: '"I ___ my homework yesterday."', a: ['do', 'did', 'done', 'doing'], c: 1 },
    { cat: 'english', q: 'A baby cat is called a…', a: ['puppy', 'cub', 'kitten', 'calf'], c: 2 },
    { cat: 'english', q: 'Which is spelled correctly?', a: ['beutiful', 'beautiful', 'beautifull', 'butiful'], c: 1 },
    { cat: 'english', q: '"He is ___ than me."', a: ['tall', 'taller', 'tallest', 'more tall'], c: 1 },
    { cat: 'english', q: 'Which word rhymes with "cake"?', a: ['cat', 'lake', 'kick', 'cook'], c: 1 },
    { cat: 'english', q: '"We ___ TV last night."', a: ['watch', 'watched', 'watching', 'watches'], c: 1 },
    { cat: 'english', q: 'A person who teaches is a…', a: ['doctor', 'teacher', 'driver', 'farmer'], c: 1 },
    { cat: 'english', q: '"___ you like ice cream?"', a: ['Is', 'Do', 'Are', 'Am'], c: 1 },
    { cat: 'english', q: 'The opposite of "always" is…', a: ['sometimes', 'never', 'often', 'usually'], c: 1 },
    { cat: 'english', q: 'Which sentence is correct?', a: ['They is playing.', 'They are playing.', 'They am playing.', 'They be playing.'], c: 1 },
    { cat: 'english', q: '"There ___ many books on the shelf."', a: ['is', 'are', 'am', 'be'], c: 1 },
    { cat: 'english', q: 'Which word means "very big"?', a: ['tiny', 'huge', 'thin', 'short'], c: 1 },
    { cat: 'english', q: 'The past tense of "eat" is…', a: ['eated', 'ate', 'eaten', 'eating'], c: 1 },
    { cat: 'english', q: 'The sun rises in the ___.', a: ['west', 'north', 'east', 'south'], c: 2 },

    // ---- chinese ----
    { cat: 'chinese', q: '「亡羊補牢」的意思是？', a: ['事後補救，未為晚也', '羊走失了很可惜', '修理欄柵很重要', '做事粗心大意'], c: 0 },
    { cat: 'chinese', q: '「春眠不覺曉」的下一句是？', a: ['花落知多少', '處處聞啼鳥', '夜來風雨聲', '低頭思故鄉'], c: 1 },
    { cat: 'chinese', q: '哪一個是「高興」的近義詞？', a: ['難過', '愉快', '生氣', '害怕'], c: 1 },
    { cat: 'chinese', q: '「畫蛇添足」是指？', a: ['畫畫很厲害', '多此一舉', '蛇有四隻腳', '做事很快'], c: 1 },
    { cat: 'chinese', q: '「日」字加一筆可以變成哪個字？', a: ['月', '目', '口', '田'], c: 1 },
    { cat: 'chinese', q: '「守株待兔」教訓我們不要？', a: ['勤力工作', '不勞而獲', '愛護動物', '砍伐樹木'], c: 1 },
    { cat: 'chinese', q: '「桃李滿門」形容什麼人？', a: ['農夫', '老師', '醫生', '商人'], c: 1 },
    { cat: 'chinese', q: '哪個成語形容速度很快？', a: ['一日千里', '守口如瓶', '井底之蛙', '對牛彈琴'], c: 0 },
    { cat: 'chinese', q: '「舉頭望明月」的下一句是？', a: ['低頭思故鄉', '疑是地上霜', '床前明月光', '花落知多少'], c: 0 },
    { cat: 'chinese', q: '「三心兩意」的反義詞是？', a: ['粗心大意', '一心一意', '心不在焉', '半途而廢'], c: 1 },
    { cat: 'chinese', q: '「虎頭蛇尾」是指做事？', a: ['有始有終', '有始無終', '快手快腳', '小心翼翼'], c: 1 },
    { cat: 'chinese', q: '哪一個字的部首是「火」？', a: ['河', '燒', '樹', '雪'], c: 1 },
    { cat: 'chinese', q: '「百聞不如一見」的意思是？', a: ['聽一百次更好', '親眼看見最真實', '不要相信別人', '見面要有禮貌'], c: 1 },
    { cat: 'chinese', q: '「雪中送炭」是指？', a: ['在困難時幫助別人', '冬天送禮物', '雪天買炭很貴', '天氣很寒冷'], c: 0 },
    { cat: 'chinese', q: '「光陰似箭」提醒我們要？', a: ['學習射箭', '珍惜時間', '走路要快', '努力儲錢'], c: 1 },
    { cat: 'chinese', q: '一（　）橋 — 應填哪個量詞？', a: ['條', '座', '張', '隻'], c: 1 },
    { cat: 'chinese', q: '「門庭若市」形容？', a: ['門口很小', '人多熱鬧', '市場很遠', '家裡冷清'], c: 1 },
    { cat: 'chinese', q: '「對牛彈琴」的意思是？', a: ['牛喜歡音樂', '白費唇舌', '彈琴好聽', '對動物要好'], c: 1 },
    { cat: 'chinese', q: '「床前明月光」的下一句是？', a: ['疑是地上霜', '低頭思故鄉', '舉頭望明月', '處處聞啼鳥'], c: 0 },
    { cat: 'chinese', q: '「東張西望」的意思是？', a: ['向東走向西走', '四處張望', '東西很多', '迷路了'], c: 1 },

    // ---- general ----
    { cat: 'general', q: '尖沙咀鐘樓的前身是什麼建築的一部分？', a: ['消防局', '火車站', '郵政局', '燈塔'], c: 1 },
    { cat: 'general', q: '維多利亞港兩岸是哪兩個地方？', a: ['港島與九龍', '九龍與新界', '港島與離島', '沙田與大埔'], c: 0 },
    { cat: 'general', q: '香港區旗上是什麼花？', a: ['杜鵑花', '洋紫荊', '向日葵', '木棉花'], c: 1 },
    { cat: 'general', q: '水在攝氏多少度會結冰？', a: ['0°C', '10°C', '50°C', '100°C'], c: 0 },
    { cat: 'general', q: '彩虹有多少種顏色？', a: ['5', '6', '7', '8'], c: 2 },
    { cat: 'general', q: '人體最大的器官是？', a: ['心臟', '皮膚', '肺', '腦'], c: 1 },
    { cat: 'general', q: '香港的緊急求助電話號碼是？', a: ['911', '999', '112', '120'], c: 1 },
    { cat: 'general', q: '地球繞太陽一圈需要多久？', a: ['一日', '一個月', '一年', '十年'], c: 2 },
    { cat: 'general', q: '港鐵荃灣綫是什麼顏色？', a: ['藍色', '綠色', '紅色', '紫色'], c: 2 },
    { cat: 'general', q: '熊貓最愛吃什麼？', a: ['竹', '蜜糖', '魚', '蘋果'], c: 0 },
    { cat: 'general', q: '香港島上被稱為「叮叮」的交通工具是？', a: ['巴士', '電車', '的士', '小巴'], c: 1 },
    { cat: 'general', q: '香港太空館位於哪一區？', a: ['中環', '尖沙咀', '旺角', '銅鑼灣'], c: 1 },
    { cat: 'general', q: '香港最高的山是？', a: ['獅子山', '太平山', '大帽山', '鳳凰山'], c: 2 },
    { cat: 'general', q: '植物製造養分主要靠什麼？', a: ['月光', '陽光', '電燈', '火'], c: 1 },
    { cat: 'general', q: '哪一個是香港的離島？', a: ['長洲', '沙田', '觀塘', '元朗'], c: 0 },
    { cat: 'general', q: '指南針指向哪兩個方向？', a: ['東西', '南北', '上下', '左右'], c: 1 },
    { cat: 'general', q: '香港使用的貨幣是？', a: ['人民幣', '港元', '美元', '日圓'], c: 1 },
    { cat: 'general', q: '蝴蝶是由什麼變成的？', a: ['蝌蚪', '毛毛蟲', '螞蟻', '蜜蜂'], c: 1 },
    { cat: 'general', q: '月亮會自己發光嗎？', a: ['會，好似太陽', '不會，反射太陽光', '晚上才發光', '夏天才發光'], c: 1 },
    { cat: 'general', q: '廟街夜市以什麼聞名？', a: ['滑雪場', '大牌檔與攤檔', '游泳池', '溫泉'], c: 1 },
    // ---- more medium ----
    { cat: 'math', q: '56 ÷ 7 = ?', a: ['6', '7', '8', '9'], c: 2 },
    { cat: 'math', q: '一小時等於多少分鐘？', a: ['30', '60', '90', '100'], c: 1 },
    { cat: 'math', q: '3 × 9 + 5 = ?', a: ['27', '32', '42', '17'], c: 1 },
    { cat: 'math', q: '正方形邊長 5cm，周界是？', a: ['10 cm', '15 cm', '20 cm', '25 cm'], c: 2 },
    { cat: 'math', q: '雙數加雙數，結果一定是？', a: ['單數', '雙數', '質數', '負數'], c: 1 },
    { cat: 'math', q: '$100 買 3 支 $25 的筆，剩多少？', a: ['$20', '$25', '$30', '$75'], c: 1 },
    { cat: 'math', q: '0 乘任何數等於？', a: ['0', '1', '10', '那個數'], c: 0 },
    { cat: 'math', q: '平年一年有多少日？', a: ['360', '365', '366', '370'], c: 1 },
    { cat: 'english', q: 'Which word is a pronoun?', a: ['She', 'Run', 'Blue', 'Fast'], c: 0 },
    { cat: 'english', q: 'The opposite of "begin" is…', a: ['start', 'end', 'open', 'go'], c: 1 },
    { cat: 'english', q: '"My father\u2019s sister is my ___."', a: ['uncle', 'aunt', 'cousin', 'grandma'], c: 1 },
    { cat: 'english', q: 'Which sentence is a question?', a: ['I like cats.', 'Where is my book?', 'Sit down.', 'What a day!'], c: 1 },
    { cat: 'english', q: '"I am good ___ English."', a: ['in', 'at', 'on', 'for'], c: 1 },
    { cat: 'english', q: 'A place where we borrow books is a…', a: ['hospital', 'library', 'bank', 'cinema'], c: 1 },
    { cat: 'english', q: '"___ is raining outside."', a: ['It', 'He', 'There', 'This'], c: 0 },
    { cat: 'english', q: 'The plural of "leaf" is…', a: ['leafs', 'leaves', 'leafes', 'leave'], c: 1 },
    { cat: 'english', q: 'Which month comes after March?', a: ['February', 'April', 'May', 'June'], c: 1 },
    { cat: 'english', q: '"She sings ___."', a: ['beautiful', 'beautifully', 'beauty', 'beautify'], c: 1 },
    { cat: 'chinese', q: '「井底之蛙」形容人？', a: ['住喺井裏', '見識少', '游水叻', '聲音大'], c: 1 },
    { cat: 'chinese', q: '「自相矛盾」的意思是？', a: ['武器鋒利', '言行前後不一', '善於辯論', '買賣公平'], c: 1 },
    { cat: 'chinese', q: '「狐假虎威」是指？', a: ['狐狸怕老虎', '借別人威勢欺人', '老虎放假', '動物做朋友'], c: 1 },
    { cat: 'chinese', q: '一（　）詩 — 應填哪個量詞？', a: ['首', '張', '間', '架'], c: 0 },
    { cat: 'chinese', q: '「人山人海」形容？', a: ['山好高', '海好深', '人非常多', '風景優美'], c: 2 },
    { cat: 'chinese', q: '「半途而廢」指做事？', a: ['中途放棄', '做到一半最好', '慢慢做', '全力以赴'], c: 0 },
    { cat: 'chinese', q: '哪個字的部首是「木」？', a: ['湖', '桃', '火', '雲'], c: 1 },
    { cat: 'chinese', q: '「愚公移山」教我們？', a: ['搬屋要請人', '有毅力恆心', '山唔可以掘', '愚蠢冇用'], c: 1 },
    { cat: 'chinese', q: '「掩耳盜鈴」的意思是？', a: ['偷嘢好叻', '自欺欺人', '耳朵唔好', '鈴聲好嘈'], c: 1 },
    { cat: 'general', q: '昂坪 360 纜車在哪個島？', a: ['南丫島', '大嶼山', '長洲', '蒲台島'], c: 1 },
    { cat: 'general', q: '蜜蜂住在哪裡？', a: ['鳥巢', '蜂巢', '山洞', '樹窿'], c: 1 },
    { cat: 'general', q: '香港哪裡可以看大熊貓？', a: ['迪士尼', '海洋公園', '濕地公園', '太空館'], c: 1 },
    { cat: 'general', q: '水蒸發之後會變成？', a: ['冰', '水蒸氣', '雪', '泥'], c: 1 },
    { cat: 'general', q: '香港最熱的月份通常是？', a: ['1-2 月', '4-5 月', '7-8 月', '11-12 月'], c: 2 },
    { cat: 'general', q: '電燈泡是誰發明的？', a: ['牛頓', '愛迪生', '愛因斯坦', '貝爾'], c: 1 },
    { cat: 'general', q: '獅子山位於香港哪個部分？', a: ['港島', '九龍', '離島', '西貢'], c: 1 },
    { cat: 'general', q: '人類呼吸需要哪種氣體？', a: ['氮氣', '氧氣', '二氧化碳', '氫氣'], c: 1 },
  ],

  // ==========================================================
  // HARD (P5–P6)
  // ==========================================================
  hard: [
    // ---- math ----
    { cat: 'math', q: '1/2 + 1/4 = ?', a: ['2/6', '3/4', '1/6', '2/4'], c: 1 },
    { cat: 'math', q: '50 的 20% 是多少？', a: ['5', '10', '15', '20'], c: 1 },
    { cat: 'math', q: '3.6 + 2.75 = ?', a: ['5.35', '6.35', '6.45', '5.45'], c: 1 },
    { cat: 'math', q: '2 + 3 × 4 = ?', a: ['20', '14', '24', '12'], c: 1 },
    { cat: 'math', q: '4、6、8 三個數的平均數是？', a: ['5', '6', '7', '8'], c: 1 },
    { cat: 'math', q: '三角形底 10cm、高 6cm，面積是？', a: ['16 cm²', '30 cm²', '60 cm²', '36 cm²'], c: 1 },
    { cat: 'math', q: '4 和 6 的最小公倍數是？', a: ['10', '12', '24', '8'], c: 1 },
    { cat: 'math', q: '0.25 等於幾分之幾？', a: ['1/2', '1/4', '1/5', '2/5'], c: 1 },
    { cat: 'math', q: '一個數的 3 倍加 7 等於 22，這個數是？', a: ['4', '5', '6', '7'], c: 1 },
    { cat: 'math', q: '圓周率 π 大約等於？', a: ['2.14', '3.14', '4.13', '3.41'], c: 1 },
    { cat: 'math', q: '1000 − 387 = ?', a: ['713', '623', '613', '603'], c: 2 },
    { cat: 'math', q: '哪一個是質數？', a: ['15', '21', '17', '27'], c: 2 },
    { cat: 'math', q: '正方形面積 49 cm²，邊長是？', a: ['6 cm', '7 cm', '8 cm', '9 cm'], c: 1 },
    { cat: 'math', q: '3/5 等於百分之幾？', a: ['35%', '60%', '53%', '65%'], c: 1 },
    { cat: 'math', q: '一打 (1 dozen) 是多少件？', a: ['10', '12', '20', '24'], c: 1 },

    // ---- english ----
    { cat: 'english', q: 'The past participle of "write" is…', a: ['wrote', 'written', 'writed', 'writing'], c: 1 },
    { cat: 'english', q: '"If it rains, we ___ stay home."', a: ['will', 'would', 'did', 'were'], c: 0 },
    { cat: 'english', q: 'A synonym of "important" is…', a: ['useless', 'essential', 'simple', 'common'], c: 1 },
    { cat: 'english', q: '"English ___ all over the world."', a: ['speaks', 'is spoken', 'is speaking', 'spoke'], c: 1 },
    { cat: 'english', q: 'Which idiom means "very easy"?', a: ['raining cats and dogs', 'a piece of cake', 'under the weather', 'break a leg'], c: 1 },
    { cat: 'english', q: 'The opposite of "ancient" is…', a: ['old', 'modern', 'antique', 'aged'], c: 1 },
    { cat: 'english', q: '"Neither Tom ___ Mary likes durian."', a: ['or', 'nor', 'and', 'but'], c: 1 },
    { cat: 'english', q: 'Which word is an adverb?', a: ['quick', 'quickly', 'quickness', 'quicken'], c: 1 },
    { cat: 'english', q: '"She has lived here ___ 2010."', a: ['for', 'since', 'from', 'at'], c: 1 },
    { cat: 'english', q: 'The plural of "mouse" is…', a: ['mouses', 'mice', 'mousies', 'meese'], c: 1 },
    { cat: 'english', q: '"I look forward to ___ you."', a: ['see', 'seeing', 'saw', 'seen'], c: 1 },
    { cat: 'english', q: 'Which word means "happening once a year"?', a: ['daily', 'annual', 'monthly', 'weekly'], c: 1 },
    { cat: 'english', q: '"He asked me where ___."', a: ['do I live', 'I lived', 'am I living', 'do I lived'], c: 1 },
    { cat: 'english', q: 'The antonym of "generous" is…', a: ['kind', 'stingy', 'wealthy', 'giving'], c: 1 },
    { cat: 'english', q: '"Raining cats and dogs" means…', a: ['pets falling', 'raining heavily', 'sunny weather', 'a light shower'], c: 1 },
    { cat: 'english', q: 'The comparative form of "good" is…', a: ['gooder', 'better', 'best', 'well'], c: 1 },
    { cat: 'english', q: '"The match was called off" means it was…', a: ['won', 'cancelled', 'started', 'shortened'], c: 1 },
    { cat: 'english', q: 'A person who watches a game is a…', a: ['player', 'spectator', 'referee', 'coach'], c: 1 },
    { cat: 'english', q: '"___ of the students has a dictionary."', a: ['All', 'Each', 'Both', 'Many'], c: 1 },
    { cat: 'english', q: 'Which is spelled correctly?', a: ['recieve', 'receive', 'receeve', 'riceive'], c: 1 },

    // ---- chinese ----
    { cat: 'chinese', q: '「塞翁失馬」的下一句是？', a: ['焉知非福', '必有後福', '不足為奇', '後悔莫及'], c: 0 },
    { cat: 'chinese', q: '「臥薪嘗膽」與哪位歷史人物有關？', a: ['劉備', '勾踐', '項羽', '韓信'], c: 1 },
    { cat: 'chinese', q: '「鞠躬盡瘁，死而後已」說的是哪位人物？', a: ['關羽', '諸葛亮', '曹操', '張飛'], c: 1 },
    { cat: 'chinese', q: '「莫等閒，白了少年頭」的下一句是？', a: ['空悲切', '誰人知', '歲月流', '志未酬'], c: 0 },
    { cat: 'chinese', q: '「青出於藍」比喻？', a: ['顏色漂亮', '學生勝過老師', '天空很藍', '染布的方法'], c: 1 },
    { cat: 'chinese', q: '「四面楚歌」與哪位人物有關？', a: ['劉邦', '項羽', '秦始皇', '孔子'], c: 1 },
    { cat: 'chinese', q: '「破釜沉舟」比喻？', a: ['煮飯技巧', '下定決心', '坐船旅行', '節省糧食'], c: 1 },
    { cat: 'chinese', q: '「諱疾忌醫」是指？', a: ['怕看醫生', '隱瞞缺點不肯改正', '生病要求醫', '醫術高明'], c: 1 },
    { cat: 'chinese', q: '「不入虎穴」的下一句是？', a: ['焉得虎子', '必有大難', '不見老虎', '便是英雄'], c: 0 },
    { cat: 'chinese', q: '「醉翁之意不在酒」比喻？', a: ['喝醉了', '別有目的', '酒不好喝', '愛喝酒的人'], c: 1 },
    { cat: 'chinese', q: '「紙上談兵」與哪位人物有關？', a: ['趙括', '岳飛', '孫武', '白起'], c: 0 },
    { cat: 'chinese', q: '「三顧草廬」是誰拜訪誰？', a: ['曹操拜訪司馬懿', '劉備拜訪諸葛亮', '孫權拜訪周瑜', '關羽拜訪張飛'], c: 1 },
    { cat: 'chinese', q: '「欲窮千里目」的下一句是？', a: ['更上一層樓', '黃河入海流', '白日依山盡', '不畏浮雲遮'], c: 0 },
    { cat: 'chinese', q: '「揠苗助長」的教訓是？', a: ['種田要勤力', '急於求成反而壞事', '幼苗要多澆水', '農作物要施肥'], c: 1 },
    { cat: 'chinese', q: '「杯弓蛇影」形容人？', a: ['眼力很好', '疑神疑鬼', '怕喝酒', '愛喝茶'], c: 1 },
    { cat: 'chinese', q: '「聞雞起舞」比喻？', a: ['雞叫得早', '勤奮自強', '愛跳舞', '養雞致富'], c: 1 },
    { cat: 'chinese', q: '「時間就是金錢」運用了哪種修辭手法？', a: ['擬人', '比喻', '誇張', '反問'], c: 1 },
    { cat: 'chinese', q: '「孔融讓梨」教我們？', a: ['梨很好吃', '謙讓的美德', '要多吃水果', '兄弟要分家'], c: 1 },
    { cat: 'chinese', q: '「畫龍點睛」的意思是？', a: ['畫畫要仔細', '在關鍵處加上精彩一筆', '龍是神獸', '點眼睛最難畫'], c: 1 },
    { cat: 'chinese', q: '「水滴石穿」比喻？', a: ['水的力量大', '有恆心終能成事', '石頭很軟弱', '下雨的災害'], c: 1 },

    // ---- general ----
    { cat: 'general', q: '香港在哪一年回歸中國？', a: ['1995', '1997', '1999', '2000'], c: 1 },
    { cat: 'general', q: '太陽系中最大的行星是？', a: ['地球', '土星', '木星', '火星'], c: 2 },
    { cat: 'general', q: '尖沙咀「1881」古蹟的前身是？', a: ['水警總部', '天文台', '郵政總局', '消防局'], c: 0 },
    { cat: 'general', q: '半島酒店位於哪條道路？', a: ['彌敦道', '梳士巴利道', '廣東道', '漆咸道'], c: 1 },
    { cat: 'general', q: '世界最高的山峰是？', a: ['富士山', '珠穆朗瑪峰', '玉山', '崑崙山'], c: 1 },
    { cat: 'general', q: '成年人體有大約多少塊骨頭？', a: ['106', '206', '306', '406'], c: 1 },
    { cat: 'general', q: '香港國際機場位於哪個島？', a: ['長洲', '赤鱲角', '南丫島', '坪洲'], c: 1 },
    { cat: 'general', q: '水的沸點是攝氏多少度？', a: ['90°C', '100°C', '110°C', '120°C'], c: 1 },
    { cat: 'general', q: '空氣中含量最多的氣體是？', a: ['氧氣', '氮氣', '二氧化碳', '氫氣'], c: 1 },
    { cat: 'general', q: '「東方之珠」是指哪個城市？', a: ['上海', '香港', '新加坡', '東京'], c: 1 },
    { cat: 'general', q: '青馬大橋連接哪兩個地方？', a: ['青衣和馬灣', '青山和馬鞍山', '九龍和港島', '屯門和元朗'], c: 0 },
    { cat: 'general', q: '地球唯一的天然衛星是？', a: ['火星', '月球', '太陽', '金星'], c: 1 },
    { cat: 'general', q: '香港共分為多少個行政分區？', a: ['12', '15', '18', '21'], c: 2 },
    { cat: 'general', q: '聖安德烈堂 (St Andrew\u2019s Church) 是哪種建築？', a: ['佛寺', '基督教教堂', '清真寺', '道觀'], c: 1 },
    { cat: 'general', q: '九龍清真寺位於彌敦道與哪條街交界附近？', a: ['海防道', '北京道', '佐敦道', '柯士甸道'], c: 0 },
    { cat: 'general', q: '維多利亞港的名字源自？', a: ['英國維多利亞女王', '一位船長', '一座山', '一種花'], c: 0 },
    { cat: 'general', q: '尖沙咀星光大道紀念哪個行業的名人？', a: ['音樂', '電影', '體育', '科學'], c: 1 },
    { cat: 'general', q: '彩虹的形成是因為光的什麼現象？', a: ['反射', '折射與色散', '直線傳播', '吸收'], c: 1 },
    { cat: 'general', q: '重慶大廈由多少座 17 層大樓組成？', a: ['3', '4', '5', '6'], c: 2 },
    { cat: 'general', q: '光在真空中的速度大約是每秒？', a: ['3 萬公里', '30 萬公里', '300 萬公里', '3000 公里'], c: 1 },
    // ---- more hard ----
    { cat: 'math', q: '2 的 5 次方 = ?', a: ['10', '25', '32', '64'], c: 2 },
    { cat: 'math', q: '12 共有多少個因數？', a: ['4', '5', '6', '8'], c: 2 },
    { cat: 'math', q: '0.8 × 0.5 = ?', a: ['0.04', '0.4', '4', '0.45'], c: 1 },
    { cat: 'math', q: '圓的直徑是半徑的多少倍？', a: ['1.5', '2', '3', '3.14'], c: 1 },
    { cat: 'math', q: '連續三個整數相加是 36，中間那個數是？', a: ['11', '12', '13', '36'], c: 1 },
    { cat: 'math', q: '2 小時行 10 公里，平均每小時行？', a: ['4 公里', '5 公里', '8 公里', '20 公里'], c: 1 },
    { cat: 'math', q: '√81 = ?', a: ['8', '9', '18', '40.5'], c: 1 },
    { cat: 'math', q: '長方體共有多少條棱？', a: ['8', '10', '12', '16'], c: 2 },
    { cat: 'english', q: 'A synonym of "rapid" is…', a: ['slow', 'swift', 'heavy', 'lazy'], c: 1 },
    { cat: 'english', q: '"Hardly ___ he arrived when it rained."', a: ['has', 'had', 'did', 'was'], c: 1 },
    { cat: 'english', q: 'A person who writes books is an…', a: ['actor', 'author', 'architect', 'athlete'], c: 1 },
    { cat: 'english', q: '"Bite the bullet" means…', a: ['eat quickly', 'face something bravely', 'get hurt', 'shout loudly'], c: 1 },
    { cat: 'english', q: 'The opposite of "victory" is…', a: ['win', 'defeat', 'prize', 'battle'], c: 1 },
    { cat: 'english', q: '"The cake was eaten ___ the children."', a: ['from', 'by', 'with', 'of'], c: 1 },
    { cat: 'english', q: 'Which one is a compound word?', a: ['running', 'rainbow', 'quickly', 'unhappy'], c: 1 },
    { cat: 'english', q: '"Once in a blue moon" means…', a: ['every night', 'very rarely', 'once a month', 'when sad'], c: 1 },
    { cat: 'english', q: 'Which word means "a place animals are kept for show"?', a: ['farm', 'zoo', 'forest', 'nest'], c: 1 },
    { cat: 'chinese', q: '「完璧歸趙」與哪位人物有關？', a: ['藺相如', '岳飛', '韓信', '李白'], c: 0 },
    { cat: 'chinese', q: '「樂不思蜀」說的是哪位人物？', a: ['劉備', '劉禪', '曹丕', '孫權'], c: 1 },
    { cat: 'chinese', q: '「東施效顰」的意思是？', a: ['認真學習', '盲目模仿反而出醜', '化妝技巧', '兩姊妹感情好'], c: 1 },
    { cat: 'chinese', q: '「一鳴驚人」原本形容哪位君主？', a: ['秦始皇', '楚莊王', '漢武帝', '唐太宗'], c: 1 },
    { cat: 'chinese', q: '「白髮三千丈」運用了哪種修辭？', a: ['比喻', '誇張', '擬人', '對偶'], c: 1 },
    { cat: 'chinese', q: '「程門立雪」表示？', a: ['天氣寒冷', '尊師重道', '等人很久', '勤力掃雪'], c: 1 },
    { cat: 'chinese', q: '「負荊請罪」是誰向誰請罪？', a: ['廉頗向藺相如', '張飛向關羽', '項羽向劉邦', '韓信向蕭何'], c: 0 },
    { cat: 'chinese', q: '「春風又綠江南岸」的下一句是？', a: ['明月何時照我還', '萬紫千紅總是春', '二月春風似剪刀', '春來江水綠如藍'], c: 0 },
    { cat: 'chinese', q: '「破鏡重圓」比喻？', a: ['鏡子修好', '夫妻失散後重聚', '物歸原主', '舊物翻新'], c: 1 },
    { cat: 'general', q: '香港第一條過海隧道是？', a: ['東區海底隧道', '紅磡海底隧道', '西區海底隧道', '獅子山隧道'], c: 1 },
    { cat: 'general', q: 'DNA 主要儲存在細胞的哪個部分？', a: ['細胞膜', '細胞核', '細胞質', '細胞壁'], c: 1 },
    { cat: 'general', q: '世界上最大的海洋是？', a: ['大西洋', '太平洋', '印度洋', '北冰洋'], c: 1 },
    { cat: 'general', q: '聲音在哪種介質中傳播最快？', a: ['空氣', '水', '固體', '真空'], c: 2 },
    { cat: 'general', q: '香港天壇大佛位於哪裡？', a: ['昂坪', '大澳', '梅窩', '東涌'], c: 0 },
    { cat: 'general', q: '「光年」是量度什麼的單位？', a: ['時間', '距離', '速度', '亮度'], c: 1 },
    { cat: 'general', q: '蒸發和沸騰都是由液體變成？', a: ['固體', '氣體', '晶體', '冰'], c: 1 },
    { cat: 'general', q: '萬里長城主要位於中國哪一方？', a: ['南方', '北方', '東方', '西方'], c: 1 },
    { cat: 'general', q: '香港濕地公園位於哪一區？', a: ['天水圍', '沙田', '將軍澳', '荃灣'], c: 0 },
  ],
};

// ------------------------------------------------------------
// Procedural math — endless variety, difficulty-aware
// ------------------------------------------------------------
function randInt(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

function buildChoices(ans, spread) {
  const opts = new Set([ans]);
  while (opts.size < 4) {
    const delta = randInt(1, spread) * (Math.random() < 0.5 ? -1 : 1);
    if (ans + delta >= 0 && ans + delta !== ans) opts.add(ans + delta);
  }
  const a = shuffle([...opts]);
  return { a: a.map(String), c: a.indexOf(ans) };
}

function makeMathQuestion(diff) {
  let q, ans, spread;
  if (diff === 'easy') {
    if (Math.random() < 0.5) { const a = randInt(1, 10), b = randInt(1, 10); q = `${a} + ${b} = ?`; ans = a + b; }
    else { const a = randInt(5, 20), b = randInt(1, a); q = `${a} − ${b} = ?`; ans = a - b; }
    spread = 3;
  } else if (diff === 'medium') {
    const kind = randInt(0, 3);
    if (kind === 0) { const a = randInt(12, 89), b = randInt(12, 89); q = `${a} + ${b} = ?`; ans = a + b; }
    else if (kind === 1) { const a = randInt(40, 99), b = randInt(11, 39); q = `${a} − ${b} = ?`; ans = a - b; }
    else if (kind === 2) { const a = randInt(3, 9), b = randInt(3, 12); q = `${a} × ${b} = ?`; ans = a * b; }
    else { const b = randInt(3, 9), r = randInt(4, 12); q = `${b * r} ÷ ${b} = ?`; ans = r; }
    spread = 8;
  } else {
    const kind = randInt(0, 3);
    if (kind === 0) { const a = randInt(120, 880), b = randInt(110, 870); q = `${a} + ${b} = ?`; ans = a + b; spread = 30; }
    else if (kind === 1) { const a = randInt(12, 25), b = randInt(3, 9); q = `${a} × ${b} = ?`; ans = a * b; spread = 12; }
    else if (kind === 2) { const a = randInt(2, 9), b = randInt(2, 9), cc = randInt(2, 9); q = `${a} + ${b} × ${cc} = ?`; ans = a + b * cc; spread = 10; }
    else { const p = randInt(1, 9) * 10, n = randInt(2, 20) * 10; q = `${n} 的 ${p}% 是多少？`; ans = n * p / 100; spread = Math.max(4, ans / 2 | 0); }
  }
  return { cat: 'math', q, ...buildChoices(ans, spread) };
}

// ------------------------------------------------------------
// Pick `n` questions with mixed categories, no repeats per game.
// ------------------------------------------------------------
const usedIds = new Set();

export function pickQuestions(n = 3, diff = 'easy') {
  const bank = BANK[diff] || BANK.easy;
  const cats = shuffle(Object.keys(CATEGORIES).slice());
  const picked = [];
  for (let i = 0; i < n; i++) {
    const cat = cats[i % cats.length];
    if (cat === 'math' && Math.random() < 0.45) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const pool = bank
      .map((qq, idx) => ({ ...qq, _id: diff + idx }))
      .filter(qq => qq.cat === cat && !usedIds.has(qq._id));
    if (pool.length === 0) {
      picked.push(makeMathQuestion(diff));
      continue;
    }
    const choice = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(choice._id);
    // shuffle answer order so the correct slot varies
    const order = shuffle([0, 1, 2, 3]);
    picked.push({
      cat: choice.cat,
      q: choice.q,
      a: order.map(k => choice.a[k]),
      c: order.indexOf(choice.c),
    });
  }
  return picked;
}

export function resetQuestionPool() { usedIds.clear(); }

export function bankSize(diff) { return BANK[diff].length; }
