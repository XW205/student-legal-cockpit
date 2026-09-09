/* =========================================================
   法护启航 · 前端脚本（从 index.html 抽离）
   本文件由两段原内联脚本合并：head 中的 marked 配置 + body 底部主脚本
   ========================================================= */
if (window.marked) marked.setOptions({ gfm: true, breaks: true });

/* =========================================================
   法护启航 · 大学生法律安全驾驶舱（前端原型）
   原生 HTML + CSS + JS，无框架，页面模拟切换，无后端。
   ========================================================= */
'use strict';

/* ---------- 小工具 ---------- */
function $(s, r){ return (r || document).querySelector(s); }
function $$(s, r){ return Array.from((r || document).querySelectorAll(s)); }
function el(tag, cls, html){
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
/* Markdown 渲染：优先用 marked.js，失败则回退纯文本 */
function renderMd(bub, text){
  if (!bub) return;
  try {
    if (window.marked && typeof marked.parse === 'function'){
      bub.innerHTML = marked.parse(text || '');
      bub.classList.add('md');
      appendLawCard(bub, text);
      return;
    }
  } catch (e) {}
  bub.textContent = text || '';
  bub.classList.remove('md');
  appendLawCard(bub, text);
}

/* =========================================================
   法条库 LAW_DB：收录项目场景中引用的高频法条原文，便于在
   聊天内展开查看「法律依据」。条文要旨仅供学习参考，正式适
   用请以官方最新公布文本为准。
   ========================================================= */
var LAW_DB = {
  /* —— 中华人民共和国民法典 —— */
  '民法典-680':  { law:'民法典', art:'第六百八十条', text:'禁止高利放贷，借款的利率不得违反国家有关规定。借款合同对支付利息没有约定的，视为没有利息。' },
  '民法典-703':  { law:'民法典', art:'第七百零三条', text:'租赁合同是出租人将租赁物交付承租人使用、收益，承租人支付租金的合同。' },
  '民法典-704':  { law:'民法典', art:'第七百零四条', text:'租赁合同的内容一般包括租赁物的名称、数量、用途、租赁期限、租金及其支付期限和方式、租赁维修等条款。' },
  '民法典-705':  { law:'民法典', art:'第七百零五条', text:'租赁期限不得超过二十年。超过二十年的，超过部分无效。' },
  '民法典-707':  { law:'民法典', art:'第七百零七条', text:'租赁期限六个月以上的，应当采用书面形式。未采用书面形式，无法确定租赁期限的，视为不定期租赁。' },
  '民法典-709':  { law:'民法典', art:'第七百零九条', text:'承租人应当按照约定的方法使用租赁物。对租赁物的使用方法没有约定或者约定不明确，依据本法第五百一十条的规定仍不能确定的，应当根据租赁物的性质使用。' },
  '民法典-710':  { law:'民法典', art:'第七百一十条', text:'承租人按照约定的方法或者根据租赁物的性质使用租赁物，致使租赁物受到损耗的，不承担赔偿责任。' },
  '民法典-711':  { law:'民法典', art:'第七百一十一条', text:'承租人未按照约定的方法或者未根据租赁物的性质使用租赁物，致使租赁物受到损失的，出租人可以解除合同并请求赔偿损失。' },
  '民法典-712':  { law:'民法典', art:'第七百一十二条', text:'出租人应当履行租赁物的维修义务，但是当事人另有约定的除外。' },
  '民法典-713':  { law:'民法典', art:'第七百一十三条', text:'承租人在租赁物需要维修时可以请求出租人在合理期限内维修。出租人未履行维修义务的，承租人可以自行维修，维修费用由出租人负担；因承租人的过错需要维修的，由承租人承担维修费用。' },
  '民法典-1024': { law:'民法典', art:'第一千零二十四条', text:'民事主体享有名誉权。任何组织或者个人不得以侮辱、诽谤等方式侵害他人的名誉权。' },
  '民法典-1032': { law:'民法典', art:'第一千零三十二条', text:'自然人享有隐私权。任何组织或者个人不得以刺探、侵扰、泄露、公开等方式侵害他人的隐私权。' },
  '民法典-1165': { law:'民法典', art:'第一千一百六十五条', text:'行为人因过错侵害他人民事权益造成损害的，应当承担侵权责任。' },
  '民法典-1179': { law:'民法典', art:'第一千一百七十九条', text:'侵害他人造成人身损害的，应当赔偿医疗费、护理费、交通费、营养费、住院伙食补助费等为治疗和康复支出的合理费用，以及因误工减少的收入。造成残疾的，还应当赔偿辅助器具费和残疾赔偿金；造成死亡的，还应当赔偿丧葬费和死亡赔偿金。' },
  '民法典-1183': { law:'民法典', art:'第一千一百八十三条', text:'侵害自然人人身权益造成严重精神损害的，被侵权人有权请求精神损害赔偿。' },
  /* —— 中华人民共和国劳动合同法 —— */
  '劳动合同法-9':  { law:'劳动合同法', art:'第九条', text:'用人单位招用劳动者，不得扣押劳动者的居民身份证和其他证件，不得要求劳动者提供担保或者以其他名义向劳动者收取财物。' },
  '劳动合同法-19': { law:'劳动合同法', art:'第十九条', text:'劳动合同期限三个月以上不满一年的，试用期不得超过一个月；一年以上不满三年的，试用期不得超过二个月；三年以上固定期限和无固定期限的劳动合同，试用期不得超过六个月。同一用人单位与同一劳动者只能约定一次试用期。' },
  '劳动合同法-20': { law:'劳动合同法', art:'第二十条', text:'劳动者在试用期的工资不得低于本单位相同岗位最低档工资或者劳动合同约定工资的百分之八十，并不得低于用人单位所在地的最低工资标准。' },
  '劳动合同法-21': { law:'劳动合同法', art:'第二十一条', text:'在试用期中，除劳动者有本法第三十九条和第四十条第一项、第二项规定的情形外，用人单位不得解除劳动合同。用人单位在试用期解除劳动合同的，应当向劳动者说明理由。' },
  '劳动合同法-30': { law:'劳动合同法', art:'第三十条', text:'用人单位应当按照劳动合同约定和国家规定，向劳动者及时足额支付劳动报酬。' },
  '劳动合同法-38': { law:'劳动合同法', art:'第三十八条', text:'用人单位未及时足额支付劳动报酬、未依法为劳动者缴纳社会保险费等情形的，劳动者可以解除劳动合同。' },
  '劳动合同法-39': { law:'劳动合同法', art:'第三十九条', text:'劳动者在试用期间被证明不符合录用条件的，用人单位可以解除劳动合同。用人单位据此解除的，应当说明理由并承担举证责任。' },
  '劳动合同法-46': { law:'劳动合同法', art:'第四十六条', text:'有下列情形之一的，用人单位应当向劳动者支付经济补偿：（一）劳动者依照本法第三十八条规定解除劳动合同的；（二）用人单位向劳动者提出解除并与劳动者协商一致解除的；（三）用人单位依本法第四十条解除的；（四）用人单位依本法第四十一条第一款规定解除的；（五）除用人单位维持或提高条件续订，劳动者不同意续订的情形外，固定期限劳动合同期满终止的；（六）法律、行政法规规定的其他情形。' },
  '劳动合同法-47': { law:'劳动合同法', art:'第四十七条', text:'经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。' },
  '劳动合同法-87': { law:'劳动合同法', art:'第八十七条', text:'用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。' },
  /* —— 中华人民共和国消费者权益保护法 —— */
  '消费者权益保护法-24': { law:'消费者权益保护法', art:'第二十四条', text:'经营者提供的商品或者服务不符合质量要求的，消费者可以依照国家规定、当事人约定退货，或者要求经营者履行更换、修理等义务。' },
  '消费者权益保护法-55': { law:'消费者权益保护法', art:'第五十五条', text:'经营者提供商品或者服务有欺诈行为的，应当按照消费者的要求增加赔偿其受到的损失，增加赔偿的金额为消费者购买商品的价款或者接受服务的费用的三倍；增加赔偿的金额不足五百元的，为五百元。' },
  /* —— 中华人民共和国治安管理处罚法 —— */
  '治安管理处罚法-42': { law:'治安管理处罚法', art:'第四十二条', text:'有下列行为之一的，处五日以下拘留或者五百元以下罚款；情节较重的，处五日以上十日以下拘留，可以并处五百元以下罚款：（一）写恐吓信或者以其他方法威胁他人人身安全的；（二）公然侮辱他人或者捏造事实诽谤他人的；（三）捏造事实诬告陷害他人，企图使他人受到刑事追究或者受到治安管理处罚的；……' },
  /* —— 中华人民共和国劳动法 —— */
  '劳动法-50':  { law:'劳动法', art:'第五十条', text:'工资应当以货币形式按月支付给劳动者本人。不得克扣或者无故拖欠劳动者的工资。' },
  '劳动法-91':  { law:'劳动法', art:'第九十一条', text:'用人单位有下列侵害劳动者合法权益情形之一的，由劳动行政部门责令支付劳动者的工资报酬、经济补偿，并可以责令支付赔偿金：（一）克扣或者无故拖欠劳动者工资的；……' }
};

/* 从回答文本中解析出已命中的法条 key 列表（去重，按出现顺序）。
   匹配形如 《民法典》第 709、710 条 / 《劳动合同法》第 9 条 的引用 */
function extractLaws(text){
  if (!text) return [];
  var names = ['民法典','劳动合同法','消费者权益保护法','治安管理处罚法','劳动法','著作权法'];
  var re = new RegExp('《(' + names.join('|') + ')》\\s*第\\s*([\\d、，,\\s]+?)\\s*条', 'g');
  var hits = [], seen = {}, m;
  while ((m = re.exec(text))){
    var name = m[1];
    var nums = m[2].split(/[、，,\s]+/);
    for (var i = 0; i < nums.length; i++){
      var n = (nums[i] || '').trim();
      if (!n) continue;
      var k = name + '-' + n;
      if (LAW_DB[k] && !seen[k]){ seen[k] = 1; hits.push(k); }
    }
  }
  return hits;
}

/* 在 bot 气泡末尾追加可折叠「法律依据」卡片 */
function appendLawCard(bub, text){
  if (!bub) return;
  var keys = extractLaws(text);
  if (!keys.length) return;
  var card = el('div', 'law-card');
  var head = el('div', 'law-card-head');
  var htxt = el('span'); htxt.textContent = '📖 法律依据（共 ' + keys.length + ' 条）';
  var chev = el('span', 'chev'); chev.textContent = '▾';
  head.appendChild(htxt); head.appendChild(chev);
  card.appendChild(head);
  var body = el('div', 'law-card-body');
  keys.forEach(function(k){
    var it = LAW_DB[k];
    var item = el('div', 'law-item');
    var h = el('div', 'li-head'); h.textContent = '⚖️ ' + it.law + ' · ' + it.art;
    var b = el('div', 'li-body'); b.textContent = it.text;
    item.appendChild(h); item.appendChild(b);
    body.appendChild(item);
  });
  var note = el('div', 'law-note'); note.textContent = 'ⓘ 条文要旨仅供学习参考，请以官方最新公布文本为准；重大事项请咨询执业律师或拨打 12348。';
  body.appendChild(note);
  card.appendChild(body);
  head.addEventListener('click', function(){
    card.classList.toggle('on');
    if (typeof scrollBottom === 'function') scrollBottom();
  });
  bub.appendChild(card);
}
function toast(msg, ok){
  var w = $('#toastWrap');
  var t = el('div', 'toast' + (ok ? ' ok' : ''), (ok ? '✅ ' : 'ℹ️ ') + msg);
  w.appendChild(t);
  setTimeout(function(){ t.style.opacity = 0; t.style.transition = '.4s'; }, 1800);
  setTimeout(function(){ t.remove(); }, 2300);
}

/* ---------- 页面切换（底部导航，全站唯一定义） ---------- */
function showPage(id){
  $$('.page').forEach(function(p){ p.classList.remove('active'); });
  $('#' + id).classList.add('active');
  $$('.nav-item').forEach(function(n){
    n.classList.toggle('active', n.dataset.page === id);
  });
  /* 进入 AI 助手页时默认回到问题列表（演示更清晰）；
     若由快捷入口 / 搜索带入问题，askAI 会在其后调用 openChat 自动打开对话 */
  if (id === 'page-ai'){
    $('#qaList').style.display = '';
    $('#chatView').classList.remove('on');
    clearSuggests();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* 绑定底部导航 */
$$('.nav-item').forEach(function(n){
  n.addEventListener('click', function(){ showPage(n.dataset.page); });
});

/* 跨页面跳转：元素带 data-nav / data-q */
document.addEventListener('click', function(e){
  var t = e.target.closest('[data-nav]');
  if (!t) return;
  var page = t.dataset.nav;
  if (page === 'page-ai' && t.dataset.q){
    askAI(t.dataset.q);               // 带问题跳转到 AI 助手
  } else {
    showPage(page);
  }
});

/* =========================================================
   首页：搜索 + 快捷入口 + 风险测试
   ========================================================= */
/* 首页搜索 */
$('#homeSearch').addEventListener('submit', function(e){
  e.preventDefault();
  var v = $('#homeInput').value.trim();
  askAI(v || '我遇到一个法律问题，想咨询一下');
});

/* 热门问题标签：点击填入搜索框 */
$$('.hot-tag').forEach(function(b){
  b.addEventListener('click', function(){
    $('#homeInput').value = b.dataset.q;
    askAI(b.dataset.q);
  });
});

/* ---------- 20 题法律风险测评（更全面、按风险指数分级） ---------- */
var QUIZ_DIMS = {
  rent:     '🏠 租房',
  job:      '💼 兼职 / 就业',
  contract: '📄 合同 / 消费',
  online:   '🔐 网络 / 资金安全',
  rights:   '🛡️ 纠纷应对 / 证据'
};
var QUIZ = [
  { q: '租房时，你会怎么确认「押金退还条件」？', dim: 'rent',
    opts: [ { t: '要求写进合同，并保留转账与聊天记录', p: 0 }, { t: '口头问清楚就行', p: 2 }, { t: '没提过，想着退房时再说', p: 3 } ] },
  { q: '签租房合同时，关于「违约金 / 提前解约」条款你通常：', dim: 'rent',
    opts: [ { t: '逐条阅读并争取双方对等', p: 0 }, { t: '看到了，但觉得只能接受', p: 2 }, { t: '没细看就签了', p: 3 } ] },
  { q: '入住后发现房屋设施损坏，你会：', dim: 'rent',
    opts: [ { t: '先拍照录像，再书面报修留痕', p: 0 }, { t: '口头告诉房东一声', p: 1 }, { t: '自己找人修，之后再扯皮', p: 3 } ] },
  { q: '你对「中介 / 转租 / 二房东」的风险了解程度：', dim: 'rent',
    opts: [ { t: '会核实产权与授权，只签正规合同', p: 0 }, { t: '知道要谨慎，但真正签约时较少核实', p: 2 }, { t: '不太了解，觉得没那么多坑', p: 3 } ] },
  { q: '找兼职 / 实习前，你会核实招聘公司吗？', dim: 'job',
    opts: [ { t: '用国家企业信用系统 / 企查查等核实主体', p: 0 }, { t: '基本相信招聘信息', p: 2 }, { t: '从不核实', p: 3 } ] },
  { q: '遇到「先交押金 / 培训费 / 服装费再入职」，你会：', dim: 'job',
    opts: [ { t: '直接拒绝，并怀疑是收费骗局', p: 0 }, { t: '金额不大就交了试试', p: 2 }, { t: '会按要求交钱', p: 3 } ] },
  { q: '关于「试用期时长、试用期工资」的规定，你了解吗？', dim: 'job',
    opts: [ { t: '清楚（有上限，且不得低于约定工资的 80%）', p: 0 }, { t: '大概知道一些', p: 1 }, { t: '不太了解', p: 3 } ] },
  { q: '老板让你「先干着，合同以后再补」，你会：', dim: 'job',
    opts: [ { t: '坚持签订书面合同，并保留工作记录', p: 0 }, { t: '先干着，之后再说', p: 2 }, { t: '无所谓，不签也没关系', p: 3 } ] },
  { q: '签约前，你会重点查看哪些条款？', dim: 'contract',
    opts: [ { t: '金额、违约金、退款、押金、单方解除与管辖', p: 0 }, { t: '只扫一遍金额和期限', p: 2 }, { t: '基本不看就直接签', p: 3 } ] },
  { q: '合同里出现「高额违约金 / 押金不退 / 可单方解除」时，你会：', dim: 'contract',
    opts: [ { t: '主动提出修改或要求对方解释', p: 0 }, { t: '看到了，但觉得只能接受', p: 2 }, { t: '从没留意过这类条款', p: 3 } ] },
  { q: '面对网购 / 健身房 / 培训班「预付充值」，你会：', dim: 'contract',
    opts: [ { t: '金额小、退费条款清楚才付', p: 0 }, { t: '优惠力度大就会多充', p: 2 }, { t: '金额再大也敢直接充', p: 3 } ] },
  { q: '购物后想要退货退款却被拒绝，你通常：', dim: 'contract',
    opts: [ { t: '先看平台规则并保留凭证再投诉', p: 0 }, { t: '口头争取一下，不行就算了', p: 2 }, { t: '直接放弃或去网上发泄', p: 3 } ] },
  { q: '收到「刷单返利 / 中奖 / 注销校园贷」类消息，你会：', dim: 'online',
    opts: [ { t: '直接不理会，必要时举报', p: 0 }, { t: '会点开看看再说', p: 2 }, { t: '有时会相信并按提示操作', p: 3 } ] },
  { q: '关于验证码与支付密码，你的习惯是：', dim: 'online',
    opts: [ { t: '绝不外泄，涉及转账先官方渠道核实', p: 0 }, { t: '看对方说得很急就可能给', p: 2 }, { t: '对方要就给', p: 3 } ] },
  { q: '你会把身份证 / 银行卡照片随意发给他人吗？', dim: 'online',
    opts: [ { t: '不会，个人信息只走正规渠道', p: 0 }, { t: '对方催得急时会给', p: 2 }, { t: '会给', p: 3 } ] },
  { q: '关于「砍头息 / 高利贷 / 网贷套路」，你的了解程度：', dim: 'online',
    opts: [ { t: '了解特征并能识别', p: 0 }, { t: '知道一点，但不深', p: 1 }, { t: '不太了解', p: 3 } ] },
  { q: '真的发生纠纷时，你的第一反应是：', dim: 'rights',
    opts: [ { t: '先固定证据，再协商或咨询', p: 0 }, { t: '先在网上发帖吐槽', p: 2 }, { t: '忍一忍算了，怕麻烦', p: 3 } ] },
  { q: '发生纠纷后，你会保存哪些材料？', dim: 'rights',
    opts: [ { t: '合同、转账、聊天、照片都留并整理时间线', p: 0 }, { t: '可能保留一部分', p: 1 }, { t: '基本不保留', p: 3 } ] },
  { q: '你知道维权渠道的大致顺序吗？', dim: 'rights',
    opts: [ { t: '清楚：协商 → 平台 / 12315 / 12333 → 12348 → 仲裁 / 诉讼', p: 0 }, { t: '大概知道', p: 2 }, { t: '不太清楚', p: 3 } ] },
  { q: '你会给重要材料定期备份并保留原件吗？', dim: 'rights',
    opts: [ { t: '会，重要文件都有备份', p: 0 }, { t: '偶尔会', p: 1 }, { t: '不会', p: 3 } ] }
];
var quizScore = 0, quizIdx = 0;
var quizDimScore = {};
function quizTotalMax(){
  return QUIZ.reduce(function(sum, it){
    return sum + it.opts.reduce(function(m, o){ return Math.max(m, o.p); }, 0);
  }, 0);
}
function quizReset(){
  quizScore = 0; quizIdx = 0; quizDimScore = {};
  $('#quizResult').classList.remove('on');
  $('#quizBody').classList.add('on');
  $('#quizStart').textContent = '重新测试 ⚡';
  renderQuizQ();
}
function renderQuizQ(){
  var it = QUIZ[quizIdx];
  $('#quizStep').textContent = '题目 ' + (quizIdx + 1) + ' / ' + QUIZ.length + ' · ' + (QUIZ_DIMS[it.dim] || it.dim);
  $('#quizBar').style.width = (quizIdx / QUIZ.length * 100) + '%';
  $('#quizQ').textContent = it.q;
  var box = $('#quizOpts'); box.innerHTML = '';
  it.opts.forEach(function(o, i){
    var b = el('button', 'quiz-opt', '<span class="m">' + String.fromCharCode(65 + i) + '</span><span>' + o.t + '</span>');
    b.addEventListener('click', function(){
      quizScore += o.p;
      quizDimScore[it.dim] = (quizDimScore[it.dim] || 0) + o.p;
      quizIdx++;
      if (quizIdx < QUIZ.length){ renderQuizQ(); }
      else { showQuizResult(); }
    });
    box.appendChild(b);
  });
}
function quizRiskColor(pct){
  return pct <= 25 ? '#059669' : (pct <= 55 ? '#b45309' : '#dc2626');
}
function showQuizResult(){
  $('#quizBody').classList.remove('on');
  var r = $('#quizResult');
  var maxScore = quizTotalMax();
  var pct = maxScore ? Math.round(quizScore / maxScore * 100) : 0;
  var level = pct <= 25 ? 0 : (pct <= 55 ? 1 : 2);
  var map = [
    { e: '🟢', t: '风险较低', c: '#059669', txt: '你的签约与维权习惯比较安全，法律风险意识良好。继续保持「先读条款、再留证据」的习惯；金额较大的合同仍建议用「AI 合同审查」二次把关。' },
    { e: '🟡', t: '存在一定风险', c: '#b45309', txt: '部分环节存在风险隐患。建议：1) 重点合同先用「AI 合同审查」扫描；2) 涉及押金、违约金、退款等务必落实到书面；3) 发生纠纷第一时间固定证据，再通过 12315 / 12333 / 12348 逐级处理。' },
    { e: '🔴', t: '风险较高，签约需谨慎', c: '#dc2626', txt: '你的习惯容易踩坑。强烈建议：1) 重要合同先逐条审查，拿不准就咨询 AI 助手或拨打 12348；2) 停止一切先交钱的招聘 / 刷单 / 预付；3) 从现在开始为每一笔交易保留凭证；重大事项请咨询执业律师。' }
  ][level];
  $('#qrEmoji').textContent = map.e;
  $('#qrTitle').textContent = map.t;
  $('#qrTitle').style.color = map.c;
  $('#qrText').textContent = map.txt + '（本次得分 ' + quizScore + ' / ' + maxScore + ' · 风险指数 ' + pct + '%）';
  /* 分领域风险明细 */
  var dimBox = $('#qrDim'); dimBox.innerHTML = '';
  Object.keys(QUIZ_DIMS).forEach(function(k){
    var dScore = quizDimScore[k] || 0;
    var dMax = QUIZ.filter(function(it){ return it.dim === k; }).reduce(function(sum, it){
      return sum + it.opts.reduce(function(m, o){ return Math.max(m, o.p); }, 0);
    }, 0);
    var dPct = dMax ? Math.round(dScore / dMax * 100) : 0;
    var c = quizRiskColor(dPct);
    var chip = el('span', 'qd-chip', (QUIZ_DIMS[k]) + ' 风险 ' + (dPct <= 25 ? '低' : (dPct <= 55 ? '中' : '高')) + ' ' + dPct + '%');
    chip.style.borderColor = c; chip.style.color = c; chip.style.background = c + '14';
    dimBox.appendChild(chip);
  });
  r.classList.add('on');
  r.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
$('#quizStart').addEventListener('click', quizReset);
$('#qrAgain').addEventListener('click', quizReset);
$('#qrAi').addEventListener('click', function(){ showPage('page-ai'); });
/* =========================================================
   AI 助手：场景数据 + 模拟对话
   ========================================================= */
var SCEN = {
  housing: {
    icon: '🏠', title: '房东扣押金',
    ask: '🏠 房东扣押金，我该怎么办？',
    ans: '别慌，帮你把思路理清楚👇\n\n1️⃣ 先看约定\n翻出合同 / 聊天记录，确认押金金额、退租时间，以及有无书面扣款约定。没有约定就不能随便扣。\n\n2️⃣ 固定证据（关键一步）\n保留：合同原件、押金转账记录、入住 / 退房照片、房东说明扣款理由的聊天或录音。\n\n3️⃣ 先书面沟通\n发一条正式消息：请房东书面列明扣款项目、对应条款和票据，并约定返还时间。\n\n4️⃣ 升级路径\n协商不成 → 街道调解 → 拨打 12348 法律援助热线 → 必要时申请小额诉讼。\n\n📌 参考依据：《民法典》第 709、710 条 等（演示内容，正式使用请核对最新法条）',
    su: [
      { q: '房东一直拖延怎么办？', a: '① 每 3~5 天书面催告一次并保留记录；② 同步向社区 / 街道申请调解；③ 拨打 12348 咨询，准备起诉材料。拖延不等于消失，要在时效内持续主张权利（演示）。' },
      { q: '押金收多少算合理？', a: '市场惯例一般为 1~2 个月租金。金额、退还条件与期限最好都写进合同；付款时备注「租房押金」，退租时索要书面验收记录（演示）。' }
    ]
  },
  parttime: {
    icon: '💼', title: '兼职 / 实习欠薪',
    ask: '💼 兼职 / 实习被拖欠工资，我该怎么办？',
    ans: '兼职 / 实习被欠薪，很多同学都踩过坑，按顺序处理：\n\n1️⃣ 盘点事实\n入职时间、约定报酬、工作内容、欠薪金额与周期，先列一张表。\n\n2️⃣ 收集证据\n排班 / 打卡记录、工作群聊天、工资转账流水、公司全称与老板身份信息。\n\n3️⃣ 正式催讨\n用文字（微信 / 邮件）明确欠薪金额与支付期限，保留对方回复。\n\n4️⃣ 投诉渠道\n劳动监察 12333 → 劳动仲裁 → 法院起诉；也可先找学校就业办 / 法援中心。\n\n📌 参考依据：《劳动法》《劳动合同法》及当地最低工资规定（演示内容）',
    su: [
      { q: '没签合同也能要回工资吗？', a: '可以。存在事实劳动关系即可主张权利，考勤、工作群、转账记录都能证明。未签书面合同还可能主张二倍工资差额（演示）。' },
      { q: '申请仲裁要多久？', a: '劳动仲裁时效一般为一年，自知道权利被侵害之日起算；仲裁通常 45 日内审结，金额不大也可先走调解（演示）。' }
    ]
  },
  contract: {
    icon: '📄', title: '合同问题',
    ask: '📄 合同条款看不懂 / 怕被坑，怎么办？',
    ans: '合同看不懂？教你三步自查：\n\n1️⃣ 重点看 5 类条款\n金额与支付方式、违约金、押金 / 保证金、解除与违约、争议解决（仲裁 or 法院）。\n\n2️⃣ 检查「空白」\n空白处没填、用词模糊（“视情况”“另行协商”）最容易埋雷。\n\n3️⃣ 别怕提修改\n签约前你有权要求修改；谈不拢就保留证据，别急着签字。\n\n💡 小技巧：上传到「AI 合同审查」，一键扫描风险条款，附修改建议与法律依据（演示）。',
    su: [
      { q: '违约金太高怎么办？', a: '违约金过分高于实际损失时，可请求法院 / 仲裁机构适当调低，实务中常以实际损失的 30% 为参考上限（演示）。' },
      { q: '哪些条款必须写清楚？', a: '金额与支付节点、违约金、押金退还、解除条件、争议解决方式。留白与「另行协商」字样要特别警惕（演示）。' }
    ]
  },
  probation: {
    icon: '👔', title: '试用期辞退',
    ask: '👔 试用期被辞退，有补偿吗？',
    ans: '试用期被辞退，先判断是否合法：\n\n1️⃣ 看理由\n只有「不符合录用条件」且已明确告知时，单位才能合法解除；不能随口一句「不合适」就辞退。\n\n2️⃣ 看证据\n要求对方出具书面解除通知与理由；保存考勤、工作产出与沟通记录。\n\n3️⃣ 谈补偿\n违法辞退可主张赔偿金；协商解除通常有经济补偿。试用期工资不得低于约定工资的 80% 或当地最低工资。\n\n4️⃣ 维权路径\n劳动监察 12333 → 劳动仲裁 → 法院；应届生可同步联系学校就业办。\n\n📌 参考依据：《劳动合同法》第 19、21、39、47、87 条（演示内容）',
    su: [
      { q: '试用期有工资吗？', a: '有。试用期工资不得低于本单位相同岗位最低档工资或合同约定工资的 80%，且不得低于当地最低工资标准（演示）。' },
      { q: '试用期一般多久？', a: '合同 3 个月以上不满 1 年，试用期不超过 1 个月；1~3 年不超过 2 个月；3 年以上不超过 6 个月。同一单位只能约定一次试用期（演示）。' }
    ]
  },
  fakejob: {
    icon: '🔎', title: '虚假招聘',
    ask: '🔎 遇到虚假招聘 / 收费入职怎么办？',
    ans: '遇到虚假招聘、收费入职，记住一句话：先交钱的招聘基本都是坑！\n\n1️⃣ 停止付费\n「押金、培训费、服装费、建档费」都属于违规收费，不要再转账。\n\n2️⃣ 固定证据\n保存招聘信息截图、聊天记录、转账凭证、公司主体信息。\n\n3️⃣ 举报渠道\n平台内举报 → 12315 投诉 → 金额较大涉嫌诈骗可报警。\n\n4️⃣ 身份核验\n签约前用「国家企业信用信息公示系统」查公司是否真实存在、有无经营异常。\n\n📌 参考依据：《劳动合同法》第 9 条——不得要求劳动者提供担保或收取财物（演示内容）',
    su: [
      { q: '已经被骗钱了怎么办？', a: '立即停止转账，保存全部凭证；向平台举报并拨打 12315，金额较大涉嫌诈骗可报警，同时提醒身边同学防范（演示）。' },
      { q: '怎么查公司靠不靠谱？', a: '用「国家企业信用信息公示系统」查注册信息、经营异常与行政处罚；再核对招聘信息、办公地址与公司官网是否一致（演示）。' }
    ]
  },
  other: {
    icon: '⚖️', title: '其他法律问题',
    ask: '⚖️ 我遇到了其他法律问题，想咨询一下',
    ans: '好的，我大概理解你的情况了（演示）。\n\n建议先按这个框架整理：\n① 发生了什么（时间、人物、地点）\n② 你希望对方做什么 / 赔偿多少\n③ 手上有哪些证据（文字、图片、转账）\n④ 是否已向学校、平台或有关部门反馈过\n\n把材料整理清楚后：\n- 消费 / 培训退费 → 12315\n- 人身 / 财产损失 → 学校保卫处或报警\n- 拿不准 → 12348 法律援助热线\n\n📌 你可以在下方继续补充描述，我会帮你进一步梳理（演示回答）。',
    su: [
      { q: '12348 是什么？', a: '全国法律援助热线：免费咨询，可判断是否符合法律援助条件，并引导你到最近的援助机构（演示）。' },
      { q: '学生打官司有优惠吗？', a: '符合条件的可申请法律援助（免费代理）；小额诉讼程序简单、费用低，很多纠纷不必请律师（演示）。' }
    ]
  }
};

/* 关键词 → 场景匹配 */
function detectScene(text){
  if (/押金|房东|租房|退租|中介/.test(text)) return 'housing';
  if (/工资|欠薪|兼职|实习|劳务/.test(text)) return 'parttime';
  if (/试用期|辞退|开除|裁员/.test(text)) return 'probation';
  if (/招聘|骗|中介费|收费|入职/.test(text)) return 'fakejob';
  if (/合同|违约金|条款|签约|协议/.test(text)) return 'contract';
  return 'other';
}
function fallbackAns(){
  return '收到，你的问题我已记录（演示）。\n\n建议按这个节奏推进：\n① 先把时间线 & 证据整理清楚（文字、截图、转账都算）\n② 明确你的诉求：希望对方做什么 / 赔多少\n③ 先书面沟通并保留记录\n④ 拿不准就打 12348 法律援助热线\n\n💡 想要更精准的演示回答，可以回到列表选择具体场景，或上传合同使用「AI 合同审查」。';
}/* =========================================================
   AI 助手 · DeepSeek 接入 + 聊天交互
   ---------------------------------------------------------
   - 通过 OpenAI 兼容接口 https://api.deepseek.com/v1/chat/completions
     调用 DeepSeek 官方云端大模型（默认模型 deepseek-chat）。
   - 配置保存在浏览器 localStorage；未连接服务时自动回退离线演示回答。
   ========================================================= */
var FUZI_CFG_KEY = 'deepseek_cfg_v1';
var FUZI_DEFAULT = { mode: 'demo', base: 'https://api.deepseek.com', model: 'deepseek-chat', key: '' };
function loadFuziCfg(){
  try {
    var s = localStorage.getItem(FUZI_CFG_KEY);
    if (s){ var o = JSON.parse(s); o.mode = (o.mode === 'model') ? 'model' : 'demo';
      o.base = o.base || FUZI_DEFAULT.base; o.model = o.model || FUZI_DEFAULT.model; o.key = o.key || '';
      return o; }
  } catch(e){}
  return JSON.parse(JSON.stringify(FUZI_DEFAULT));
}
var FUZI_CFG = loadFuziCfg();
function saveFuziCfg(o){ FUZI_CFG = o; try{ localStorage.setItem(FUZI_CFG_KEY, JSON.stringify(o)); }catch(e){} }
function modelOn(){ return FUZI_CFG.mode === 'model'; }
function fuziBase(){
  var b = (FUZI_CFG.base || FUZI_DEFAULT.base).trim().replace(/\/+$/,'');
  if (!/\/v1$/i.test(b)) b += '/v1';
  return b;
}
/* 系统提示：让模型按“法护启航”的要求回答各类法律问题 */
var FUZI_SYS = '你是「法护启航」大学生法律安全驾驶舱内置的法律助手「法小航」，底层模型为 DeepSeek 大模型。' +
  '你面向在校大学生，擅长回答租房、兼职就业、合同纠纷、消费维权、人身权益、网络侵权等法律问题。' +
  '回答要求：1) 优先引用具体法律名称与条款号，条号统一用阿拉伯数字，格式示例「《民法典》第 709 条」「《劳动合同法》第 19、47 条」；' +
  '2) 分步骤给出可操作建议（固定证据、协商、投诉渠道、仲裁/诉讼路径）；' +
  '3) 案情信息不足时先追问关键事实，不要编造；4) 拿不准或涉及重大利益时，明确提示拨打 12348 法律援助热线或咨询执业律师；' +
  '5) 语言简洁友好、条理清晰。注意：你的回答仅供学习参考，不构成正式法律意见。';

/* 聊天状态 */
var chatScroll = $('#chatScroll');
var chatTitle = $('#chatTitle');
var currentKey = null;       // 当前场景 key
var chatHistory = [];        // 发送给模型的多轮对话历史
var chatBusy = false;        // 是否正在等待模型
var chatAbort = null;        // 用于中断上一次请求

function scrollBottom(){ chatScroll.scrollTop = chatScroll.scrollHeight; }

/* 用户 / 助手消息 */
function pushMsg(role, text){
  var row = el('div', 'msg ' + (role === 'self' ? 'self' : 'bot'));
  row.appendChild(el('div', 'av', role === 'self' ? '🧑' : '🤖'));
  var bub = el('div', 'bubble');
  if (role === 'self') bub.textContent = text;
  else renderMd(bub, text);
  row.appendChild(bub);
  chatScroll.appendChild(row);
  scrollBottom();
  return bub;
}
/* “正在输入”占位气泡，返回用于后续填充 */
function botTyping(){
  var row = el('div', 'msg bot');
  row.appendChild(el('div', 'av', '🤖'));
  var bub = el('div', 'bubble typing', '<i></i><i></i><i></i>');
  row.appendChild(bub);
  chatScroll.appendChild(row);
  scrollBottom();
  return bub;
}
/* 离线模式：模拟思考后回复 */
function botReply(text, done){
  var bub = botTyping();
  setTimeout(function(){
    bub.classList.remove('typing');
    renderMd(bub, text || fallbackAns());
    scrollBottom();
    if (done) done();
  }, 900);
}

/* 离线兜底：覆盖不同法律问题的分类建议（模型不可用时的演示回答） */
function offlineAnswer(text){
  var t = text || '';
  var checks = [
    { re: /消费|退货|退款|退费|培训|课程|机构|健身房|美容|理发|办卡|预售/,
      a: '遇到消费 / 预付式纠纷，按四步处理：\n① 固定证据：合同、付款记录、宣传与承诺截图；\n② 先书面协商，明确“退多少、什么时间退”；\n③ 商家拒绝 → 平台投诉 + 拨打 12315（市场监管）；\n④ 仍无果 → 属地调解或小额诉讼。\n\n📌 参考：《消费者权益保护法》第 24、55 条（离线演示回答）' },
    { re: /校园贷|网贷|高利贷|砍头息|分期|套路贷|利息/,
      a: '涉借贷纠纷请注意：\n① 核算实际年利率，超过合同成立时一年期 LPR 四倍的部分，法院一般不予支持；\n② 保留借款合同、到账流水与还款记录，警惕“砍头息”；\n③ 遭遇催收骚扰、暴力威胁或疑似“套路贷”，请立即报警；\n④ 可同时向金融监管部门投诉。\n\n📌 参考：《民法典》第 680 条 禁止高利放贷（离线演示回答）' },
    { re: /受伤|人身|侵权|殴打|霸凌|欺凌|交通事故|被打|骚扰|校园暴力/,
      a: '人身权益受损，建议按以下步骤处理：\n① 先就医并保留病历与票据；伤情较重请报警并申请验伤；\n② 固定证据：监控、证人、聊天记录等；\n③ 可主张医疗费、护理费、交通费、误工损失等，造成严重精神损害的还可主张精神损害赔偿；\n④ 先与对方或学校调解，不成再起诉。\n\n📌 参考：《民法典》第 1165、1179、1183 条（离线演示回答）' },
    { re: /名誉|隐私|诽谤|造谣|网暴|人肉|照片|泄露/,
      a: '遭遇网络侵权（名誉 / 隐私 / 诽谤）：\n① 第一时间用录屏、公证或可信时间戳固定证据；\n② 要求平台删除、断开链接，并通知侵权人停止侵害；\n③ 保留身份线索，可向网信部门投诉或报警（公然侮辱、诽谤可能违反《治安管理处罚法》第 42 条）；\n④ 造成严重后果的可提起民事诉讼。\n\n📌 参考：《民法典》第 1024、1032 条（离线演示回答）' },
    { re: /论文|抄袭|代写|著作权|版权|盗版|毕设|作品/,
      a: '涉及知识产权 / 论文问题：\n① 保留原创底稿、过程文件与发布时间证明（时间戳、邮箱记录等）；\n② 先向发布平台投诉下架，或向学校学术部门反映；\n③ 构成侵权的，可要求停止侵害、赔礼道歉并赔偿损失；\n④ 重要作品建议做著作权登记。\n\n📌 参考：《著作权法》相关规定（离线演示回答）' },
    { re: /维修|漏水|损坏|家电|自然损耗/,
      a: '房屋维修责任纠纷：\n① 先判断是自然损耗还是人为损坏；\n② 自然损耗（水管老化、家电自然故障等）通常应由出租方负责维修；\n③ 书面通知房东并约定维修时限，保留报修记录；\n④ 房东拖延的，可自行维修后凭票据主张费用。\n\n📌 参考：《民法典》第 712、713 条（离线演示回答）' },
    { re: /劳动|社保|五险|公积金|离职证明|档案|仲裁/,
      a: '劳动权益问题通用路径：\n① 整理入职时间、岗位、工资与离职原因；\n② 固定证据：劳动合同、工资流水、考勤、聊天记录；\n③ 社保 / 公积金问题可向人社部门反映；欠薪或违法解除可申请劳动仲裁（时效一般为一年）；\n④ 拿不准先打 12333 或 12348。\n\n📌 参考：《劳动合同法》第 30、38、46、47 条（离线演示回答）' }
  ];
  for (var i = 0; i < checks.length; i++){
    if (checks[i].re.test(t)) return checks[i].a;
  }
  return fallbackAns();
}

/* 离线演示统一取答（唯一入口）：优先命中六大场景标准答案，否则走关键词分类兜底。
   正常演示路径与模型失败兜底都走这里，保证同一问题回答一致。 */
function demoAnswerFor(text){
  var k = detectScene(text);
  return (k !== 'other' && SCEN[k] && SCEN[k].ans) ? SCEN[k].ans : offlineAnswer(text);
}
/* 跨场景追问时，同步对话标题与快捷追问 chips，避免“回答是 A 场景、chips 还是 B 场景”的错位 */
function syncSceneChips(k){
  if (!k || !SCEN[k]) return;
  if (k !== currentKey){
    currentKey = k;
    chatTitle.textContent = SCEN[k].icon + ' ' + SCEN[k].title;
  }
  renderSuggests(k);
}

/* ---------- 调用 DeepSeek（OpenAI 兼容接口） ---------- */
function buildHeaders(){
  var headers = { 'Content-Type': 'application/json' };
  var key = (FUZI_CFG.key || '').trim();
  if (key) headers['Authorization'] = 'Bearer ' + key;
  return headers;
}
/* DeepSeek 响应内容提取：content 为空时回退 reasoning_content（reasoner 模型），并给出可读空返回原因 */
function dsContent(j){
  var ch = (j && j.choices && j.choices[0]) || {};
  var msg = ch.message || {};
  var c = msg.content;
  if (c === null || c === undefined || String(c).trim() === '') c = msg.reasoning_content;
  return (c === null || c === undefined) ? '' : String(c);
}
function dsFinishReason(j){ return (j && j.choices && j.choices[0] && j.choices[0].finish_reason) || ''; }
function dsEmptyError(j){
  var fr = dsFinishReason(j);
  if (fr === 'length') return '模型回答因超出长度上限被截断，请缩小问题或拆分后重试';
  if (!j || !j.choices || !j.choices.length) return '模型未返回候选内容：可能账户余额不足、Key 失效或服务异常，请检查后重试';
  return '模型返回内容为空：可能被内容安全策略拦截、余额不足或输出超长，请稍后重试（已尝试解析 reasoning_content）';
}
function askModel(text, done){
  if (chatBusy){ toast('正在生成回答，请稍候…', false); return; }
  chatBusy = true;
  var input = $('#chatInput'); if (input) input.disabled = true;
  if (chatAbort){ chatAbort.intentional = true; chatAbort.abort(); }
  var ac = new AbortController(); ac.intentional = false; chatAbort = ac;
  var timer = setTimeout(function(){ ac.abort(); }, 120000);

  chatHistory.push({ role: 'user', content: text });
  var msgs = chatHistory.slice(-12).map(function(m){ return { role: m.role, content: m.content }; });
  /* DeepSeek 支持 system 角色：将系统要求作为独立的 system 消息置于最前 */
  msgs.unshift({ role: 'system', content: FUZI_SYS });

  var bub = botTyping();
  var payload = {
    model: FUZI_CFG.model || FUZI_DEFAULT.model,
    messages: msgs,
    temperature: 0.7, top_p: 0.9,
    max_tokens: 2048,
    stream: false
  };
  fetch(fuziBase() + '/chat/completions', {
    method: 'POST', headers: buildHeaders(), body: JSON.stringify(payload), signal: ac.signal
  }).then(function(r){
    if (!r.ok) return r.text().then(function(t){ throw new Error('HTTP ' + r.status + ' ' + String(t).slice(0, 140)); });
    return r.json();
  }).then(function(j){
    var content = dsContent(j);
    if (!content) throw new Error(dsEmptyError(j));
    bub.classList.remove('typing');
    renderMd(bub, content);
    chatHistory.push({ role: 'assistant', content: content });
    if (chatHistory.length > 24) chatHistory = chatHistory.slice(-24);
    scrollBottom();
    if (done) done();
  }).catch(function(err){
    if (ac.intentional){ if (bub.parentNode) bub.parentNode.remove(); return; }
    /* 模型不可用：当前气泡只承载错误提示（完整句子，不悬空冒号）；
       离线答案由 botReply 以独立气泡给出，两个气泡各司其职、内容来源单一 */
    bub.classList.remove('typing');
    bub.classList.add('err');
    bub.textContent = '⚠️ 暂时无法获取「DeepSeek」回答（' + err.message + '），已自动切换为离线演示回答。';
    var k = detectScene(text);
    botReply(demoAnswerFor(text), function(){ syncSceneChips(k); });
  }).finally(function(){
    clearTimeout(timer);
    if (chatAbort === ac) chatAbort = null;
    chatBusy = false;
    if (input) input.disabled = false;
  });
}

/* ---------- 快捷追问 chips ---------- */
function renderSuggests(key){
  var box = $('#chatSuggests'); box.innerHTML = '';
  if (!key) return;
  SCEN[key].su.forEach(function(s){
    var c = el('button', 'cs-chip', s.q);
    c.addEventListener('click', function(){
      pushMsg('self', s.q);
      if (modelOn()) askModel(s.q);
      else botReply(s.a);
    });
    box.appendChild(c);
  });
  var back = el('button', 'cs-chip', '← 返回问题列表');
  back.addEventListener('click', backToList);
  box.appendChild(back);
}
function clearSuggests(){ $('#chatSuggests').innerHTML = ''; }

/* ---------- 进入 / 退出对话 ---------- */
function openChat(key, userText){
  currentKey = key;
  chatHistory = [];
  if (chatAbort){ chatAbort.intentional = true; chatAbort.abort(); }
  $('#qaList').style.display = 'none';
  $('#chatView').classList.add('on');
  chatTitle.textContent = SCEN[key].icon + ' ' + SCEN[key].title;
  chatScroll.innerHTML = '';
  clearSuggests();
  var q = (userText && String(userText).trim()) ? String(userText).trim() : SCEN[key].ask;
  pushMsg('self', q);
  if (modelOn()){
    /* 真实模型模式：问题直接交给 DeepSeek 回答 */
    askModel(q, function(){ renderSuggests(key); });
  } else {
    /* 离线演示：统一入口取答（命中场景给标准答案，否则关键词兜底），并同步场景 chips */
    botReply(demoAnswerFor(q), function(){ syncSceneChips(detectScene(q)); });
  }
}
function backToList(){
  if (chatAbort){ chatAbort.intentional = true; chatAbort.abort(); }
  $('#chatView').classList.remove('on');
  $('#qaList').style.display = '';
  currentKey = null;
  clearSuggests();
}

/* 从首页 / 快捷入口 / 风险地图等处进入咨询 */
function askAI(text){
  text = (text || '').trim();
  var key = detectScene(text);
  showPage('page-ai');
  openChat(key, text);
}

/* ---------- 界面状态 ---------- */
function updateAIModeUI(){
  var on = modelOn();
  $('#aiModeLabel').textContent = on ? 'DeepSeek 已接入' : '离线演示模式';
  $('#aiModeSub').textContent = on ? '真实模型回答 · 需有效 API Key' : '模拟回答 · 仅供参考';
  $('#aiModeDot').style.background = on ? '#4ade80' : '#94a3b8';
  $('#chatModeTag').textContent = on ? '🎓 DeepSeek' : '● 离线演示';
}
function setSegUI(){
  $$('#modeSeg .seg-btn').forEach(function(b){
    b.classList.toggle('on', b.dataset.mode === FUZI_CFG.mode);
  });
}
function openAiModal(){
  $('#aiBase').value = FUZI_CFG.base || FUZI_DEFAULT.base;
  $('#aiModel').value = FUZI_CFG.model || FUZI_DEFAULT.model;
  $('#aiKey').value = FUZI_CFG.key || '';
  var res = $('#aiTestRes'); res.className = 'am-test'; res.textContent = '';
  setSegUI();
  $('#aiModal').classList.add('on');
}
function closeAiModal(){ $('#aiModal').classList.remove('on'); }
function syncCfgFromInputs(){
  FUZI_CFG.mode = $$('#modeSeg .seg-btn.on')[0] ? $$('#modeSeg .seg-btn.on')[0].dataset.mode : FUZI_CFG.mode;
  FUZI_CFG.base = $('#aiBase').value.trim() || FUZI_DEFAULT.base;
  FUZI_CFG.model = $('#aiModel').value.trim() || FUZI_DEFAULT.model;
  FUZI_CFG.key = $('#aiKey').value.trim();
}
function testFuziConnection(){
  syncCfgFromInputs();
  var res = $('#aiTestRes'); res.className = 'am-test'; res.textContent = '⏳ 正在测试连接…';
  fetch(fuziBase() + '/models', { headers: buildHeaders(), signal: acTimeout(9000) })
    .then(function(r){
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function(j){
      var names = (j && j.data || []).map(function(x){ return x.id || x.name || ''; });
      var hit = names.indexOf(FUZI_CFG.model) >= 0;
      res.classList.add(hit ? 'ok' : 'err');
      res.textContent = hit
        ? '✅ 已连接！模型「' + FUZI_CFG.model + '」可用，可开始咨询。'
        : '✅ 服务已连接，但可用模型列表为：' + (names.join('、') || '空') + '。请核对模型名称（默认 deepseek-chat）。';
    }).catch(function(err){
      res.classList.add('err');
      res.textContent = '❌ 连接失败：' + err.message + '。请确认 API Key 有效，且服务地址填写正确（默认 https://api.deepseek.com）。';
    });
}
function acTimeout(ms){
  var c = new AbortController();
  setTimeout(function(){ c.abort(); }, ms);
  return c.signal;
}

/* ---------- 事件绑定 ---------- */
$$('.qa-card').forEach(function(c){
  c.addEventListener('click', function(){ openChat(c.dataset.key); });
});
$('#chatBack').addEventListener('click', backToList);
$('#chatClear').addEventListener('click', function(){
  chatHistory = [];
  if (chatAbort){ chatAbort.intentional = true; chatAbort.abort(); }
  backToList();
  toast('对话已清空', true);
});

/* 聊天输入框：真实模型 / 离线演示双通道 */
$('#chatForm').addEventListener('submit', function(e){
  e.preventDefault();
  var v = $('#chatInput').value.trim();
  if (!v || chatBusy) return;
  $('#chatInput').value = '';
  pushMsg('self', v);
  if (modelOn()){
    askModel(v);
  } else {
    /* 离线演示：跨场景追问时，回答后同步对话标题与快捷追问 chips */
    var k = detectScene(v);
    botReply(demoAnswerFor(v), function(){ syncSceneChips(k); });
  }
});

/* 接入设置弹窗 */
$('#aiSetBtn').addEventListener('click', openAiModal);
$('#aiModalClose').addEventListener('click', closeAiModal);
$('#aiCancel').addEventListener('click', closeAiModal);
$('#aiModal').addEventListener('click', function(e){ if (e.target === this) closeAiModal(); });
$$('#modeSeg .seg-btn').forEach(function(b){
  b.addEventListener('click', function(){
    $$('#modeSeg .seg-btn').forEach(function(x){ x.classList.toggle('on', x === b); });
  });
});
$('#aiTest').addEventListener('click', testFuziConnection);
$('#aiSave').addEventListener('click', function(){
  syncCfgFromInputs();
  saveFuziCfg(FUZI_CFG);
  updateAIModeUI();
  closeAiModal();
  toast(modelOn() ? '已启用「DeepSeek」真实模型回答' : '已切换为离线演示模式', true);
});

updateAIModeUI();/* =========================================================
   合同审查：模拟数据（示例租房合同）
   ========================================================= */
var RISK = [
  { level: 'high', title: '押金扣除条款过于宽泛（第 9 条）',
    reason: '条款仅写「押金是否退还由出租方视房屋情况决定」，未列明可扣除情形、未约定返还期限，等于把解释权全部交给出租方，极易被滥用。',
    fix: '改为逐项列明可扣除情形（如欠费、人为损坏），并补充：无扣款情形的，应在退租后 X 日内无息全额退还；扣款的需出具票据。',
    law: '《民法典》第 709、710 条；《住房租赁条例》关于押金收取与退还的规定（演示参考）' },
  { level: 'high', title: '违约金条款过高（第 6 条）',
    reason: '约定「承租方提前退租需支付两个月租金作为违约金」，明显高于可能造成的实际损失，涉嫌显失公平。',
    fix: '参照实际损失适当调低（实务参考：不超过损失的 30%），或改为「相当于一个月租金」，并约定双方对等适用。',
    law: '《民法典》第 585 条第 2 款：约定的违约金过分高于造成的损失的，人民法院可适当减少（演示参考）' },
  { level: 'high', title: '出租方单方解除权（第 14 条）',
    reason: '仅约定「出租方可因经营需要提前解除合同」，未约定提前通知期限、搬家补偿与押金处理，权利义务明显不对等。',
    fix: '补充：出租方提前解除需提前 30 日书面通知，支付搬家补偿并全额退还押金；违约解除应承担违约责任。',
    law: '《民法典》第 563 条（法定解除）、第 566 条（解除后责任承担）（演示参考）' },
  { level: 'mid', title: '维修责任约定不明（第 12 条）',
    reason: '未区分房屋自然损耗与人为损坏，维修费用由谁承担不明确，入住期间电器、管道出问题容易互相扯皮。',
    fix: '明确「自然损耗由出租方负责维修并承担费用，人为损坏由承租方承担」，并约定报修后 X 日内响应。',
    law: '《民法典》第 712、713 条：出租人应履行租赁物维修义务（演示参考）' },
  { level: 'mid', title: '租金调整无上限（第 3 条）',
    reason: '约定出租方可「根据市场情况调整租金」，未设涨幅上限与提前通知期，续租时租金可能被随意抬高。',
    fix: '增加限制：租期内租金不变；续租如需调整，年度涨幅不超过 X%，且需提前 30 日书面通知。',
    law: '《民法典》第 509 条（诚信原则与全面履行）（演示参考）' },
  { level: 'mid', title: '押金金额偏高（第 5 条）',
    reason: '押金按三个月租金收取，明显高于市场常见水平（1~2 个月），对学生资金占用较大。',
    fix: '争取将押金降至 1 个月租金；若对方坚持，请把退还条件与期限写得尽可能明确。',
    law: '《住房租赁条例》关于押金的相关规定（演示参考）' },
  { level: 'mid', title: '争议管辖约定不明确（第 15 条）',
    reason: '仅写「协商不成可向法院起诉」，未约定管辖法院。租房多发生在学校所在地，若按被告住所地管辖，异地维权成本高。',
    fix: '补充约定：「因本合同引起的争议，由合同签订地（学校所在地）人民法院管辖」，便于就近维权。',
    law: '《民事诉讼法》第 34 条（协议管辖）（演示参考）' },
  { level: 'mid', title: '送达与通知条款缺失（第 10 条）',
    reason: '未约定双方确认的送达地址与电子送达方式，口头通知是否有效、是否送达到位都容易引发争议。',
    fix: '补充：「双方确认下列地址 / 邮箱 / 微信为有效通知方式，变更需提前书面告知」，并注明拒收视为送达。',
    law: '《民法典》第 137 条（以非对话方式作出的意思表示的生效）（演示参考）' }
];

var LOW_TIPS = [
  '第 1 条：条款编号不连续，建议统一编号', '第 2 条：用词「左右 / 大约」不精确，建议改为明确数字',
  '第 3 条：未标注收款账户户名与账号', '第 4 条：空白处未划除，建议填写「无」或划线',
  '第 5 条：未约定合同份数，建议注明双方各执一份', '第 6 条：签署日期格式不统一',
  '第 7 条：缺少双方联系人姓名与电话', '第 8 条：未说明电子签章与手写签名同等效力',
  '第 9 条：附件清单缺失，建议列明附后文件', '第 10 条：未约定争议文本效力（如中英文冲突以中文为准）',
  '第 11 条：措辞「不得反悔」建议改为规范法律表述', '第 12 条：多页合同未注明加盖骑缝章'
];

var riskBuilt = false, lowBuilt = false;
var currentFilter = 'all';

/* 构建高 / 中风险卡片 */
function buildRiskCards(){
  if (riskBuilt) return;
  var wrap = $('#riskList');
  RISK.forEach(function(it, i){
    var card = el('div', 'risk-card' + (it.level === 'high' && i === 0 ? ' open' : ''));
    card.dataset.level = it.level;
    var head = el('div', 'risk-head');
    head.appendChild(el('span', 'sev-dot ' + it.level));
    var tt = el('div', 'rh-t');
    tt.appendChild(el('b', null, it.title));
    tt.appendChild(el('span', null, it.level === 'high' ? '必须修改 · 涉及核心利益' : '建议修改 · 存在争议空间'));
    head.appendChild(tt);
    head.appendChild(el('span', 'sev-tag ' + it.level, it.level === 'high' ? '🔴 高风险' : '🟡 中风险'));
    head.appendChild(el('span', 'caret', '▾'));
    card.appendChild(head);
    /* 风险原因 / 修改建议 / 法律依据 */
    var body = el('div', 'risk-body');
    body.appendChild(rRow('reason', '风险原因', it.reason));
    body.appendChild(rRow('fix', '修改建议', it.fix));
    body.appendChild(rRow('law', '法律依据', it.law));
    card.appendChild(body);
    head.addEventListener('click', function(){ card.classList.toggle('open'); });
    wrap.appendChild(card);
  });
  riskBuilt = true;
}
function rRow(type, label, text){
  var row = el('div', 'r-row ' + type);
  var ico = { reason: '❗', fix: '✏️', law: '⚖️' }[type];
  row.appendChild(el('span', 'r-ico', ico));
  var b = el('div', 'r-body');
  b.appendChild(el('b', null, label));
  b.appendChild(el('span', null, text));
  row.appendChild(b);
  return row;
}

/* 低风险 12 条 */
function buildLowList(){
  if (lowBuilt) return;
  var wrap = $('#lowList');
  LOW_TIPS.forEach(function(t){ wrap.appendChild(el('div', 'low-item', t)); });
  lowBuilt = true;
}
$('#lowHead').addEventListener('click', function(){
  $('#lowBlock').classList.toggle('open');
});

/* 风险筛选 */
function applyFilter(f){
  currentFilter = f;
  $$('.f-btn').forEach(function(b){ b.classList.toggle('on', b.dataset.f === f); });
  var cards = $$('#riskList .risk-card');
  cards.forEach(function(c){
    var show = (f === 'all') || (c.dataset.level === f);
    c.classList.toggle('hide', !show);
  });
  var lb = $('#lowBlock');
  if (f === 'low'){ cards.forEach(function(c){ c.classList.add('hide'); }); lb.style.display = ''; $('#lowBlock').classList.add('open'); }
  else if (f === 'all'){ lb.style.display = ''; $('#lowBlock').classList.remove('open'); }
  else { lb.style.display = 'none'; }
}
$$('.f-btn').forEach(function(b){
  b.addEventListener('click', function(){ applyFilter(b.dataset.f); });
});/* =========================================================
   合同审查：上传 / 扫描 / 报告交互
   ========================================================= */
var ACCEPT = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp', 'txt', 'md'];
var fileData = null, scanTimers = [];

function setFile(f, busyNote){
  fileData = f;
  $('#fileName').textContent = f.name;
  if (busyNote){ $('#fileMeta').textContent = busyNote; }
  else if (f.text){ $('#fileMeta').textContent = '已抽取文本 ' + f.text.length + ' 字 · 可调用 DeepSeek 审查'; }
  else { $('#fileMeta').textContent = '大小 ' + f.size + ' · 已载入（未能抽取文字，可改粘贴全文）'; }
  $('#fileChip').classList.add('on');
  $('#scanBtn').disabled = false;
}
function clearFile(){
  fileData = null;
  $('#fileChip').classList.remove('on');
  $('#fileInput').value = '';
  $('#scanBtn').disabled = true;
}
function fileStatus(msg){
  var m = $('#fileMeta');
  if (m) m.textContent = msg;
}
var libCache = {};
function ensureLib(src){
  if (libCache[src]) return libCache[src];
  var pr = new Promise(function(res, rej){
    var s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = function(){ res(); };
    s.onerror = function(){ rej(new Error('解析库加载失败，请检查网络后重试')); };
    document.head.appendChild(s);
  });
  libCache[src] = pr;
  return pr;
}
function clipText(t, max){
  t = String(t || '').trim();
  if (t.length > max){ t = t.slice(0, max) + '\n……（文本过长已截断，仅分析前 ' + max + ' 字）'; }
  return t;
}
/* PDF：用 pdf.js 在浏览器本地抽取文字 */
function extractPdf(f){
  return ensureLib('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js').then(function(){
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    return f.arrayBuffer().then(function(buf){
      return window.pdfjsLib.getDocument({ data: buf }).promise.then(function(pdf){
        var jobs = [];
        for (var i = 1; i <= pdf.numPages; i++){
          jobs.push(pdf.getPage(i).then(function(page){
            return page.getTextContent().then(function(tc){
              return tc.items.map(function(it){ return it.str || ''; }).join(' ');
            });
          }));
        }
        return Promise.all(jobs).then(function(parts){
          var txt = parts.join('\n');
          if (String(txt).trim().length < 20) throw new Error('该 PDF 可能是扫描件（无文字层），请截图后上传图片识别，或粘贴全文');
          return clipText(txt, 12000);
        });
      });
    });
  });
}
/* Word(.docx)：用 mammoth 在浏览器本地抽取文字；旧版 .doc 不支持 */
function extractDocx(f){
  return ensureLib('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js').then(function(){
    return f.arrayBuffer().then(function(buf){
      return window.mammoth.extractRawText({ arrayBuffer: buf }).then(function(r){
        return clipText(r.value, 12000);
      });
    });
  });
}
/* 图片：用 Tesseract.js 本地 OCR 识别中文/英文 */
function extractImage(f){
  return ensureLib('https://cdn.jsdelivr.net/npm/tesseract.js@5.0.5/dist/tesseract.min.js').then(function(){
    return window.Tesseract.recognize(f, 'chi_sim+eng', {
      logger: function(m){
        if (m && m.status) fileStatus('🔍 OCR 识别中：' + m.status + (typeof m.progress === 'number' ? ' ' + Math.round(m.progress * 100) + '%' : ''));
      }
    }).then(function(res){ return clipText(res.data.text, 12000); });
  });
}
function withTimeout(p, ms, msg){
  return Promise.race([
    p,
    new Promise(function(res, rej){ setTimeout(function(){ rej(new Error(msg)); }, ms); })
  ]);
}
function pickFiles(files){
  var f = files && files[0];
  if (!f) return;
  var ext = (f.name.split('.').pop() || '').toLowerCase();
  if (ACCEPT.indexOf(ext) === -1){ toast('暂不支持该格式，请上传 PDF / Word / 图片 / TXT', false); return; }
  $('#contractText').value = '';
  $('#fileName').textContent = f.name;
  $('#fileChip').classList.add('on');
  $('#scanBtn').disabled = false;
  if (ext === 'txt' || ext === 'md'){
    fileStatus('读取文本中…');
    var rd = new FileReader();
    rd.onload = function(){ setFile({ name: f.name, size: fmtSize(f.size), text: String(rd.result || '') }); toast('已读取文本，可开始 AI 扫描', true); };
    rd.onerror = function(){ setFile({ name: f.name, size: fmtSize(f.size) }); toast('文本读取失败，请改为粘贴全文', false); };
    rd.readAsText(f, 'utf-8');
    return;
  }
  if (ext === 'doc'){
    setFile({ name: f.name, size: fmtSize(f.size) });
    toast('旧版 .doc 无法直接解析，请另存为 .docx，或粘贴全文后审查', false);
    return;
  }
  fileStatus(ext === 'pdf' ? '📄 正在解析 PDF（本地抽取文字）…'
    : ext === 'docx' ? '📝 正在解析 Word（本地抽取文字）…'
    : '🖼️ 正在 OCR 识别图片文字…（首次需下载识别模型）');
  var p = withTimeout(ext === 'pdf' ? extractPdf(f) : (ext === 'docx' ? extractDocx(f) : extractImage(f)), 90000, '解析超时（首次 OCR 需下载识别模型，请检查网络后重试）');
  p.then(function(text){
    setFile({ name: f.name, size: fmtSize(f.size), text: text });
    toast('已抽取合同文字，可开始 AI 扫描', true);
  }).catch(function(err){
    setFile({ name: f.name, size: fmtSize(f.size) });
    toast('解析失败：' + (err.message || err) + '；可粘贴全文后审查', false);
  });
}
function fmtSize(b){
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  return Math.max(1, Math.round(b / 1024)) + ' KB';
}

/* 上传区交互 */
var zone = $('#uploadZone');
zone.addEventListener('click', function(){ $('#fileInput').click(); });
zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.classList.add('drag'); });
zone.addEventListener('dragleave', function(){ zone.classList.remove('drag'); });
zone.addEventListener('drop', function(e){
  e.preventDefault(); zone.classList.remove('drag');
  pickFiles(e.dataTransfer.files);
});
$('#fileInput').addEventListener('change', function(){ pickFiles(this.files); });
$('#fileRemove').addEventListener('click', clearFile);
/* 示例合同入口已迁移为「📋 填入示例租房合同」（填充文本后调用 DeepSeek） */
/* scanBtn 点击统一由新逻辑绑定（DeepSeek 合同审查） */

/* ---------- 扫描动画（保留原有视觉） ---------- */
var stepEls = [];
function prepSteps(){
  stepEls = $$('#scanSteps .scan-step');
  stepEls.forEach(function(s){
    s.classList.remove('doing', 'done');
    s.querySelector('.st-ico').textContent = '•';
  });
}
function setStep(i, state){
  var s = stepEls[i];
  if (!s) return;
  s.classList.remove('doing', 'done');
  if (state === 'doing'){ s.classList.add('doing'); s.querySelector('.st-ico').textContent = '⟳'; }
  else if (state === 'done'){ s.classList.add('done'); s.querySelector('.st-ico').textContent = '✓'; }
}
function setBar(pct){
  $('#scanBar').style.width = pct + '%';
  $('#scanPct').textContent = pct + '%';
}

/* ---------- 合同示例（可填入文本区，便于现场演示） ---------- */
var SAMPLE_CONTRACT = '《房屋租赁合同（示例 · 大学生版）》\n' +
'出租方（甲方）：______  承租方（乙方）：______（在读大学生）\n' +
'第一条 房屋基本情况：甲方将位于昆明市呈贡区××小区×栋×室的房屋出租给乙方居住，建筑面积约 60 平方米。\n' +
'第二条 租期：自 2026 年 9 月 1 日至 2027 年 8 月 31 日。\n' +
'第三条 租金：每月租金 1800 元，押一付三，每季度首月 5 日前支付；续租时甲方可根据市场情况调整租金。\n' +
'第四条 押金：乙方签约当日支付押金 5400 元；退租时押金是否退还由甲方视房屋情况决定，扣除项目由甲方自行决定。\n' +
'第五条 费用：租赁期间水、电、燃气、物业费由乙方承担。\n' +
'第六条 违约责任：乙方提前退租须向甲方支付两个月租金作为违约金；甲方可因经营需要或房屋出售提前解除合同，无需另行补偿。\n' +
'第七条 维修责任：租赁期内房屋及设施故障由双方协商处理，维修费用由乙方先行垫付。\n' +
'第八条 转租：未经甲方书面同意，乙方不得转租、转借。\n' +
'第九条 使用：乙方应按约定用途使用房屋，不得从事违法活动。\n' +
'第十条 通知送达：双方可通过口头或微信沟通，通知以甲方收到为准。\n' +
'第十一条 争议解决：协商不成的，可向法院提起诉讼。\n' +
'第十二条 其他：本合同一式两份，双方各执一份，自签字之日起生效。\n' +
'甲方（签字）：______  乙方（签字）：______  日期：2026 年 9 月 1 日';

/* ---------- DeepSeek 配置读取（与 AI 助手共用 deepseek_cfg_v1） ---------- */
function dsOnline(){
  return FUZI_CFG && FUZI_CFG.mode === 'model' && (FUZI_CFG.key || '').trim() !== '';
}
function dsModelLabel(){ return (FUZI_CFG && FUZI_CFG.model) || 'deepseek-chat'; }
function dsConfiguredButOff(){ return !!(FUZI_CFG && (FUZI_CFG.key || '').trim()); }
function updateReviewStatus(){
  var el0 = $('#dsStatusLine');
  if (!el0) return;
  el0.className = 'ds-status';
  el0.innerHTML = '';
  if (dsOnline()){
    el0.classList.add('ok');
    el0.appendChild(document.createTextNode('🟢 DeepSeek 已连接 · ' + dsModelLabel()));
  } else if (dsConfiguredButOff()){
    el0.classList.add('warn');
    el0.appendChild(document.createTextNode('🟡 已填 Key 但未启用'));
    var b = document.createElement('button'); b.textContent = '去启用';
    b.addEventListener('click', function(){ showPage('page-ai'); openAiModal(); });
    el0.appendChild(b);
  } else {
    el0.classList.add('err');
    el0.appendChild(document.createTextNode('⚪ 未配置 DeepSeek'));
    var b2 = document.createElement('button'); b2.textContent = '去配置';
    b2.addEventListener('click', function(){ showPage('page-ai'); openAiModal(); });
    el0.appendChild(b2);
  }
}

/* ---------- 调用 DeepSeek（OpenAI 兼容 /chat/completions） ---------- */
function callDeepSeekChat(messages, done, fail){
  var ac = new AbortController();
  var timer = setTimeout(function(){ ac.abort(); }, 150000);
  var body = {
    model: (FUZI_CFG && FUZI_CFG.model) || 'deepseek-chat',
    messages: messages,
    temperature: 0.2,
    max_tokens: 12000,
    stream: false,
    response_format: { type: 'json_object' }
  };
  var attempt = 0;
  function request(){
    attempt++;
    fetch(fuziBase() + '/chat/completions', {
      method: 'POST', headers: buildHeaders(), body: JSON.stringify(body), signal: ac.signal
    }).then(function(r){
      if (!r.ok) return r.text().then(function(t){ throw new Error('HTTP ' + r.status + ' ' + String(t).slice(0, 120)); });
      return r.json();
    }).then(function(j){
      var content = dsContent(j);
      if (!content){
        /* finish_reason=length 说明是超长截断，重试无意义；其余偶发空输出自动重试一次 */
        if (dsFinishReason(j) !== 'length' && attempt < 2){ request(); return; }
        throw new Error(dsEmptyError(j));
      }
      clearTimeout(timer);
      done(content);
    }).catch(function(err){
      clearTimeout(timer);
      fail(err);
    });
  }
  request();
}
function extractJsonObj(text){
  var t = String(text || '');
  t = t.replace(/```(?:json)?/gi, '').trim();
  var s = t.indexOf('{'), e = t.lastIndexOf('}');
  if (s < 0 || e < 0) return null;
  try { return JSON.parse(t.slice(s, e + 1)); } catch(err){}
  return null;
}
/* 解析合同文本 → 结构化风险报告 */
function parseContractReport(content){
  var j = extractJsonObj(content);
  if (!j) throw new Error('无法解析模型返回的 JSON');
  var risks = Array.isArray(j.risks) ? j.risks : [];
  var lowTips = Array.isArray(j.low_tips) ? j.low_tips : [];
  var high = 0, mid = 0;
  risks.forEach(function(r){
    r.level = (r.level === 'high' || r.level === '高风险') ? 'high' : (r.level === 'mid' || r.level === '中风险') ? 'mid' : 'high';
    if (r.level === 'high') high++; else mid++;
  });
  var stats = j.stats || {};
  var h = (typeof stats.high === 'number') ? stats.high : high;
  var m = (typeof stats.mid === 'number') ? stats.mid : mid;
  var l = (typeof stats.low === 'number') ? stats.low : lowTips.length;
  var score = Math.max(0, Math.min(100, Math.round(Number(j.score) || 55)));
  return {
    score: score,
    level: (j.level === '低' || j.level === 'low') ? '低' : (j.level === '高' || j.level === 'high') ? '高' : '中',
    summary: String(j.summary || ''),
    high: h, mid: m, low: l,
    risks: risks,
    low_tips: lowTips
  };
}

/* ---------- 报告通用填充 ---------- */
function scoreColor(score){ return score >= 70 ? '#ef4444' : (score >= 45 ? '#f59e0b' : '#10b981'); }
function verdictText(score){
  return score >= 70 ? '🔴 高风险：建议修改后再签约'
    : (score >= 45 ? '🟠 中风险：建议修改后再签约' : '🟢 低风险：可签署，注意履约留痕');
}
function setCounts(h, m, l){
  var hc = $('#highCnt'), mc = $('#midCnt'), lc = $('#lowCnt'), lb = $('#lowCntBig');
  if (hc) hc.textContent = h; if (mc) mc.textContent = m; if (lc) lc.textContent = l;
  if (lb) lb.textContent = l + ' 处';
  $$('.f-btn').forEach(function(b){
    var n = (b.dataset.f === 'high') ? h : (b.dataset.f === 'mid') ? m : l;
    var icon = (b.dataset.f === 'high') ? '🔴' : (b.dataset.f === 'mid') ? '🟡' : '🟢';
    b.textContent = icon + ' ' + (b.dataset.f === 'high' ? '高风险' : b.dataset.f === 'mid' ? '中风险' : '低风险') + ' ' + n;
  });
}
function animateScore(score){
  var color = scoreColor(score);
  var bar = $('#gaugeBar');
  var len = 2 * Math.PI * 54;
  bar.style.strokeDasharray = len;
  bar.style.strokeDashoffset = len;
  bar.style.stroke = color;
  var num = $('#scoreNum'); num.textContent = '0';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ bar.style.strokeDashoffset = len * (1 - score / 100); });
  });
  var cur = 0;
  var t = setInterval(function(){
    cur += 2;
    if (cur >= score){ cur = score; clearInterval(t); }
    num.textContent = cur;
  }, 18);
}
function fillReportMeta(metaHtml, tagHtml, noteHtml, verdict){
  var m = $('#reportMeta'); if (m) m.innerHTML = metaHtml;
  var t = $('#reportTag'); if (t) t.innerHTML = tagHtml;
  var n = $('#reportNote'); if (n) n.innerHTML = noteHtml;
  var v = $('#scoreVerdict'); if (v){ v.textContent = verdict; v.className = 'verdict'; }
  var c = $('#scoreCopy'); if (c) c.textContent = '';
}
function renderRiskList(items){
  var wrap = $('#riskList');
  wrap.innerHTML = '';
  (items || []).forEach(function(it, i){
    var card = el('div', 'risk-card' + (it.level === 'high' && i === 0 ? ' open' : ''));
    card.dataset.level = it.level;
    var head = el('div', 'risk-head');
    head.appendChild(el('span', 'sev-dot ' + it.level));
    var tt = el('div', 'rh-t');
    tt.appendChild(el('b', null, (it.title || '风险条款')));
    tt.appendChild(el('span', null, (it.clause || '') + (it.level === 'high' ? ' · 必须修改' : ' · 建议修改')));
    head.appendChild(tt);
    head.appendChild(el('span', 'sev-tag ' + it.level, it.level === 'high' ? '🔴 高风险' : '🟡 中风险'));
    head.appendChild(el('span', 'caret', '▾'));
    card.appendChild(head);
    var body = el('div', 'risk-body');
    body.appendChild(rRow('reason', '风险原因', it.reason || ''));
    body.appendChild(rRow('fix', '修改建议', it.fix || ''));
    body.appendChild(rRow('law', '法律依据', it.law || ''));
    card.appendChild(body);
    head.addEventListener('click', function(){ card.classList.toggle('open'); });
    wrap.appendChild(card);
  });
}
function renderLowTips(tips){
  var wrap = $('#lowList');
  wrap.innerHTML = '';
  (tips || []).forEach(function(t){ wrap.appendChild(el('div', 'low-item', t)); });
  var lb = $('#lowBlock');
  lb.classList.remove('open');
  lb.style.display = (tips && tips.length) ? '' : 'none';
}

/* 报告阶段切换 */
function enterScanStage(){
  scanTimers.forEach(clearTimeout); scanTimers = [];
  $('#stage-upload').style.display = 'none';
  $('#stage-report').classList.remove('on');
  $('#stage-fail').style.display = 'none';
  $('#stage-scan').classList.add('on');
  prepSteps(); setBar(0);
}
function showReportStage(){
  $('#stage-scan').classList.remove('on');
  $('#stage-fail').style.display = 'none';
  $('#stage-report').classList.add('on');
  $('#stage-report').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------- 展示报告：DeepSeek 结果 ---------- */
function showReportAI(res){
  showReportStage();
  renderRiskList(res.risks);
  setCounts(res.high, res.mid, res.low);
  applyFilter('all');
  renderLowTips(res.low_tips);
  animateScore(res.score);
  var d = new Date();
  var ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  fillReportMeta(
    '由 DeepSeek（' + dsModelLabel() + '）云端分析生成 · ' + ds,
    '🤖 DeepSeek 审查完成',
    '* 风险评分与条款由 DeepSeek 依据合同文本生成，仅供学习参考；法律依据请以官方最新文本为准，重大事项请咨询执业律师或拨打 12348。',
    verdictText(res.score)
  );
  var cp = $('#scoreCopy');
  if (cp) cp.textContent = res.summary || 'AI 已完成风险扫描，建议优先修改高、中风险条款后再签署。';
}

/* ---------- 展示报告：离线演示（原模拟数据） ---------- */
function showReport(){
  /* 清空历史渲染，避免与 AI 报告叠加 */
  riskBuilt = false; lowBuilt = false;
  $('#riskList').innerHTML = '';
  $('#lowList').innerHTML = '';
  showReportStage();
  buildRiskCards();
  buildLowList();
  var h = RISK.filter(function(x){ return x.level === 'high'; }).length;
  var m = RISK.filter(function(x){ return x.level === 'mid'; }).length;
  var l = LOW_TIPS.length;
  setCounts(h, m, l);
  applyFilter('all');
  animateScore(72);
  var d = new Date();
  var ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  fillReportMeta(
    '已完成扫描 · 演示数据生成于 ' + ds,
    '✅ 审查完成（演示）',
    '* 演示报告基于示例租房合同模拟生成，仅展示关键条目；完整报告含全部 ' + (h + m + l) + ' 处提示。',
    '🟠 建议：修改后再签约'
  );
  var cp = $('#scoreCopy');
  if (cp) cp.textContent = '合同存在一定风险，建议优先修改高、中风险条款后再签署';
}

/* ---------- DeepSeek 真实分析 ---------- */
function analyzeWithDeepSeek(text){
  var sys = '你是「法护启航」AI 合同风险雷达内置的资深合同审阅助手（基于 DeepSeek）。' +
    '你的任务：对用户提供的合同文本做风险审查，输出合同综合风险评分与逐条风险条款。' +
    '输出要求：1) 只输出一个合法 JSON 对象，不要输出任何解释或 markdown 代码块；' +
    '2) 评分 score 为 0-100 的整数，越高代表风险越大；' +
    '3) 字段固定为：{"score":整数,"level":"低|中|高","summary":"一句话总体评价","high":整数,"mid":整数,"low":整数,"risks":[{"level":"high|mid","clause":"条款位置或原文摘录","title":"风险点短标题","reason":"风险原因","fix":"修改建议","law":"法律依据"}],"low_tips":["低风险优化建议字符串"]}；' +
    '4) 高、中风险合计不超过 8 条，低风险提示不超过 6 条；risks 的条数要与 high/mid 统计一致；' +
    '5) 法律依据引用中国大陆现行法律并写明条号；无法确认条号时写法律名称与原则并标注「建议人工核对」；' +
    '6) 面向在校大学生，语言简洁清楚，重点提示：违约金过高、押金、单方解除权、维修责任、费用、管辖、送达、空白条款等常见风险。';
  var msgs = [
    { role: 'system', content: sys },
    { role: 'user', content: '请审查下面这份合同，并按要求输出 JSON：\n\n' + text }
  ];
  return new Promise(function(resolve, reject){
    callDeepSeekChat(msgs, function(content){
      try { resolve(parseContractReport(content)); }
      catch (e){ reject(e); }
    }, reject);
  });
}

/* ---------- 扫描入口：文件 / 粘贴文本 / 示例 ---------- */
function currentContractText(){
  var t = $('#contractText').value.trim();
  if (t) return t;
  if (fileData && fileData.text) return String(fileData.text).trim();
  return '';
}
function startScan(){
  var text = currentContractText();
  enterScanStage();
  var st = $('#stage-scan .scan-title');
  var ss = $('#stage-scan .scan-sub');
  if (!text){
    showFailStage('未获取到可分析的合同文本：请粘贴合同全文，或重新上传 .txt / 可解析的文件。');
    return;
  }
  if (!dsOnline()){
    showFailStage(dsConfiguredButOff()
      ? '已填写 API Key，但尚未在「AI 助手 → ⚙️ 设置」中启用 DeepSeek 云端模型。\n请先在 AI 助手设置中把模式切换为 DeepSeek（云端模型）并保存。'
      : '尚未配置 DeepSeek：请先在「AI 助手 → ⚙️ 设置」填写 API Key 并选择 DeepSeek（云端模型）后，再执行审查。');
    return;
  }
  if (st) st.textContent = 'DeepSeek 云端风险扫描中……';
  if (ss) ss.textContent = '正在调用 DeepSeek 逐条比对条款与法律依据，请稍候（长合同可能需要 30~60 秒）';
  var per = [12, 30, 52, 76];
  per.forEach(function(p, i){
    scanTimers.push(setTimeout(function(){
      if (i > 0) setStep(i - 1, 'done');
      setStep(i, 'doing');
      setBar(p);
    }, 260 + i * 520));
  });
  analyzeWithDeepSeek(text).then(function(res){
    setStep(4, 'done');
    setBar(100);
    $('#scanPct').textContent = '100%';
    showReportAI(res);
  }).catch(function(err){
    setBar(100);
    showFailStage('DeepSeek 分析失败：' + (err.message || err) + '。\n请检查网络连接、API Key 与账户余额后点击「↻ 重新审查」；或先「🧪 查看离线演示报告」浏览展示效果。');
  });
}

/* ---------- 审查失败提示界面 ---------- */
function showFailStage(reason){
  scanTimers.forEach(clearTimeout); scanTimers = [];
  $('#stage-scan').classList.remove('on');
  $('#stage-report').classList.remove('on');
  $('#stage-upload').style.display = 'none';
  var fr = $('#failReason');
  if (fr) fr.textContent = reason || 'DeepSeek 未能完成本次合同审查，请稍后重试。';
  var box = $('#stage-fail');
  if (box) box.style.display = 'flex';
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
$('#failRetryBtn').addEventListener('click', startScan);
$('#failEditBtn').addEventListener('click', function(){
  $('#stage-fail').style.display = 'none';
  $('#stage-scan').classList.remove('on');
  $('#stage-report').classList.remove('on');
  $('#stage-upload').style.display = '';
  $('#stage-upload').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
$('#failDemoBtn').addEventListener('click', function(){
  toast('正在展示离线演示报告（非本次 DeepSeek 审查结果）', false);
  showReport();
});

/* ---------- 事件绑定（上传 / 粘贴 / 示例 / 报告操作） ---------- */
$('#scanBtn').addEventListener('click', function(){
  if (!fileData && !$('#contractText').value.trim()){ toast('请先选择文件，或粘贴合同全文', false); return; }
  startScan();
});
$('#txtScanBtn').addEventListener('click', function(){
  if (!$('#contractText').value.trim()){ toast('请先粘贴合同全文', false); return; }
  startScan();
});
$('#fillSampleBtn').addEventListener('click', function(){
  $('#contractText').value = SAMPLE_CONTRACT;
  $('#fileMeta').textContent = '示例合同已填入 · 文本约 ' + SAMPLE_CONTRACT.length + ' 字';
  toast(dsOnline() ? '示例合同已填入，点击「🚀 AI 文本审查」调用 DeepSeek' : '示例合同已填入（需先配置 DeepSeek 才能 AI 审查）', true);
});
$('#rescanBtn').addEventListener('click', function(){
  $('#stage-report').classList.remove('on');
  $('#stage-scan').classList.remove('on');
  $('#stage-fail').style.display = 'none';
  $('#stage-upload').style.display = '';
  clearFile();
  toast('已回到上传页，可重新扫描', false);
});
$('#exportBtn').addEventListener('click', function(){
  var items = $$('#riskList .risk-card');
  var txt = '【法护启航 · AI 合同风险审查报告】\n得分：' + $('#scoreNum').textContent + '/100\n\n';
  items.forEach(function(c){
    txt += '- ' + c.querySelector('.rh-t b').textContent + '\n';
  });
  var blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '法护启航-合同审查报告.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('审查报告已导出为文本', true);
});
$('#reportAiBtn').addEventListener('click', function(){
  askAI('我刚用 AI 合同审查扫了一份合同，高风险条款应该怎么改？');
});
/* 粘贴输入时允许直接回车进入审查（Ctrl+Enter） */
$('#contractText').addEventListener('keydown', function(e){
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); $('#txtScanBtn').click(); }
});

/* 页面状态刷新：进入合同审查页 / 初始加载时更新 DeepSeek 连接状态 */
updateReviewStatus();
$$('.nav-item').forEach(function(n){
  n.addEventListener('click', function(){
    if (n.dataset.page === 'page-review') setTimeout(updateReviewStatus, 30);
  });
});/* =========================================================
   我的权益：证据材料真实上传并保存（浏览器 localStorage）
   ---------------------------------------------------------
   - 文件以 Base64 保存在浏览器 localStorage，刷新/重开不丢失
   - 不上传任何服务器；列表支持 打开/下载 与 删除
   - 演示级容量：单份 ≤ 2MB、总量约 ≤ 4MB（超出请压缩或只传关键截图）
   ========================================================= */
var EV_KEY = 'fahq_evidence_v1';
var EV_MAX_FILE = 2 * 1024 * 1024;
function evReadAll(){
  try { var a = JSON.parse(localStorage.getItem(EV_KEY) || '[]'); return Array.isArray(a) ? a : []; }
  catch (e){ return []; }
}
function evWriteAll(list){ localStorage.setItem(EV_KEY, JSON.stringify(list)); }
function evFileToDataUrl(file){
  return new Promise(function(res, rej){
    var rd = new FileReader();
    rd.onload = function(){ res(String(rd.result || '')); };
    rd.onerror = function(){ rej(rd.error); };
    rd.readAsDataURL(file);
  });
}
function evUsedBytes(){ return evReadAll().reduce(function(s, x){ return s + String(x.data || '').length; }, 0); }
function evIcon(rec){
  var cat = rec.category || '';
  if (/聊天/.test(cat)) return '💬';
  if (/转账|工资|流水/.test(cat)) return '💰';
  if (/合同|协议/.test(cat)) return '📄';
  if (/照片|视频/.test(cat)) return '📸';
  if (/录音/.test(cat)) return '🎙️';
  var n = (rec.name || '').toLowerCase();
  if (/\.(jpe?g|png|webp|gif)$/.test(n)) return '📸';
  if (/\.pdf$/.test(n)) return '📄';
  if (/\.(docx?|txt|md)$/.test(n)) return '📝';
  if (/\.(xls[x]?|csv)$/.test(n)) return '🧮';
  if (/\.(zip|rar|7z)$/.test(n)) return '🗜️';
  if (/\.(mp3|m4a|wav)$/.test(n)) return '🎙️';
  if (/\.(mp4|mov)$/.test(n)) return '🎬';
  return '🗂️';
}
function evFmtSize(b){
  if (b > 1024 * 1024) return (b / 1024 / 1024).toFixed(1) + ' MB';
  if (b > 1024) return (b / 1024).toFixed(1) + ' KB';
  return (b || 0) + ' B';
}
function evFmtDate(iso){
  var d = new Date(iso);
  if (isNaN(d)) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function updateArchive(n){
  var pct = Math.max(0, Math.min(100, 62 + n * 6));
  var b = $('#page-rights .pf-score b');
  var bar = $('#page-rights .pf-bar i');
  if (b) b.innerHTML = pct + '<small style="font-size:16px">%</small>';
  if (bar) bar.style.width = pct + '%';
}
function renderEvList(list){
  hideEvChain();
  var grid = $('#evGrid');
  var empty = $('#evEmpty');
  var cnt = $('#evCount');
  grid.innerHTML = '';
  list.sort(function(a, b){ return String(b.savedAt || '').localeCompare(String(a.savedAt || '')); });
  if (cnt) cnt.textContent = list.length;
  if (!list.length){ if (empty) empty.style.display = 'block'; updateArchive(0); return; }
  if (empty) empty.style.display = 'none';
  list.forEach(function(rec){
    var card = el('div', 'ev-card');
    card.appendChild(el('span', 'e-ico', evIcon(rec)));
    var copy = el('div', 'e-copy');
    copy.appendChild(el('b', null, rec.name || '未命名材料'));
    var meta = (evFmtDate(rec.savedAt) || '刚刚') + ' 上传 · ' + (rec.category || '其他') + ' · ' + evFmtSize(rec.size);
    copy.appendChild(el('span', null, meta));
    if (rec.note) copy.appendChild(el('div', 'ev-note-line', '✏️ ' + rec.note));
    card.appendChild(copy);
    card.appendChild(el('span', 'e-st', '已保存'));
    var acts = el('div', 'ev-actions');
    var openB = el('button', 'ev-mini', '👁 打开');
    openB.addEventListener('click', function(){ evOpenRec(rec); });
    var delB = el('button', 'ev-mini danger', '🗑 删除');
    delB.addEventListener('click', function(){ evAskDelete(rec); });
    acts.appendChild(openB); acts.appendChild(delB);
    card.appendChild(acts);
    grid.appendChild(card);
  });
  updateArchive(list.length);
}
function evOpenRec(rec){
  if (!rec || !rec.data){ toast('文件内容不可用', false); return; }
  var n = (rec.name || '').toLowerCase();
  var preview = /^data:image\//.test(rec.data) || /^data:application\/pdf/.test(rec.data);
  if (preview){ window.open(rec.data, '_blank'); }
  else {
    var a = document.createElement('a');
    a.href = rec.data; a.download = rec.name || 'evidence';
    document.body.appendChild(a); a.click(); a.remove();
  }
}
function evAskDelete(rec){
  if (!confirm('删除「' + (rec.name || '该材料') + '」？删除后仅本机无法恢复。')) return;
  var list = evReadAll().filter(function(x){ return x.id !== rec.id; });
  try { evWriteAll(list); } catch (e){ toast('删除失败：' + e.message, false); return; }
  renderEvList(list);
  toast('已删除该份证据材料', true);
}
/* 待保存清单 UI */
function showEvForm(){
  $('#evForm').style.display = 'block';
  $('#evAddBtn').style.display = 'none';
  $('#evPendingCount').textContent = evPending.length;
  var box = $('#evPending'); box.innerHTML = '';
  evPending.forEach(function(p, i){
    var row = el('div', 'ev-pi');
    row.appendChild(el('span', 'pi-ico', evIcon({ name: p.file.name, category: $('#evCat').value })));
    var c = el('div', 'pi-copy');
    c.appendChild(el('b', null, p.file.name));
    c.appendChild(el('span', null, evFmtSize(p.file.size)));
    row.appendChild(c);
    var x = el('button', 'pi-x', '✕');
    x.addEventListener('click', function(){
      evPending.splice(i, 1);
      if (!evPending.length){ hideEvForm(); return; }
      showEvForm();
    });
    row.appendChild(x);
    box.appendChild(row);
  });
  $('#evForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function hideEvForm(){
  evPending = [];
  $('#evForm').style.display = 'none';
  $('#evAddBtn').style.display = '';
  $('#evPending').innerHTML = '';
  $('#evFiles').value = '';
}
var evPending = [];

$('#evAddBtn').addEventListener('click', function(){ $('#evFiles').click(); });
$('#evFiles').addEventListener('change', function(){
  var files = Array.prototype.slice.call(this.files || []);
  if (!files.length) return;
  var skipped = 0;
  files.forEach(function(f){
    if (f.size > EV_MAX_FILE){ skipped++; return; }
    evPending.push({ file: f });
  });
  if (skipped) toast('已跳过 ' + skipped + ' 份超过 2MB 的文件（演示容量限制）', false);
  if (!evPending.length){ $('#evFiles').value = ''; return; }
  showEvForm();
});
$('#evSaveBtn').addEventListener('click', function(){
  if (!evPending.length){ toast('还没有选择要保存的文件', false); return; }
  var cat = $('#evCat').value;
  var note = $('#evNote').value.trim();
  var toSave = evPending.slice();
  var dataUrls = [];
  var chain = Promise.resolve();
  toSave.forEach(function(p){
    chain = chain.then(function(){ return evFileToDataUrl(p.file).then(function(d){ dataUrls.push(d); }); });
  });
  chain.then(function(){
    if (evUsedBytes() + dataUrls.reduce(function(s, d){ return s + d.length; }, 0) > 6 * 1024 * 1024){
      throw { quota: true };
    }
    var cur = evReadAll();
    var base = Date.now();
    toSave.forEach(function(p, i){
      cur.push({
        id: base + '-' + i + '-' + Math.random().toString(36).slice(2, 8),
        name: p.file.name,
        category: cat,
        note: note,
        mime: p.file.type || '',
        size: p.file.size,
        savedAt: new Date().toISOString(),
        data: dataUrls[i]
      });
    });
    try { evWriteAll(cur); } catch (e){ throw { quota: true }; }
    hideEvForm();
    toast('已保存 ' + toSave.length + ' 份证据材料到本机', true);
    renderEvList(evReadAll());
  }).catch(function(err){
    if (err && err.quota){ toast('本机存储空间不足：总量请控制在约 4MB 内，或压缩/裁剪文件后重试', false); return; }
    toast('保存失败：' + ((err && err.message) || err), false);
  });
});
$('#evCancelBtn').addEventListener('click', hideEvForm);

/* 法援通道（演示） */
$('#callBtn').addEventListener('click', function(){ toast('正在呼叫 12348 …（演示环境不真实拨打）', false); });
$('#clinicBtn').addEventListener('click', function(){ toast('已定位最近的「高校法律援助中心」（演示）', true); });

/* 初始化：读取已保存证据 */
renderEvList(evReadAll());
/* ---------- 证据链：汇总与生成 ---------- */
var CHAIN_KEYS = [
  { k: 'contract', label: '合同 / 协议', match: ['合同'], icon: '📄' },
  { k: 'chat', label: '聊天记录', match: ['聊天记录'], icon: '💬' },
  { k: 'pay', label: '转账 / 支付凭证', match: ['转账/工资'], icon: '💰' },
  { k: 'photo', label: '现场照片 / 视频', match: ['照片/视频'], icon: '📸' },
  { k: 'audio', label: '录音 / 沟通记录', match: ['录音'], icon: '🎙️' },
  { k: 'other', label: '身份 / 其他补充', match: ['其他'], icon: '🗂️' }
];
function hideEvChain(){
  var p = $('#evChainPanel');
  if (p) p.style.display = 'none';
}
function evDtFmt(iso){
  var d = new Date(iso);
  if (isNaN(d)) return '';
  var p = function(x){ return String(x).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}
function evChainData(list){
  var sorted = list.slice().sort(function(a, b){ return String(a.savedAt || '').localeCompare(String(b.savedAt || '')); });
  var cov = CHAIN_KEYS.map(function(key){
    var hit = sorted.some(function(rec){ return key.match.indexOf(rec.category || '') >= 0; });
    return { key: key, hit: hit };
  });
  var covered = cov.filter(function(x){ return x.hit; }).length;
  var span = '';
  if (sorted.length === 1) span = '单份';
  else if (sorted.length > 1){
    var f = new Date(sorted[0].savedAt), l = new Date(sorted[sorted.length - 1].savedAt);
    var days = Math.max(1, Math.round((l - f) / 86400000));
    span = (evFmtDate(sorted[0].savedAt) || '') + ' → ' + (evFmtDate(sorted[sorted.length - 1].savedAt) || '') + '（' + days + ' 天）';
  } else span = '暂无';
  return { list: sorted, cov: cov, covered: covered, total: 6, score: Math.round(covered / CHAIN_KEYS.length * 100), span: span };
}
function evChainRender(){
  var list = evReadAll();
  var box = $('#evChainPanel');
  if (!list.length){ toast('还没有证据材料，请先上传后再生成证据链', false); return; }
  var d = evChainData(list);
  $('#chainStat').textContent = list.length + ' 份 · ' + d.covered + ' 类';
  $('#chainScore').textContent = d.score + '%';
  $('#chainSpan').textContent = d.span;
  $('#chainCovTxt').textContent = d.covered + ' / ' + d.total;
  var bar = $('#chainCovBar'); bar.style.width = d.score + '%';
  var tags = $('#chainCovTags'); tags.innerHTML = '';
  d.cov.forEach(function(c){
    var t = el('span', 'cc-tag ' + (c.hit ? 'on' : 'off'), c.key.icon + ' ' + c.key.label);
    tags.appendChild(t);
  });
  /* 时间线 */
  var tl = $('#chainTimeline'); tl.innerHTML = '';
  d.list.forEach(function(rec, i){
    var st = el('div', 'chain-step');
    st.appendChild(el('span', 'cs-dot'));
    st.appendChild(el('span', 'cs-no', String(i + 1).padStart(2, '0')));
    st.appendChild(el('span', 'cs-ico', evIcon(rec)));
    var b = el('div', 'cs-body');
    b.appendChild(el('b', null, rec.name || '未命名材料'));
    var meta = (evDtFmt(rec.savedAt) || '刚刚') + ' · ' + (rec.category || '其他') + ' · ' + evFmtSize(rec.size);
    if (rec.note) meta += ' · 备注：' + rec.note;
    b.appendChild(el('span', null, meta));
    st.appendChild(b);
    tl.appendChild(st);
  });
  /* 叙述 */
  var narr = '基于你保存的 ' + list.length + ' 份材料，按时间先后整理出如下证据链：\n';
  d.list.forEach(function(rec, i){
    narr += (i + 1) + ') ' + (evDtFmt(rec.savedAt) || '时间待补') + '，上传「' + (rec.name || '材料') + '」（' + (rec.category || '其他') + '）' + (rec.note ? '，备注：' + rec.note : '') + '\n';
  });
  narr += '上述环节按时间连续衔接，共同指向同一纠纷事实；建议对照原件逐份核验，并保留平台原始记录，以增强证明力。';
  $('#chainNarrative').textContent = narr;
  /* 缺失项 */
  var miss = d.cov.filter(function(c){ return !c.hit; }).map(function(c){ return c.key.icon + ' ' + c.key.label; });
  var mBox = $('#chainMissing');
  if (miss.length){
    mBox.style.display = '';
    mBox.textContent = '⚠️ 建议补充以下关键材料以闭合证据链：' + miss.join('、') + '。';
  } else {
    mBox.style.display = 'none';
  }
  box.style.display = 'block';
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function evChainText(){
  var list = evReadAll();
  if (!list.length) return '';
  var d = evChainData(list);
  var lines = [];
  lines.push('【法护启航 · 证据链汇总】');
  lines.push('材料数量：' + list.length + ' 份 ｜ 覆盖类别：' + d.covered + '/' + d.total);
  lines.push('证据链完整度：' + d.score + '% ｜ 时间跨度：' + d.span);
  lines.push('');
  lines.push('—— 时间线 ——');
  d.list.forEach(function(rec, i){
    lines.push((i + 1) + '. ' + (evDtFmt(rec.savedAt) || '时间待补') + '｜' + (rec.category || '其他') + '｜' + (rec.name || '未命名') + (rec.note ? '｜备注：' + rec.note : '') + '｜' + evFmtSize(rec.size));
  });
  lines.push('');
  lines.push('—— 覆盖检查 ——');
  d.cov.forEach(function(c){ lines.push((c.hit ? '[已覆盖] ' : '[缺失]   ') + c.key.icon + ' ' + c.key.label); });
  lines.push('');
  lines.push('注：证据链仅基于本机已保存材料生成，用于梳理与演示；正式维权请保留原件并咨询 12348。');
  return lines.join('\n');
}
function evChainDownload(){
  var txt = evChainText();
  if (!txt){ toast('还没有证据材料，无法导出', false); return; }
  var blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '法护启航-证据链汇总.txt';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){ URL.revokeObjectURL(a.href); }, 20000);
  toast('证据链文本已导出', true);
}
$('#evChainBtn').addEventListener('click', evChainRender);
$('#evExportTxtBtn').addEventListener('click', evChainDownload);
/* =========================================================
   我的权益：真实信息登录（档案存于本机 localStorage）
   ========================================================= */
var PROFILE_KEY = 'fahq_profile_v1';
var SESSION_KEY = 'fahq_session_v1';
function rlHash(t){
  var h = 5381, i, c = String(t == null ? '' : t);
  for (i = 0; i < c.length; i++){ h = (((h << 5) + h) ^ c.charCodeAt(i)) & 0x7fffffff; }
  return 'h' + h.toString(16);
}
function rlGetProfile(){ try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null'); } catch (e){ return null; } }
function rlSaveProfile(p){ localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }
function rlGetSession(){ try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e){ return null; } }
function rlSetSession(s){ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function rlClearSession(){ localStorage.removeItem(SESSION_KEY); }
function rlLoggedIn(){
  var p = rlGetProfile(), s = rlGetSession();
  return !!(p && s && p.sid === s.sid);
}
function rlFillProfile(){
  var p = rlGetProfile();
  if (!p) return;
  var nm = $('#pfName'); if (nm) nm.textContent = p.name + '，你好 👋';
  var rt = $('#pfRoleTag'); if (rt) rt.textContent = p.role || '应届毕业生';
  var sd = $('#pfSid'); if (sd) sd.textContent = p.sid || '—';
  var sc = $('#pfSchool'); if (sc) sc.textContent = p.school || '—';
  var d = new Date();
  var today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  var ex = $('#pfExtra'); if (ex) ex.textContent = '毕业城市：昆明 · 档案最近更新：' + today;
}
function rlApplyState(){
  var ok = rlLoggedIn();
  var lg = $('#rightsLogin'), ct = $('#rightsContent');
  if (lg) lg.style.display = ok ? 'none' : 'block';
  if (ct) ct.style.display = ok ? 'block' : 'none';
  if (ok) rlFillProfile();
  var tabs = $$('.rl-tabs button');
  tabs.forEach(function(b){ b.classList.remove('on'); });
  var hasProfile = !!rlGetProfile();
  rlSetMode(hasProfile ? 'login' : 'reg');
}
function rlSetMode(view){
  var lgTab = $('#rlTabLogin'), rgTab = $('#rlTabReg');
  var lv = $('#rlLoginView'), rv = $('#rlRegView');
  if (!lgTab || !lv) return;
  lgTab.classList.toggle('on', view === 'login');
  rgTab.classList.toggle('on', view === 'reg');
  lv.style.display = view === 'login' ? 'grid' : 'none';
  rv.style.display = view === 'reg' ? 'grid' : 'none';
}
$('#rlTabLogin').addEventListener('click', function(){ rlSetMode('login'); });
$('#rlTabReg').addEventListener('click', function(){ rlSetMode('reg'); });
$('#rlRegReset').addEventListener('click', function(){
  ['rlName', 'rlSchool', 'rlSid', 'rlPwd', 'rlPwd2'].forEach(function(id){ $('#' + id).value = ''; });
  $('#rlRole').selectedIndex = 0;
});
$('#rlRegBtn').addEventListener('click', function(){
  var name = $('#rlName').value.trim();
  var school = $('#rlSchool').value.trim();
  var sid = $('#rlSid').value.trim();
  var role = $('#rlRole').value;
  var pwd = $('#rlPwd').value;
  var pwd2 = $('#rlPwd2').value;
  if (rlGetProfile()){ toast('本浏览器已存在真实档案，请使用「🔑 登录」；如需更换请先清除本机档案', false); rlSetMode('login'); return; }
  if (name.length < 2){ toast('请填写真实姓名（至少 2 个字）', false); return; }
  if (!school){ toast('请填写所在高校', false); return; }
  if (!/^[A-Za-z0-9_-]{4,}$/.test(sid)){ toast('请填写有效的学号 / 工号（字母数字 4 位以上）', false); return; }
  if (pwd.length < 6){ toast('密码至少 6 位', false); return; }
  if (pwd !== pwd2){ toast('两次输入的密码不一致', false); return; }
  var p = { name: name, school: school, sid: sid, role: role, pwdHash: rlHash(pwd), createdAt: new Date().toISOString() };
  try { rlSaveProfile(p); } catch (e){ toast('本机存储失败：' + e.message, false); return; }
  rlSetSession({ sid: sid, name: name, at: new Date().toISOString() });
  rlApplyState();
  toast('录入成功，已登录：' + name, true);
});
$('#rlLoginBtn').addEventListener('click', function(){
  var p = rlGetProfile();
  if (!p){ toast('还没有档案，请切换到「首次录入 / 注册」', false); return; }
  var sid = $('#rlSidLogin').value.trim();
  var pwd = $('#rlPwdLogin').value;
  if (sid !== p.sid){ toast('学号不存在或输入有误', false); return; }
  if (rlHash(pwd) !== p.pwdHash){ toast('密码错误，请重试', false); return; }
  rlSetSession({ sid: p.sid, name: p.name, at: new Date().toISOString() });
  rlApplyState();
  toast('登录成功，欢迎回来：' + p.name, true);
});
$('#pfLogoutBtn').addEventListener('click', function(){
  if (!confirm('确定退出登录吗？档案仍保存在本机，可再次用学号 + 密码登录。')) return;
  rlClearSession();
  rlApplyState();
  toast('已退出登录', false);
});
rlApplyState();




/* 默认回到首页 / 初始化报告区默认状态（showPage 为全站唯一定义，见文件前部） */
showPage('page-home');
clearFile();

/* =========================================================
   风险地图（功能演示版）—— MAP_DATA 即数据源
   接入真实数据时：仅需替换 MAP_DATA / TYPE_META，其余逻辑不变
   ========================================================= */
var TYPE_META = {
  rent:    { label: '租房',      emoji: '🏠', rgb: '239,68,68' },
  job:     { label: '兼职/就业', emoji: '💼', rgb: '245,158,11' },
  consume: { label: '消费/培训', emoji: '🧾', rgb: '16,185,129' },
  person:  { label: '人身/其他', emoji: '👥', rgb: '139,92,246' }
};
var MAP_DATA = [
  { id: 'ynu', name: '云南大学片区', zone: '呈贡大学城 · 云南大学（中心片区）', x: 46, y: 36, trend: +10,
    counts: { rent: 170, job: 55, consume: 75, person: 28 },
    samples: [ '毕业季退租，房东以「墙面有污渍」为由扣留全部押金 2,000 元', '校园周边租房合同违约金过高，提前退租被索要两个月租金' ],
    aiQ: '房东扣押金、合同违约金太高，我该怎么办？' },
  { id: 'kust', name: '昆明理工片区', zone: '呈贡大学城 · 昆明理工大学呈贡校区', x: 68, y: 24, trend: +18,
    counts: { rent: 30, job: 130, consume: 40, person: 15 },
    samples: [ '在某科技公司实习 2 个月，离职后 4,200 元报酬未结', '参与校外项目外包，口头约定报酬被以「没签合同」拒付' ],
    aiQ: '实习 / 兼职被拖欠工资，我该怎么办？' },
  { id: 'ynnu', name: '云南师大片区', zone: '呈贡大学城 · 云南师范大学', x: 18, y: 26, trend: +6,
    counts: { rent: 35, job: 45, consume: 115, person: 12 },
    samples: [ '报名教资培训 1.2 万元，机构停课后拒绝退费', '「包过班」宣传与实际不符，要求退款一直被拖延' ],
    aiQ: '培训机构不退费合法吗？我该怎么办？' },
  { id: 'ynmz', name: '民大 · 医大片区', zone: '呈贡大学城 · 云南民族大学 / 昆明医科大学', x: 55, y: 62, trend: -4,
    counts: { rent: 45, job: 30, consume: 90, person: 20 },
    samples: [ '被诱导办理美容分期，事后才发现是高息消费贷', '网上「刷单返利」兼职被骗 1,500 元' ],
    aiQ: '我被诱导办理消费分期 / 刷单被骗，能追回吗？' },
  { id: 'yx', name: '雨花校外公寓带', zone: '呈贡区雨花街道 · 校外公寓带', x: 82, y: 50, trend: +12,
    counts: { rent: 150, job: 25, consume: 30, person: 25 },
    samples: [ '二房东转租后失联，「押一付三」5,400 元难追回', '退租时被以「清洁费」名义扣 800 元，合同中并无依据' ],
    aiQ: '二房东跑路、押金不退，我该怎么办？' },
  { id: 'yart', name: '云艺 · 中医大片区', zone: '呈贡大学城 · 云南艺术学院 / 云南中医药大学', x: 26, y: 74, trend: +5,
    counts: { rent: 25, job: 30, consume: 60, person: 55 },
    samples: [ '参加商演兼职，主办方以「劳务关系」为由拖欠尾款', '画室培训中途退学，协商退费无果' ],
    aiQ: '兼职劳务费被拖欠、培训退费难，怎么办？' }
];

var mapState = { activeType: 'all', heatOn: true, selId: null };
var MAP_TOTAL_BASE = 1335; // 参考值，界面数字以数据实时求和为准

function fmtN(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function two(n){ return (n < 10 ? '0' : '') + n; }
function nowStr(){ var d = new Date(); return two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
function hTotal(h){ return h.counts.rent + h.counts.job + h.counts.consume + h.counts.person; }
function hTypeCount(h, t){ return t === 'all' ? hTotal(h) : (h.counts[t] || 0); }
function topType(h){
  var best = 'rent', bv = -1;
  Object.keys(TYPE_META).forEach(function(k){
    if (h.counts[k] > bv){ bv = h.counts[k]; best = k; }
  });
  return best;
}
function typeTotals(){
  var t = { rent: 0, job: 0, consume: 0, person: 0 };
  MAP_DATA.forEach(function(h){ Object.keys(t).forEach(function(k){ t[k] += h.counts[k]; }); });
  return t;
}

/* ---------- 顶层指标 + 类型占比条 ---------- */
function renderStatsAndBar(){
  var tt = typeTotals();
  var sum = tt.rent + tt.job + tt.consume + tt.person;
  $('#stTotal').textContent = fmtN(sum);
  var dom = Object.keys(tt).slice().sort(function(a, b){ return tt[b] - tt[a]; })[0];
  $('#stTop').textContent = TYPE_META[dom].label + '纠纷';
  $('#stTopSub').textContent = '高发类型 · 占比 ' + Math.round(tt[dom] / sum * 100) + '%';
  /* 占比条 + 图例 */
  var bar = $('#typeBar'); bar.innerHTML = '';
  var leg = $('#tbLegend'); leg.innerHTML = '';
  Object.keys(TYPE_META).forEach(function(k){
    var pct = tt[k] / sum * 100;
    var seg = el('i'); seg.style.width = pct + '%'; seg.style.background = 'rgb(' + TYPE_META[k].rgb + ')';
    bar.appendChild(seg);
    var s = el('span', null, '<i style="background:rgb(' + TYPE_META[k].rgb + ')"></i>' +
      TYPE_META[k].label + ' ' + Math.round(pct) + '%');
    leg.appendChild(s);
  });
  $('#tbCap').textContent = mapState.activeType === 'all'
    ? '本月类型占比（总计 ' + fmtN(sum) + ' 起）'
    : '正在查看：' + TYPE_META[mapState.activeType].label + '纠纷';
}

/* ---------- 地图热点 + 热力 ---------- */
function renderHeat(){
  var layer = $('#heatLayer'); layer.innerHTML = '';
  layer.classList.toggle('off', !mapState.heatOn);
  MAP_DATA.forEach(function(h){
    var cnt = hTypeCount(h, mapState.activeType);
    if (cnt <= 0) return;
    var dom = mapState.activeType === 'all' ? topType(h) : mapState.activeType;
    var size = 90 + cnt * 0.6;
    var b = el('div', 'blob');
    b.style.left = h.x + '%'; b.style.top = h.y + '%';
    b.style.width = size + 'px'; b.style.height = size + 'px';
    b.style.background = 'radial-gradient(circle, rgba(' + TYPE_META[dom].rgb + ',.38) 0%, rgba(' +
      TYPE_META[dom].rgb + ',.14) 52%, transparent 72%)';
    layer.appendChild(b);
  });
}
function renderPins(){
  var layer = $('#pinLayer'); layer.innerHTML = '';
  var shown = 0, sumCnt = 0;
  MAP_DATA.forEach(function(h){
    var cnt = hTypeCount(h, mapState.activeType);
    if (cnt <= 0) return;
    shown++; sumCnt += cnt;
    var dom = mapState.activeType === 'all' ? topType(h) : mapState.activeType;
    var node = el('div', 'pin-node' + (mapState.selId === h.id ? ' sel' : ''));
    node.style.left = h.x + '%'; node.style.top = h.y + '%';
    var orb = el('div', 'pin-orb c-' + dom, TYPE_META[dom].emoji);
    node.appendChild(orb);
    node.appendChild(el('span', 'pin-cnt', fmtN(cnt)));
    node.title = h.name + ' · ' + TYPE_META[dom].label + ' ' + fmtN(cnt) + ' 起';
    node.addEventListener('click', function(){ selectPin(h.id); });
    layer.appendChild(node);
  });
  $('#mapEmpty').style.display = shown ? 'none' : 'flex';
  return shown;
}

/* ---------- 右侧面板 ---------- */
function renderBars(rows){
  var box = el('div');
  rows.forEach(function(r){
    var row = el('div', 'mbar');
    row.appendChild(el('span', 'mb-lbl', r.label));
    var tr = el('div', 'mb-track'); var i = el('i');
    i.style.width = r.pct + '%'; i.style.background = r.color;
    tr.appendChild(i); row.appendChild(tr);
    row.appendChild(el('span', 'mb-num', r.num));
    box.appendChild(row);
  });
  return box;
}
function renderOverview(){
  var panel = $('#detailPanel'); panel.innerHTML = '';
  panel.appendChild(el('div', 'dp-back', '← 返回片区总览')).style.display = 'none';
  var head = el('div', 'dp-head');
  head.appendChild(el('span', 'dp-ico', '📊'));
  var hh = el('div'); hh.appendChild(el('h4', null, '片区总览'));
  hh.appendChild(el('div', 'dp-sub', '高校周边纠纷驾驶舱 · 更新时间 ' + nowStr()));
  head.appendChild(hh);
  panel.appendChild(head);

  var tt = typeTotals(); var sum = tt.rent + tt.job + tt.consume + tt.person;
  if (mapState.activeType === 'all'){
    var b1 = el('div', 'dp-block');
    b1.appendChild(el('h5', null, '📌 本月纠纷类型分布'));
    b1.appendChild(renderBars(Object.keys(TYPE_META).map(function(k){
      return { label: TYPE_META[k].label, num: fmtN(tt[k]), pct: Math.round(tt[k] / sum * 100),
        color: 'rgb(' + TYPE_META[k].rgb + ')' };
    })));
    panel.appendChild(b1);
    var b2 = el('div', 'dp-block');
    b2.appendChild(el('h5', null, '🏆 纠纷高发片区 Top3'));
    b2.appendChild(renderRank(TYPE_META, 'all', 'total'));
    panel.appendChild(b2);
  } else {
    var k = mapState.activeType;
    var tsum = tt[k];
    var b1 = el('div', 'dp-block');
    b1.appendChild(el('h5', null, TYPE_META[k].emoji + ' 「' + TYPE_META[k].label + '」纠纷 · Top3 片区'));
    b1.appendChild(renderRank(TYPE_META, k, k));
    panel.appendChild(b1);
    panel.appendChild(el('div', 'dp-block',
      '<h5>💡 维权提示</h5><div class="guide-li">签约 / 缴费前先核验对方主体资质，保留宣传与承诺截图</div>' +
      '<div class="guide-li">发生纠纷先固定证据，再通过平台、12315 / 12333 或 12348 逐级投诉</div>' +
      '<div class="dp-note" style="margin-top:8px">当前筛选命中 ' + tsum + ' 起（演示数据）</div>'));
  }
  panel.appendChild(el('div', 'dp-note', '💡 点击左侧地图热点，可查看该片区的典型案例、类型构成与维权指引（演示）。'));
}
function renderRank(meta, key, countKey){
  var wrap = el('div');
  var sorted = MAP_DATA.slice().sort(function(a, b){
    return hTypeCount(b, countKey) - hTypeCount(a, countKey);
  });
  sorted.slice(0, 3).forEach(function(h, idx){
    var row = el('div', 'rank-row');
    row.appendChild(el('span', 'rk', String(idx + 1)));
    row.appendChild(el('span', 'rk-name', h.name));
    row.appendChild(el('span', 'rk-num', fmtN(hTypeCount(h, countKey)) + ' 起'));
    row.addEventListener('click', function(){ selectPin(h.id); });
    wrap.appendChild(row);
  });
  return wrap;
}
function riskPill(h){
  var t = hTotal(h);
  if (t >= 220) return { txt: '🔴 高发片区', cls: 'hot' };
  if (t >= 150) return { txt: '🟠 关注片区', cls: 'watch' };
  return { txt: '🟢 相对平稳', cls: 'ok' };
}
function renderPinDetail(id){
  var h = MAP_DATA.filter(function(x){ return x.id === id; })[0];
  if (!h){ renderOverview(); return; }
  var panel = $('#detailPanel'); panel.innerHTML = '';
  var back = el('button', 'dp-back', '← 返回片区总览');
  back.addEventListener('click', function(){ mapState.selId = null; renderOverview(); });
  panel.appendChild(back);
  var head = el('div', 'dp-head');
  head.appendChild(el('span', 'dp-ico', '📍'));
  var hh = el('div');
  hh.appendChild(el('h4', null, h.name));
  hh.appendChild(el('div', 'dp-sub', h.zone + ' · 更新 ' + nowStr()));
  head.appendChild(hh);
  panel.appendChild(head);

  var rp = riskPill(h);
  var sub2 = el('div', 'dp-sub');
  sub2.appendChild(el('span', 'risk-pill ' + rp.cls, rp.txt));
  sub2.appendChild(el('span', null, ' 环比 ' + (h.trend > 0 ? '▲ +' + h.trend : '▼ ' + Math.abs(h.trend)) + '%'));
  panel.appendChild(sub2);

  var tot = hTotal(h);
  var dom = topType(h);
  var tt = typeTotals(); var sumAll = tt.rent + tt.job + tt.consume + tt.person;
  var b0 = el('div', 'dp-block');
  var grid = el('div', 'dp-grid');
  grid.appendChild(el('div', 'dp-cell', '<b>' + fmtN(tot) + '</b><span>本月纠纷（起）</span>'));
  grid.appendChild(el('div', 'dp-cell', '<b>' + (h.trend > 0 ? '+' + h.trend : h.trend) + '%</b><span>环比变化</span>'));
  grid.appendChild(el('div', 'dp-cell', '<b>' + TYPE_META[dom].label + '</b><span>主要类型</span>'));
  grid.appendChild(el('div', 'dp-cell', '<b>' + Math.round(h.counts[dom] / tot * 100) + '%</b><span>占本片区纠纷</span>'));
  b0.appendChild(grid);
  panel.appendChild(b0);

  /* 类型构成 */
  var b1 = el('div', 'dp-block');
  b1.appendChild(el('h5', null, '📊 本片区类型构成'));
  b1.appendChild(renderBars(Object.keys(TYPE_META).map(function(k){
    return { label: TYPE_META[k].label, num: h.counts[k],
      pct: Math.round(h.counts[k] / tot * 100), color: 'rgb(' + TYPE_META[k].rgb + ')' };
  })));
  panel.appendChild(b1);

  /* 典型案例 */
  var b2 = el('div', 'dp-block');
  b2.appendChild(el('h5', null, '📝 典型案例（脱敏演示）'));
  h.samples.forEach(function(s){ b2.appendChild(el('div', 'case-li', s)); });
  panel.appendChild(b2);

  /* 维权指引 */
  var b3 = el('div', 'dp-block');
  b3.appendChild(el('h5', null, '🧭 维权指引'));
  [
    '固定证据：合同 / 转账 / 聊天记录 / 现场照片',
    '先书面协商，明确诉求金额与期限',
    '协商不成 → 平台投诉、12315 / 12333、属地调解',
    '仍无法解决 → 12348 法律援助或仲裁 / 小额诉讼'
  ].forEach(function(s){ b3.appendChild(el('div', 'guide-li', s)); });
  panel.appendChild(b3);

  /* 操作 */
  var act = el('div', 'dp-actions');
  var ai = el('button', 'btn sm', '💬 咨询 AI 助手');
  ai.addEventListener('click', function(){ askAI(h.aiQ); });
  var law = el('button', 'btn ghost sm', '📍 附近法援点');
  law.addEventListener('click', function(){ toast('已定位「' + h.zone.split(' · ')[0] + '」最近的高校法律援助中心（演示）', true); });
  act.appendChild(ai); act.appendChild(law);
  panel.appendChild(act);

  panel.appendChild(el('div', 'dp-note', '（总榜中本片区约占 ' + Math.round(tot / sumAll * 100) + '%，演示数据）'));
}

/* ---------- 刷新 & 事件绑定 ---------- */
function refreshData(){
  MAP_DATA.forEach(function(h){
    Object.keys(h.counts).forEach(function(k){
      h.counts[k] = Math.max(8, Math.round(h.counts[k] * (0.95 + Math.random() * 0.1)));
    });
    h.trend = Math.max(-12, Math.min(26, h.trend + Math.round(Math.random() * 6 - 3)));
  });
  var live = $('#mtLive');
  live.textContent = '● 实时演示 · 刚刚更新 ' + nowStr();
  live.classList.add('flash');
  setTimeout(function(){ live.classList.remove('flash'); }, 700);
  renderMapAll();
  toast('数据已模拟刷新（演示）', true);
}
function renderMapAll(){
  renderStatsAndBar();
  renderHeat();
  renderPins();
  if (mapState.selId){
    var h = MAP_DATA.filter(function(x){ return x.id === mapState.selId; })[0];
    if (h && hTypeCount(h, mapState.activeType) > 0){ renderPinDetail(mapState.selId); }
    else { mapState.selId = null; renderOverview(); }
  } else { renderOverview(); }
}
function selectPin(id){ mapState.selId = id; renderHeat(); renderPins(); renderPinDetail(id); }

/* 类型筛选 */
$$('#typeChips .t-chip').forEach(function(ch){
  ch.addEventListener('click', function(){
    mapState.activeType = ch.dataset.t; mapState.selId = null;
    $$('#typeChips .t-chip').forEach(function(x){ x.classList.toggle('on', x === ch); });
    renderMapAll();
  });
});
/* 热力开关 */
$('#heatBtn').addEventListener('click', function(){
  mapState.heatOn = !mapState.heatOn;
  $('#heatBtn').textContent = '🔥 热力：' + (mapState.heatOn ? '开' : '关');
  $('#heatBtn').classList.toggle('off', !mapState.heatOn);
  renderHeat();
});
/* 模拟刷新 */
$('#refreshBtn').addEventListener('click', refreshData);

/* 页面初始化 */
renderMapAll();
