# -*- coding: utf-8 -*-
"""法护启航 答辩PPT 生成脚本 (16:9, 可编辑, 全对象可改)"""
import os
from pptx import Presentation
from pptx.util import Inches as In, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.lang import MSO_LANGUAGE_ID
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LEGEND_POSITION, XL_LABEL_POSITION
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, "assets", "logo", "ynu_logo.png")
OUT = os.path.join(HERE, "法护启航_答辩PPT.pptx")

# ---------- palette ----------
NAVY   = RGBColor(0x0B, 0x25, 0x45)   # 深邃蓝(主)
NAVY2  = RGBColor(0x14, 0x3A, 0x6B)   # 次级深蓝
NAVY3  = RGBColor(0x1E, 0x50, 0x8F)   # 亮深蓝
BLUE   = RGBColor(0x2E, 0x6F, 0xC6)   # 标准蓝
ACCENT = RGBColor(0x00, 0xA8, 0xE8)   # 科技青蓝
ACCENT_DK = RGBColor(0x0B, 0x7A, 0xB8)
GOLD   = RGBColor(0xF5, 0xB8, 0x42)
RED    = RGBColor(0xE0, 0x4B, 0x4B)
GREEN  = RGBColor(0x2E, 0xB8, 0x7A)
ORANGE = RGBColor(0xF2, 0x96, 0x3C)
BG     = RGBColor(0xF2, 0xF5, 0xF9)   # 浅灰背景
CARD   = RGBColor(0xFF, 0xFF, 0xFF)
LINE   = RGBColor(0xD7, 0xDF, 0xEA)   # 分隔线
INK    = RGBColor(0x1B, 0x2A, 0x41)   # 正文深色
GRAY   = RGBColor(0x5E, 0x6E, 0x82)   # 次要文字
LGRAY  = RGBColor(0x9A, 0xA7, 0xB8)   # 浅注释
WHITE  = RGBColor(0xFF, 0xFF, 0xFF)
BLUE_T = RGBColor(0xE8, 0xF1, 0xFB)   # 浅蓝底
CYAN_T = RGBColor(0xE3, 0xF7, 0xFC)   # 浅青底
RED_T  = RGBColor(0xFB, 0xEC, 0xEC)   # 浅红底
GRN_T  = RGBColor(0xE7, 0xF6, 0xF0)   # 浅绿底
GOLD_T = RGBColor(0xFD, 0xF3, 0xDF)   # 浅金底

F = "微软雅黑"

# ---------- low-level helpers ----------
def _set_ea(r, font):
    rPr = r._r.get_or_add_rPr()
    latin = rPr.find(qn("a:latin"))
    for tag in ("a:ea", "a:cs"):
        el = rPr.find(qn(tag))
        if el is None:
            el = rPr.makeelement(qn(tag), {})
            if latin is not None:
                latin.addnext(el)
                latin = el
            else:
                rPr.append(el)
        el.set("typeface", font)

def _fill_runs(p, runs):
    for run in runs:
        r = p.add_run()
        r.text = run.get("t", "")
        f = r.font
        f.size = Pt(run.get("s", 14))
        f.bold = run.get("b", False)
        f.italic = run.get("i", False)
        f.name = run.get("f", F)
        f.color.rgb = run.get("c", INK)
        _set_ea(r, run.get("f", F))

def tx(slide, x, y, w, h, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, wrap=True):
    box = slide.shapes.add_textbox(In(x), In(y), In(w), In(h))
    tf = box.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    first = True
    for para in paras:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = para.get("align", align)
        if para.get("ls"): p.line_spacing = para["ls"]
        if para.get("sb"): p.space_before = Pt(para["sb"])
        if para.get("sa"): p.space_after = Pt(para["sa"])
        _fill_runs(p, para["runs"])
    return box

def box(slide, x, y, w, h, fill=None, line=None, lw=1.0, dash=None,
        shape=MSO_SHAPE.RECTANGLE, radius=None):
    sp = slide.shapes.add_shape(shape, In(x), In(y), In(w), In(h))
    if fill is None:
        sp.fill.background()
    else:
        sp.fill.solid()
        sp.fill.fore_color.rgb = fill
    if line is None:
        sp.line.fill.background()
    else:
        sp.line.color.rgb = line
        sp.line.width = Pt(lw)
        if dash is not None:
            try:
                sp.line.dash_style = dash
            except Exception:
                pass
    if radius is not None:
        try:
            sp.adjustments[0] = radius
        except Exception:
            pass
    try:
        sp.shadow.inherit = False
    except Exception:
        pass
    return sp

def alpha(sp, pct):  # pct = 不透明度 0-100
    try:
        sf = sp.fill._xPr.find(qn("a:solidFill"))
        clr = sf.find(qn("a:srgbClr"))
        a = clr.makeelement(qn("a:alpha"), {"val": str(int(pct * 1000))})
        clr.append(a)
    except Exception:
        pass

def stext(sp, paras, anchor=MSO_ANCHOR.MIDDLE, align=PP_ALIGN.CENTER, ml=0.06, mr=0.06, mt=0.02, mb=0.02):
    tf = sp.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = In(ml); tf.margin_right = In(mr)
    tf.margin_top = In(mt); tf.margin_bottom = In(mb)
    first = True
    for para in paras:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = para.get("align", align)
        if para.get("ls"): p.line_spacing = para["ls"]
        if para.get("sb"): p.space_before = Pt(para["sb"])
        if para.get("sa"): p.space_after = Pt(para["sa"])
        _fill_runs(p, para["runs"])
    return sp

def add_logo(slide, x=0.34, y=0.26, s=0.64):
    """左上角校徽：独立可替换图片对象 + 白色圆角底板"""
    box(slide, x, y, s, s, fill=WHITE, line=LINE, lw=0.75,
        shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.16)
    m = s * 0.075
    slide.shapes.add_picture(LOGO, In(x + m), In(y + m), height=In(s - 2 * m))

def header(slide, title, kicker=None, page=None, gold_tag=None, title_size=25):
    add_logo(slide, 0.34, 0.27, 0.62)
    x = 1.16
    if kicker:
        tx(slide, x, 0.30, 10.2, 0.28, [{"runs": [{"t": kicker, "s": 10.5, "b": True, "c": ACCENT_DK}]}])
        ty = 0.55
    else:
        ty = 0.38
    tx(slide, x, ty, 9.6, 0.5, [{"runs": [{"t": title, "s": title_size, "b": True, "c": NAVY}]}])
    box(slide, x, ty + 0.5, 0.55, 0.04, fill=ACCENT)
    if gold_tag:
        sp = box(slide, 11.0, 0.42, 2.0, 0.4, fill=GOLD_T, line=GOLD, lw=0.75,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        stext(sp, [{"runs": [{"t": gold_tag, "s": 11, "b": True, "c": RGBColor(0x8A,0x5A,0x00)}]}])
    if page is not None and not gold_tag:
        tx(slide, 11.2, 0.30, 1.8, 0.3, [{"runs": [{"t": "%02d / 15" % page, "s": 11, "b": True, "c": GRAY}]}], align=PP_ALIGN.RIGHT)
    box(slide, 0.34, 1.12, 12.65, 0.014, fill=LINE)

def footer(slide, idx):
    tx(slide, 0.34, 7.14, 8.6, 0.26,
       [{"runs": [{"t": "法护启航 · AI赋能大学生全周期法律风险防护实践", "s": 8, "c": GRAY}]}])
    tx(slide, 10.7, 7.14, 2.3, 0.26,
       [{"runs": [{"t": "云南大学  |  %02d / 15" % idx, "s": 8.5, "b": True, "c": GRAY}]}],
       align=PP_ALIGN.RIGHT)

def note(slide, text):
    slide.notes_slide.notes_text_frame.text = text

def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = color

def npar(text, s=12, b=False, c=INK, align=None, ls=None, sb=None, sa=None, f=F, i=False):
    d = {"runs": [{"t": text, "s": s, "b": b, "c": c, "f": f, "i": i}]}
    if align is not None: d["align"] = align
    if ls is not None: d["ls"] = ls
    if sb is not None: d["sb"] = sb
    if sa is not None: d["sa"] = sa
    return d

# ============================================================ P1 封面
def p1_cover(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, NAVY)
    # 装饰: 半透明圆 + 细线
    c1 = box(s, 9.6, -2.2, 6.4, 6.4, fill=NAVY2, shape=MSO_SHAPE.OVAL)
    alpha(c1, 55)
    c2 = box(s, 11.9, 4.6, 3.1, 3.1, fill=ACCENT, shape=MSO_SHAPE.OVAL)
    alpha(c2, 16)
    c3 = box(s, -1.6, 5.4, 3.4, 3.4, fill=NAVY3, shape=MSO_SHAPE.OVAL)
    alpha(c3, 40)
    # 校徽(左上角, 独立图片对象)
    add_logo(s, 0.42, 0.4, 0.78)
    # 右上标签
    sp = box(s, 9.0, 0.52, 3.95, 0.52, fill=NAVY2, line=ACCENT, lw=1.0,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    alpha(sp, 60)
    stext(sp, [{"runs": [{"t": "大学生新文科创新实践大赛  ·  答辩展示", "s": 12.5, "b": True, "c": WHITE}]}])
    # 主标题区
    tx(s, 1.0, 2.02, 11.4, 0.5,
       [{"runs": [{"t": "法护启航", "s": 76, "b": True, "c": WHITE}]}])
    box(s, 1.06, 3.06, 1.1, 0.07, fill=ACCENT)
    tx(s, 1.0, 3.28, 11.4, 0.4,
       [{"runs": [{"t": "FAHU QIHANG  ·  AI Legal Guard for College Students", "s": 13, "b": True, "c": RGBColor(0x9E,0xD0,0xF0)}]}])
    tx(s, 1.0, 3.92, 11.6, 1.4,
       [npar("AI赋能大学生全周期法律风险防护实践", 22, True, WHITE, sa=6),
        npar("——基于呈贡大学城大学生租住、兼职与就业场景的调查与实践", 15, False, RGBColor(0xCF,0xE0,0xF5), sa=0)])
    # 底部团队信息
    chips = [("答辩团队", "【XXX】"), ("学校", "云南大学"), ("指导老师", "【XXX】")]
    cw, gap, x0 = 3.3, 0.5, 1.0
    for i, (k, v) in enumerate(chips):
        x = x0 + i * (cw + gap)
        sp = box(s, x, 6.28, cw, 0.72, fill=NAVY2, line=RGBColor(0x3E,0x63,0x9E), lw=0.75,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.22)
        alpha(sp, 70)
        stext(sp, [{"runs": [{"t": k + "：", "s": 12.5, "c": RGBColor(0x9E,0xD0,0xF0)},
                              {"t": v, "s": 14, "b": True, "c": WHITE}]}])
    tx(s, 0.0, 7.16, 13.34, 0.3,
       [{"runs": [{"t": "汇报人：【XXX】    ·    汇报日期：2026年【XX】月", "s": 10.5, "c": RGBColor(0x9E,0xB4,0xD0)}]}],
       align=PP_ALIGN.CENTER)
    note(s, "【答辩口述】各位评委老师好！我们是来自云南大学的大学生新文科创新实践团队，项目名称是“法护启航——AI赋能大学生全周期法律风险防护实践”。我们聚焦呈贡大学城大学生在租住、兼职与就业中最常遇到的法律风险，用“AI+行动导航”的方式，帮大学生从“不知道、不会做”走向“敢维权、会维权”。下面我将从问题发现、实践调研、解决方案与成果四部分进行汇报。\n【配图建议】可在此页右侧/底部放置 1) 呈贡大学城高校群实拍或航拍图 2) 团队实践合影 3) 云南大学校门/会泽院照片（作为半透明压底图，勿遮挡标题文字）。\n【修改提醒】封面中“答辩团队/指导老师/汇报人/日期”均为【XXX】占位，请替换为真实信息；校徽为独立图片，可右键“更改图片”替换为官方高清版。")

# ============================================================ P2 问题引入
def p2_intro(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "问题引入", kicker="PART 01 · 场景聚焦：大学生第一次走向社会", page=2)
    # 核心引言
    tx(s, 1.2, 1.5, 10.95, 0.85,
       [{"runs": [{"t": "大学生第一次走向社会，往往也是第一次面对复杂的法律关系。", "s": 21, "b": True, "c": NAVY}],
         "align": PP_ALIGN.CENTER, "ls": 1.15}])
    # 场景卡片
    cards = [
        ("🏠", "租房", "第一次签合同、交押金", NAVY2, BLUE_T),
        ("💼", "兼职", "第一次打工、领报酬", ACCENT_DK, CYAN_T),
        ("👔", "就业", "第一次求职、办入职", RGBColor(0x8A,0x5A,0x00), GOLD_T),
    ]
    cw, ch, gap = 3.45, 2.35, 0.3
    x0 = (13.34 - (cw * 3 + gap * 2)) / 2
    y0 = 2.42
    for i, (em, t, sub, cc, cfill) in enumerate(cards):
        x = x0 + i * (cw + gap)
        card = box(s, x, y0, cw, ch, fill=CARD, line=LINE, lw=1.0,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.09)
        box(s, x, y0, cw, 0.09, fill=cc, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        tx(s, x + 0.2, y0 + 0.42, cw - 0.4, 0.9,
           [{"runs": [{"t": em + "  " + t, "s": 30, "b": True, "c": cc}], "align": PP_ALIGN.CENTER}])
        tx(s, x + 0.25, y0 + 1.5, cw - 0.5, 0.7,
           [{"runs": [{"t": sub, "s": 13.5, "c": GRAY}], "align": PP_ALIGN.CENTER, "ls": 1.2}])
        if i < 2:
            ar = box(s, x + cw + 0.015, y0 + 0.95, 0.27, 0.42, fill=ACCENT, shape=MSO_SHAPE.RIGHT_ARROW)
    # 核心语句 banner
    bb = box(s, x0, 5.35, cw * 3 + gap * 2, 1.0, fill=NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.16)
    stext(bb, [{"runs": [{"t": "“", "s": 30, "b": True, "c": GOLD},
                          {"t": "不知道风险在哪里，也不知道发生之后怎么办。", "s": 20, "b": True, "c": WHITE},
                          {"t": "”", "s": 30, "b": True, "c": GOLD}], "align": PP_ALIGN.CENTER, "ls": 1.1}])
    tx(s, 1.2, 6.55, 10.95, 0.4,
       [{"runs": [{"t": "风险意识薄弱 + 行动能力缺失 —— 这就是我们想解决的问题起点", "s": 13, "b": True, "c": ACCENT_DK}],
         "align": PP_ALIGN.CENTER}])
    footer(s, 2)
    note(s, "【答辩口述】大学生第一次走向社会，往往也是第一次面对复杂的法律关系：第一次租房、第一次兼职、第一次就业。调研中我们发现，大家普遍处于一种“双不知道”的状态——不知道风险在哪里，也不知道发生之后该怎么办。这三个场景，正是我们整个项目的问题原点。\n【配图建议】1) 大学生拖着行李箱看房/签合同 2) 学生兼职打工 3) 招聘会/面试场景照片，或对应插画，放在三张场景卡片内或卡片上方。\n【修改提醒】三张卡片下的说明文字可按实际调研补充具体案例；卡片图片可直接替换为实拍图。")

# ============================================================ P3 数据大屏版式
def p3_dashboard(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "大学生高频法律风险", kicker="PART 02 · 真实问题｜数据大屏版式", page=3)
    # 大屏容器
    px, py, pw, ph = 0.9, 1.42, 11.55, 4.62
    panel = box(s, px, py, pw, ph, fill=RGBColor(0x0E,0x2A,0x52))
    # 四角科技括号
    lw = 0.045
    seg = 0.5
    for (cx, cy, dx, dy) in [(px, py, 1, 1), (px + pw, py, -1, 1), (px, py + ph, 1, -1), (px + pw, py + ph, -1, -1)]:
        box(s, cx - (0 if dx > 0 else seg), cy, seg, lw, fill=ACCENT)
        box(s, cx - (0 if dx > 0 else lw), cy, lw, seg, fill=ACCENT)
        box(s, cx - (0 if dx > 0 else seg), cy + ph * 0 - 0 if False else cy, seg, lw, fill=ACCENT)
    # 简化四角: 直接用两条
    for (cx, cy, hx, hy) in [(px, py, 1, 1), (px + pw, py, -1, 1), (px, py + ph, 1, -1), (px + pw, py + ph, -1, -1)]:
        box(s, cx if hx > 0 else cx - seg, cy, seg, lw, fill=ACCENT)
        box(s, cx, cy if hy > 0 else cy - seg, lw, seg, fill=ACCENT)
    tx(s, px + 0.45, py + 0.28, 6.0, 0.4,
       [{"runs": [{"t": "■ 大学生高频法律风险监测（调研版）", "s": 15, "b": True, "c": WHITE}]}])
    tx(s, px + pw - 3.4, py + 0.30, 3.0, 0.35,
       [{"runs": [{"t": "覆盖场景：租住 / 兼职 / 就业", "s": 11, "c": RGBColor(0x9E,0xD0,0xF0)}], "align": PP_ALIGN.RIGHT}])
    cols = [
        ("租房板块", "🏠", BLUE, ["押金", "合同", "证据留存"]),
        ("兼职板块", "💼", ACCENT, ["欠薪", "虚假招聘", "诈骗"]),
        ("就业板块", "👔", GOLD, ["试用期", "劳动合同", "无故辞退"]),
    ]
    cw, ch, gap = 3.45, 3.15, 0.22
    cx0 = px + 0.45
    cy0 = py + 0.85
    for i, (name, em, cc, items) in enumerate(cols):
        x = cx0 + i * (cw + gap)
        col = box(s, x, cy0, cw, ch, fill=RGBColor(0x14,0x3A,0x6B), line=RGBColor(0x2A,0x57,0x95), lw=1.0,
                  shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
        alpha(col, 88)
        tx(s, x + 0.3, cy0 + 0.28, cw - 0.6, 0.6,
           [{"runs": [{"t": em + "  " + name, "s": 17, "b": True, "c": WHITE}]}])
        box(s, x + 0.3, cy0 + 0.92, 0.5, 0.045, fill=cc)
        yy = cy0 + 1.15
        for j, it in enumerate(items):
            chip = box(s, x + 0.35, yy + j * 0.62, cw - 0.7, 0.5, fill=RGBColor(0x1E,0x50,0x8F),
                       line=RGBColor(0x3E,0x63,0x9E), lw=0.75,
                       shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
            stext(chip, [{"runs": [{"t": it, "s": 14, "b": True, "c": WHITE}]}])
            tx(s, x + cw - 1.15, yy + j * 0.62, 0.75, 0.5,
               [{"runs": [{"t": "高频", "s": 9.5, "b": True, "c": GOLD}], "align": PP_ALIGN.RIGHT}], anchor=MSO_ANCHOR.MIDDLE)
    # 底部预留语
    bar = box(s, px + 0.45, py + ph - 0.78, pw - 0.9, 0.56, fill=RGBColor(0x1E,0x50,0x8F),
              shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    stext(bar, [{"runs": [{"t": "我们的调研发现：", "s": 14.5, "b": True, "c": RGBColor(0x9E,0xD0,0xF0)},
                          {"t": "【XXX】", "s": 17, "b": True, "c": GOLD},
                          {"t": "（此处填写最有力的调研结论）", "s": 10.5, "c": RGBColor(0x9E,0xB4,0xD0)}]}])
    footer(s, 3)
    note(s, "【答辩口述】这是我们的“问题地图”——把大学生高频法律风险拆到三个场景：租房里的押金、合同与证据留存；兼职里的欠薪、虚假招聘与诈骗；就业里的试用期、劳动合同与无故辞退。我们在调研中还发现一个共性问题：【XXX】。这些问题看着小，但对没有社会经验的大学生来说，轻则损失金钱，重则影响学业与征信。\n【配图建议】整页为“数据大屏”风格，可替换为真实后台大屏截图；每个板块右侧可放对应场景实拍图；底部“我们的调研发现”处建议配 1 张团队走访/访谈的现场照片作为图注。\n【修改提醒】请把底部“【XXX】”替换为最有冲击力的一句调研结论（如“约X成受访学生遭遇过押金不退”）；板块内风险点文字均可自由增删。")

# ============================================================ P4 实践调研路线
def p4_route(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "我们如何发现问题", kicker="PART 03 · 实践调研路线（评委重点打分项）", page=4, gold_tag="★ 重点")
    # 流向图
    fx, fy, fw, fh = 0.7, 1.5, 11.95, 1.75
    box(s, fx, fy, fw, fh, fill=CARD, line=LINE, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06)
    tx(s, fx + 0.35, fy + 0.18, 4.0, 0.3,
       [{"runs": [{"t": "调研对象流向图（全链条）", "s": 12.5, "b": True, "c": ACCENT_DK}]}])
    nodes = ["呈贡大学城", "高校", "大学生", "房东", "企业", "社区", "司法所", "法律援助社团"]
    nw, nh = 1.38, 0.72
    step = nw + 0.075
    x0 = fx + 0.25
    y0 = fy + 0.72
    for i, nd in enumerate(nodes):
        x = x0 + i * step
        color = NAVY if i < 3 else (BLUE if i < 5 else ACCENT_DK)
        if i == len(nodes) - 1:
            color = NAVY3
        sp = box(s, x, y0, nw, nh, fill=color, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.24)
        stext(sp, [{"runs": [{"t": nd, "s": 11, "b": True, "c": WHITE}]}])
        tx(s, x - 0.02, y0 - 0.26, nw, 0.25,
           [{"runs": [{"t": "①" if i == 0 else ("⑧" if i == 7 else ""), "s": 9, "b": True, "c": GRAY}], "align": PP_ALIGN.CENTER}])
        if i < len(nodes) - 1:
            ar = box(s, x + nw + 0.002, y0 + nh / 2 - 0.07, 0.07, 0.14, fill=RGBColor(0x9A,0xA7,0xB8), shape=MSO_SHAPE.RIGHT_ARROW)
    # 调研手段
    mx, my = 0.7, 3.55
    tx(s, mx, my, 2.2, 0.35, [{"runs": [{"t": "调研手段", "s": 14, "b": True, "c": NAVY}]}])
    means = [("📋", "问卷调查"), ("🎙️", "深度访谈"), ("🗂️", "案例访谈"), ("👣", "实地走访"), ("⚖️", "专业咨询")]
    mw, mh, mgap = 2.23, 0.62, 0.13
    x0 = mx + 0.02
    for i, (em, m) in enumerate(means):
        x = x0 + i * (mw + mgap)
        sp = box(s, x, my + 0.45, mw, mh, fill=WHITE, line=RGBColor(0xAF,0xC3,0xDC), lw=1.0,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        stext(sp, [{"runs": [{"t": em + "  " + m, "s": 13, "b": True, "c": NAVY2}]}])
    # 预留标注 4 个统计卡
    stats = [("实践时间", "【XXX】", "时间段/周期"),
             ("开展次数", "【XXX】", "次"),
             ("受访人数", "【XXX】", "人"),
             ("走访场所", "【XXX】", "处/个")]
    cw, chh, cgap = 2.84, 1.32, 0.2
    x0 = 0.7
    y0 = 4.9
    for i, (lab, val, unit) in enumerate(stats):
        x = x0 + i * (cw + cgap)
        c = box(s, x, y0, cw, chh, fill=CARD, line=LINE, lw=1.0,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
        box(s, x, y0 + 0.16, 0.05, chh - 0.32, fill=ACCENT)
        tx(s, x + 0.22, y0 + 0.16, cw - 0.4, 0.35,
           [{"runs": [{"t": lab, "s": 12, "b": True, "c": GRAY}]}])
        tx(s, x + 0.22, y0 + 0.48, cw - 0.4, 0.62,
           [{"runs": [{"t": val, "s": 24, "b": True, "c": NAVY},
                      {"t": "  " + unit, "s": 11, "c": GRAY}]}])
    # 底部说明
    tx(s, 0.7, 6.42, 11.9, 0.5,
       [{"runs": [{"t": "路线设计逻辑：", "s": 12, "b": True, "c": ACCENT_DK},
                  {"t": "覆盖“高校—市场—司法—援助”完整链条，让每个风险结论都能找到真实样本支撑，做到“问题从现场来、方案到现场去”。", "s": 12, "c": INK}], "ls": 1.2}])
    footer(s, 4)
    note(s, "【答辩口述】为了确保问题真实，我们设计了全链条调研路线：从呈贡大学城出发，走进高校和学生，再延伸到房东、企业、社区、司法所和法律援助社团，共覆盖【XXX】类对象。调研手段包括问卷调查、深度访谈、案例访谈、实地走访与专业咨询；累计实践时间【XXX】、开展【XXX】次、访问【XXX】人、走访【XXX】处场所。评委老师重点看的，正是这条“问题从现场来”的完整证据链。\n【配图建议】1) 调研路线地图/呈贡大学城地图标注图 2) 团队在社区/司法所走访的照片拼图 3) 问卷二维码与回收现场照片 4) 访谈记录/案例卷宗特写。\n【修改提醒】四个统计卡与口述中的【XXX】请填真实数据；流向图中的对象可增删；走访照片建议统一尺寸放在本页底部或替换右侧说明区域。")

# ============================================================ P5 调研结果概览
def p5_results(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "调研结果概览", kicker="PART 04 · 让数据说话", page=5)
    # 左: 核心数据卡
    lx, ly, lw, lh = 0.8, 1.55, 5.35, 4.6
    box(s, lx, ly, lw, lh, fill=CARD, line=LINE, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    tx(s, lx + 0.35, ly + 0.25, 4.5, 0.4,
       [{"runs": [{"t": "核心调研数据", "s": 16, "b": True, "c": NAVY}]}])
    rows = [("调研人数", "【XXX】", "人"),
            ("深度访谈", "【XXX】", "人"),
            ("实地走访", "【XXX】", "次"),
            ("收集案例", "【XXX】", "件")]
    ry = ly + 0.9
    for i, (lab, val, unit) in enumerate(rows):
        yy = ry + i * 0.86
        if i > 0:
            box(s, lx + 0.35, yy - 0.1, lw - 0.7, 0.012, fill=LINE)
        tx(s, lx + 0.4, yy, 2.2, 0.55,
           [{"runs": [{"t": lab, "s": 14, "b": True, "c": INK}]}], anchor=MSO_ANCHOR.MIDDLE)
        tx(s, lx + lw - 2.9, yy, 2.5, 0.55,
           [{"runs": [{"t": val, "s": 24, "b": True, "c": NAVY},
                      {"t": " " + unit, "s": 12, "c": GRAY}], "align": PP_ALIGN.RIGHT}], anchor=MSO_ANCHOR.MIDDLE)
    box(s, lx + 0.35, ry + 3.55, lw - 0.7, 0.012, fill=LINE)
    tx(s, lx + 0.4, ry + 3.7, lw - 0.75, 0.7,
       [{"runs": [{"t": "数据口径：", "s": 11, "b": True, "c": ACCENT_DK},
                  {"t": "以呈贡大学城在读本硕学生为总体，采用分层抽样与滚雪球方式发放问卷。", "s": 11, "c": GRAY}], "ls": 1.25}])
    # 右: 风险分布饼图(原生可编辑图表)
    rx, ry2, rw, rh = 6.45, 1.55, 6.1, 4.6
    box(s, rx, ry2, rw, rh, fill=CARD, line=LINE, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    tx(s, rx + 0.3, ry2 + 0.22, 5.4, 0.4,
       [{"runs": [{"t": "风险分布 · 三大场景（示意图，双击图表改数据）", "s": 14.5, "b": True, "c": NAVY}]}])
    cd = CategoryChartData()
    cd.categories = ["租房风险", "兼职风险", "就业风险"]
    cd.add_series("风险占比(示例)", (55, 25, 20))
    gf = s.shapes.add_chart(XL_CHART_TYPE.PIE, In(rx + 0.75), In(ry2 + 0.55), In(rw - 1.5), In(2.55), cd)
    ch = gf.chart
    ch.has_legend = True
    ch.legend.position = XL_LEGEND_POSITION.RIGHT
    ch.legend.include_in_layout = False
    try:
        ch.font.size = Pt(10.5)
        ch.font.name = F
    except Exception:
        pass
    plot = ch.plots[0]
    plot.has_data_labels = True
    dl = plot.data_labels
    dl.show_percentage = True
    dl.number_format = '0"%"'
    dl.number_format_is_linked = False
    dl.position = XL_LABEL_POSITION.OUTSIDE_END
    try:
        colors = [NAVY3, ACCENT, GOLD]
        for i, pt in enumerate(plot.series[0].points):
            pt.format.fill.solid()
            pt.format.fill.fore_color.rgb = colors[i]
    except Exception:
        pass
    # 下方三条占比占位
    chips = [("租房风险占比", NAVY3), ("兼职风险占比", ACCENT), ("就业风险占比", GOLD)]
    yy = ry2 + 3.42
    for i, (lab, cc) in enumerate(chips):
        x = rx + 0.3 + i * 1.95
        box(s, x, yy + 0.06, 0.22, 0.22, fill=cc, shape=MSO_SHAPE.OVAL)
        tx(s, x + 0.3, yy, 1.65, 0.75,
           [{"runs": [{"t": lab, "s": 11, "c": INK}], "align": PP_ALIGN.LEFT, "ls": 1.05},
            {"runs": [{"t": "【XXX】%", "s": 14, "b": True, "c": cc}], "align": PP_ALIGN.LEFT}])
    tx(s, rx + 0.3, ry2 + rh - 0.42, rw - 0.6, 0.32,
       [{"runs": [{"t": "※ 图表数值为示意结构，答辩前请双击图表 → “编辑数据”替换为真实占比。", "s": 9, "c": LGRAY}]}])
    footer(s, 5)
    note(s, "【答辩口述】本次调研共回收有效问卷【XXX】份，深度访谈【XXX】人，实地走访【XXX】次，收集真实案例【XXX】件。从风险分布看，租房、兼职、就业三大场景的占比分别为【XXX】%、【XXX】%和【XXX】%——数据说明风险并非个例，而是呈贡大学城大学生群体中的普遍痛点。\n【配图建议】1) 问卷发放/填写现场照片 2) 调研数据实时统计大屏截图 3) 词云图（押金/欠薪/试用期等高频词）。\n【修改提醒】左侧数字与右侧三条【XXX】% 为文字占位请填写；饼图是 PowerPoint 原生图表——双击饼图 → “编辑数据” 即可改数值和类别，颜色也可在图表工具中修改。")

# ============================================================ P6 痛点分析
def p6_pain(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "痛点分析：三层递进", kicker="PART 05 · 为什么“懂法”却不会“用法”", page=6)
    pains = [
        ("01", "看不懂", "法律条文专业晦涩", "法条、术语、程序……对非专业学生如同“天书”，读不懂自然用不上。", NAVY2, BLUE_T),
        ("02", "不知道", "无法识别潜藏风险", "合同条款、招聘话术里藏着风险，学生缺少“风险嗅觉”，签了字才发现问题。", BLUE, CYAN_T),
        ("03", "不会做", "不懂留存证据、不知维权途径", "出事之后不知道先做什么：不会固定证据、不清楚找谁、不知道怎么写材料。", ACCENT_DK, RGBColor(0xE8,0xF4,0xFC)),
    ]
    y0 = 1.55
    for i, (num, t, sub, dsc, cc, cfill) in enumerate(pains):
        yy = y0 + i * 1.52
        xx = 0.85 + i * 0.28
        # 编号圆
        circ = box(s, xx, yy + 0.18, 0.86, 0.86, fill=cc, shape=MSO_SHAPE.OVAL)
        stext(circ, [{"runs": [{"t": num, "s": 22, "b": True, "c": WHITE}]}])
        card = box(s, xx + 1.05, yy, 9.7, 1.22, fill=CARD, line=LINE, lw=1.0,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12)
        box(s, xx + 1.05, yy, 0.07, 1.22, fill=cc)
        tx(s, xx + 1.35, yy + 0.14, 2.1, 0.5,
           [{"runs": [{"t": t, "s": 19, "b": True, "c": NAVY}]}])
        tx(s, xx + 3.1, yy + 0.18, 7.3, 0.42,
           [{"runs": [{"t": sub, "s": 13.5, "b": True, "c": cc}]}])
        tx(s, xx + 3.1, yy + 0.62, 7.3, 0.55,
           [{"runs": [{"t": dsc, "s": 11.5, "c": GRAY}], "ls": 1.15}])
        if i < 2:
            ar = box(s, xx + 2.15, yy + 1.24, 0.4, 0.3, fill=RGBColor(0xAF,0xC3,0xDC), shape=MSO_SHAPE.DOWN_ARROW)
    # 核心总结
    bb = box(s, 1.3, 6.18, 10.75, 0.78, fill=NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    stext(bb, [{"runs": [{"t": "核心结论：", "s": 15, "b": True, "c": GOLD},
                          {"t": "“法律知识”没有真正转化为“法律行动”", "s": 20, "b": True, "c": WHITE}]}])
    footer(s, 6)
    note(s, "【答辩口述】我们把痛点归纳为层层递进的三层：第一层“看不懂”，法条专业晦涩；第二层“不知道”，识别不了潜藏在合同与招聘里的风险；第三层“不会做”，出了事不知道如何留存证据、走什么维权路径。三层叠加，结论就是——大学生并不缺“法律知识”，缺的是把知识变成行动的能力。\n【配图建议】1) 学生看复杂合同条文/皱眉表情照片 2) 聊天记录/欠薪通知截图（脱敏）3) 维权求助场景插画；也可用三张递进箭头插画。\n【修改提醒】三层痛点的子描述可按调研补充具体案例；右侧大段区域可放1张“痛点数据”或实拍图，若放入图片请把文字框整体下移/缩小。")

# ============================================================ P7 项目解决方案
def p7_solution(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "从“法律知识”到“法律行动”", kicker="PART 06 · 项目解决方案：全周期防护闭环", page=7)
    # 输入/输出标签
    tx(s, 0.9, 1.42, 5.0, 0.4,
       [{"runs": [{"t": "用户带着问题进来：", "s": 12.5, "b": True, "c": GRAY},
                  {"t": "“我遇到风险了，该怎么办？”", "s": 13, "b": True, "c": NAVY}]}])
    tx(s, 8.2, 1.42, 4.4, 0.4,
       [{"runs": [{"t": "带着行动方案离开：", "s": 12.5, "b": True, "c": GRAY},
                  {"t": "“我知道先做什么、找谁、怎么维权”", "s": 13, "b": True, "c": ACCENT_DK}], "align": PP_ALIGN.RIGHT}])
    steps = [
        ("风险测评", "先摸清风险底数", NAVY2),
        ("风险识别", "定位具体风险点", NAVY3),
        ("AI预警", "风险出现即提醒", BLUE),
        ("证据留存", "教会你保存证据", ACCENT_DK),
        ("维权导航", "给出行动路线", RGBColor(0x0E,0x8F,0x8F)),
        ("专业转介", "对接专业力量", GREEN),
        ("问题反馈", "回流反哺模型", GOLD),
    ]
    # 蛇形两行
    nw, nh = 2.78, 1.02
    gap = 0.22
    row1 = steps[:4]
    row2 = list(reversed(steps[4:]))
    y1, y2 = 2.2, 3.9
    x0 = 0.78
    def draw_row(row, yy, forward=True):
        xs = []
        for i, (t, sub, cc) in enumerate(row):
            x = x0 + i * (nw + gap) if forward else x0 + (len(row) - 1 - i) * (nw + gap)
            xs.append(x)
            sp = box(s, x, yy, nw, nh, fill=WHITE, line=cc, lw=1.5,
                     shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.14)
            box(s, x, yy, nw, 0.12, fill=cc, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
            circ = box(s, x + 0.18, yy + 0.24, 0.5, 0.5, fill=cc, shape=MSO_SHAPE.OVAL)
            stext(circ, [{"runs": [{"t": "0%d" % (i + 1 if forward else len(row) - i), "s": 13, "b": True, "c": WHITE}]}])
            tx(s, x + 0.8, yy + 0.14, nw - 0.95, 0.45,
               [{"runs": [{"t": t, "s": 15.5, "b": True, "c": NAVY}]}])
            tx(s, x + 0.8, yy + 0.58, nw - 0.95, 0.4,
               [{"runs": [{"t": sub, "s": 10.5, "c": GRAY}]}])
            if forward and i < len(row) - 1:
                ar = box(s, x + nw + 0.025, yy + 0.36, gap - 0.05, 0.3, fill=RGBColor(0xAF,0xC3,0xDC), shape=MSO_SHAPE.RIGHT_ARROW)
        return xs
    xs1 = draw_row(row1, y1, True)
    xs2 = draw_row(row2, y2, False)
    # 行间连接: row1 末尾 -> row2 末尾 (row2 是从右往左, 其起点在右端)
    ar = box(s, xs1[-1] + nw / 2 - 0.16, y1 + nh, 0.32, y2 - y1 - nh, fill=RGBColor(0xAF,0xC3,0xDC), shape=MSO_SHAPE.DOWN_ARROW)
    # 反馈闭环: row2 最左 (问题反馈) -> 回到 row1 最左 (风险测评)
    # 用虚线直角折线近似: 从反馈卡片左侧向下再向上到测评卡片下
    # 简化: 在左侧画向上的弯箭头说明文字
    tx(s, 0.78, 5.15, 11.8, 0.4,
       [{"runs": [{"t": "↺ 问题反馈回流至“风险测评”，", "s": 12, "b": True, "c": ACCENT_DK},
                  {"t": "持续优化风险画像与预警模型 —— 形成“识别 → 行动 → 反馈 → 再识别”的全周期闭环", "s": 12, "c": INK}], "align": PP_ALIGN.CENTER}])
    bb = box(s, 0.9, 5.85, 11.55, 0.85, fill=NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.16)
    stext(bb, [{"runs": [{"t": "一句话定位：", "s": 14, "b": True, "c": GOLD},
                          {"t": "不是给大学生“背法条”，而是给大学生“开行动导航”。", "s": 18, "b": True, "c": WHITE}]}])
    footer(s, 7)
    note(s, "【答辩口述】我们的解决方案是一条完整链路：风险测评摸清底数 → 风险识别定位问题 → AI预警及时提醒 → 证据留存教会取证 → 维权导航给出行动路线 → 专业转介对接司法所与法律援助 → 问题反馈再回流反哺模型。它的核心不是“讲法律”，而是把法律知识翻译成大学生看得懂、做得出的行动步骤。\n【配图建议】1) 产品全流程操作录屏/界面走查图 2) 用户从“提问”到“拿到文书”的路径截图 3) 流程图风格插画。\n【修改提醒】七个环节的名称与子描述可据产品现状修改；“一句话定位”建议改为更有记忆点的Slogan。")

# ============================================================ P8 产品架构
def p8_arch(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "产品架构：五大功能模块", kicker="PART 07 · “AI + 服务网络”双层支撑", page=8)
    mods = [
        ("🧭", "AI风险测评", "答题生成风险画像"),
        ("📄", "AI合同审查", "合同体检 · 风险报告"),
        ("🤖", "AI法律行动助手", "问答 + 行动导航"),
        ("🧾", "证据急救", "证据清单与留存指引"),
        ("🗺️", "法律服务地图", "附近机构一键导航"),
    ]
    mw, mh, mg = 2.3, 1.5, 0.12
    x0 = 0.85
    y0 = 1.55
    for i, (em, t, sub) in enumerate(mods):
        x = x0 + i * (mw + mg)
        c = box(s, x, y0, mw, mh, fill=WHITE, line=LINE, lw=1.0,
                shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
        box(s, x, y0 + mh - 0.12, mw, 0.12, fill=NAVY2, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        tx(s, x + 0.15, y0 + 0.18, mw - 0.3, 0.55,
           [{"runs": [{"t": em + "  " + t, "s": 15, "b": True, "c": NAVY}], "align": PP_ALIGN.CENTER}])
        tx(s, x + 0.15, y0 + 0.85, mw - 0.3, 0.5,
           [{"runs": [{"t": sub, "s": 10.5, "c": GRAY}], "align": PP_ALIGN.CENTER, "ls": 1.1}])
        # 向下连接线
        box(s, x + mw / 2 - 0.02, y0 + mh, 0.04, 0.35, fill=RGBColor(0xAF,0xC3,0xDC))
    # AI能力底座
    ay = y0 + mh + 0.42
    bar = box(s, x0, ay, mw * 5 + mg * 4, 0.72, fill=RGBColor(0x0E,0x2A,0x52),
              shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12)
    tx(s, x0 + 0.3, ay + 0.18, 2.2, 0.4,
       [{"runs": [{"t": "⚙ AI 能力底座", "s": 13, "b": True, "c": ACCENT}]}])
    chips = ["法律大模型", "本地化法律知识库", "大学生案例数据库"]
    cx = x0 + 2.6
    for i, cname in enumerate(chips):
        sp = box(s, cx + i * 2.65, ay + 0.13, 2.45, 0.46, fill=RGBColor(0x1E,0x50,0x8F),
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        stext(sp, [{"runs": [{"t": cname, "s": 12, "b": True, "c": WHITE}]}])
    # 协同服务层
    sy = ay + 1.05
    bar2 = box(s, x0, sy, mw * 5 + mg * 4, 0.72, fill=WHITE, line=LINE, lw=1.0,
               shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12)
    tx(s, x0 + 0.3, sy + 0.18, 2.2, 0.4,
       [{"runs": [{"t": "🤝 多方协同服务网络", "s": 13, "b": True, "c": ACCENT_DK}]}])
    nets = ["呈贡大学城高校", "社区", "司法所", "法律援助机构", "法律服务平台"]
    cx = x0 + 2.62
    for i, nm in enumerate(nets):
        sp = box(s, cx + i * 1.94, sy + 0.13, 1.75, 0.46, fill=BLUE_T, line=RGBColor(0xAF,0xC3,0xDC), lw=0.75,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        stext(sp, [{"runs": [{"t": nm, "s": 10.5, "b": True, "c": NAVY2}]}])
    # 左竖标签
    for (lab, yy, hh) in [("应用层", y0, mh), ("AI引擎层", ay, 0.72), ("协同服务层", sy, 0.72)]:
        v = tx(s, 0.12, yy + hh / 2 - 0.15, 0.5, 0.3,
               [{"runs": [{"t": lab, "s": 11, "b": True, "c": GRAY}], "align": PP_ALIGN.CENTER}])
        v.rotation = 270
    # 底部说明
    tx(s, 0.9, sy + 1.0, 11.6, 0.45,
       [{"runs": [{"t": "架构说明：", "s": 11.5, "b": True, "c": ACCENT_DK},
                  {"t": "五大功能模块面向学生前台；AI能力底座提供“法律大模型 + 本地化知识库 + 案例库”的智力支撑；底层对接高校、社区、司法所与法律援助，保证“AI给方案、人来兜底”。", "s": 11.5, "c": INK}], "ls": 1.2}])
    footer(s, 8)
    note(s, "【答辩口述】产品分三层：最上层是五大功能模块——AI风险测评、AI合同审查、AI法律行动助手、证据急救、法律服务地图；中间是AI能力底座，由法律大模型、本地化知识库和大学生案例数据库支撑；最下层是多方协同服务网络，对接高校、社区、司法所和法律援助机构。这样设计的逻辑是：AI负责把专业问题讲清楚、给方案，人来负责把方案落地，确保安全与可信。\n【配图建议】1) 系统功能架构图高保真版 2) 五大功能入口截图平铺 3) 后台知识库/案例库界面截图。\n【修改提醒】模块名称与描述按产品迭代更新；若新增模块请保持5列版式，注意文字勿超出卡片。")

# ============================================================ P9 AI合同审查
def p9_contract(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "AI合同审查 · 功能演示", kicker="PART 08 · 答辩爆点页面", page=9, gold_tag="⚡ 爆点")
    y0, hh = 1.42, 3.55
    # 左: 上传区
    lx, lw = 0.85, 5.6
    box(s, lx, y0, lw, hh, fill=CARD, line=LINE, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    tx(s, lx + 0.3, y0 + 0.2, 4.8, 0.4,
       [{"runs": [{"t": "① 合同上传（界面示意）", "s": 15, "b": True, "c": NAVY}]}])
    uz = box(s, lx + 0.3, y0 + 0.72, lw - 0.6, 1.95, fill=RGBColor(0xF6,0xF9,0xFC),
             line=ACCENT, lw=1.25, dash=None,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
    # 虚线框: 用短线段模拟
    tx(s, lx + 0.3, y0 + 1.0, lw - 0.6, 0.5,
       [{"runs": [{"t": "📄", "s": 34, "c": ACCENT}], "align": PP_ALIGN.CENTER}])
    tx(s, lx + 0.3, y0 + 1.55, lw - 0.6, 0.4,
       [{"runs": [{"t": "拖拽或点击上传合同文件", "s": 15, "b": True, "c": NAVY2}], "align": PP_ALIGN.CENTER}])
    tx(s, lx + 0.3, y0 + 1.95, lw - 0.6, 0.35,
       [{"runs": [{"t": "支持多页合同智能解析，快速输出风险报告", "s": 10.5, "c": GRAY}], "align": PP_ALIGN.CENTER}])
    fmts = ["PDF", "Word", "图片"]
    for i, ft in enumerate(fmts):
        sp = box(s, lx + 0.75 + i * 1.5, y0 + 2.5, 1.3, 0.42, fill=BLUE_T, line=RGBColor(0xAF,0xC3,0xDC), lw=0.75,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        stext(sp, [{"runs": [{"t": ft, "s": 12, "b": True, "c": NAVY2}]}])
    tx(s, lx + 0.3, y0 + hh - 0.55, lw - 0.6, 0.4,
       [{"runs": [{"t": "💡 演示建议：现场上传 1 份真实租房合同（脱敏）制造记忆点", "s": 11, "b": True, "c": ACCENT_DK}], "ls": 1.15}])
    # 右: 风险报告
    rx, rw = 6.65, 5.85
    box(s, rx, y0, rw, hh, fill=CARD, line=LINE, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    box(s, rx, y0, rw, 0.5, fill=NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    tx(s, rx + 0.3, y0 + 0.1, 3.6, 0.32,
       [{"runs": [{"t": "② AI 风险审查报告 · 模拟案例", "s": 13.5, "b": True, "c": WHITE}]}])
    sp = box(s, rx + rw - 1.35, y0 + 0.1, 1.05, 0.32, fill=GOLD_T, line=GOLD, lw=0.5,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    stext(sp, [{"runs": [{"t": "中风险", "s": 11, "b": True, "c": RGBColor(0x8A,0x5A,0x00)}]}])
    ry = y0 + 0.62
    # 综合得分
    tx(s, rx + 0.3, ry, 2.2, 0.75,
       [{"runs": [{"t": "综合风险得分", "s": 11.5, "c": GRAY}]}])
    tx(s, rx + 0.3, ry + 0.26, 2.6, 0.5,
       [{"runs": [{"t": "72", "s": 30, "b": True, "c": RED},
                  {"t": "  / 100（示例）", "s": 11, "c": GRAY}]}])
    # 高/中/低数量
    counts = [("高风险", "0", RED), ("中风险", "3", GOLD), ("低风险", "5", GREEN)]
    cx0 = rx + 2.55
    for i, (lab, val, cc) in enumerate(counts):
        x = cx0 + i * 1.12
        box(s, x, ry + 0.05, 1.0, 0.62, fill=BG, line=LINE, lw=0.75,
            shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.18)
        tx(s, x + 0.1, ry + 0.12, 0.8, 0.3, [{"runs": [{"t": lab, "s": 10, "c": GRAY}], "align": PP_ALIGN.CENTER}])
        tx(s, x + 0.1, ry + 0.34, 0.8, 0.3, [{"runs": [{"t": val, "s": 14, "b": True, "c": cc}], "align": PP_ALIGN.CENTER}])
    # 详情行
    dets = [
        ("风险条款", "押金退还条款、违约金条款、合同解除条款"),
        ("风险原因", "押金数额与退还条件约定不明、单方解除权失衡"),
        ("修改建议", "明确退还期限与条件、平衡双方违约责任"),
        ("法律依据", "《民法典》合同编相关条款（示例，以实际为准）"),
    ]
    dy = ry + 0.82
    for i, (lab, val) in enumerate(dets):
        yy = dy + i * 0.47
        box(s, rx + 0.3, yy, 1.15, 0.44, fill=BLUE_T, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.24)
        tx(s, rx + 0.38, yy + 0.07, 1.0, 0.3, [{"runs": [{"t": lab, "s": 10.5, "b": True, "c": NAVY2}]}])
        tx(s, rx + 1.62, yy + 0.04, rw - 1.95, 0.44,
           [{"runs": [{"t": val, "s": 10.5, "c": INK}], "ls": 1.0}], anchor=MSO_ANCHOR.MIDDLE)
    tx(s, rx + 0.3, dy + 4 * 0.47 - 0.04, rw - 0.6, 0.3,
       [{"runs": [{"t": "※ 以上为模拟案例示意，替换为真实审查演示时请同步更新数据。", "s": 9, "c": LGRAY}]}])
    # 网页截图占位
    sy = y0 + hh + 0.22
    phh = 1.35
    ph = box(s, 0.85, sy, 11.65, phh, fill=RGBColor(0xFA,0xFC,0xFE), line=RGBColor(0xAF,0xC3,0xDC), lw=1.1,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06)
    tx(s, 1.15, sy + 0.18, 4.0, 0.35,
       [{"runs": [{"t": "🖼 网页截图占位框", "s": 13, "b": True, "c": ACCENT_DK}]}])
    tx(s, 1.15, sy + 0.55, 10.9, 0.7,
       [{"runs": [{"t": "此处建议替换为 AI 合同审查系统真实页面截图（推荐 1920×1080 或 16:9 大图，独立图片对象，可随时更换）。", "s": 12, "c": GRAY}], "ls": 1.25}])
    footer(s, 9)
    note(s, "【答辩口述】这是我们最想现场演示的爆点功能。左侧是合同上传入口，支持PDF、Word和图片；右侧是AI生成的风险报告——上传一份模拟租房合同后，系统给出综合风险得分与高中低风险数量，并逐条列出风险条款、风险原因、修改建议和法律依据。现场可上传真实合同做演示，形成强记忆点。\n【配图建议】1) 网页端合同上传与报告页完整截图（1920×1080）放于底部占位框 2) 手机端演示录屏片段 3) 风险条款高亮标注对比图。\n【修改提醒】右侧所有示例数据（得分72、0/3/5、条款与依据）均为占位，请替换为演示系统的真实输出；底部占位框内为独立图片，右键可“更改图片”。")

# ============================================================ P10 AI维权助手
def p10_assistant(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "AI 维权助手", kicker="PART 08 · 功能演示｜AI法律行动助手", page=10)
    # 顶部对话演示
    y0 = 1.4
    # 用户气泡
    ub = box(s, 1.0, y0, 6.4, 0.62, fill=NAVY2, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    stext(ub, [{"runs": [{"t": "🙋 用户提问：", "s": 12.5, "b": True, "c": RGBColor(0x9E,0xD0,0xF0)},
                          {"t": "“房东扣我 2000 元押金不退，怎么办？”", "s": 14.5, "b": True, "c": WHITE}], "align": PP_ALIGN.LEFT}], ml=0.25)
    # AI气泡
    ab = box(s, 1.0, y0 + 0.8, 11.35, 1.15, fill=WHITE, line=LINE, lw=1.0,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
    tx(s, 1.3, y0 + 0.95, 10.8, 0.9,
       [{"runs": [{"t": "🤖 法护启航：", "s": 12.5, "b": True, "c": ACCENT_DK},
                  {"t": "别慌，按这 4 步走：① 先固定证据（租赁合同、押金收据、转账记录、沟通记录）→ ② 判断违约与管辖 → ③ 先发书面催告，再走社区/司法所调解 → ④ 需要时生成《押金退还律师函》草稿。", "s": 13, "c": INK}], "ls": 1.3}])
    # 执行链路
    ty = y0 + 2.35
    tx(s, 1.0, ty, 6.0, 0.4,
       [{"runs": [{"t": "执行链路：从“问答”到“行动”", "s": 14.5, "b": True, "c": NAVY}]}])
    chain = [("风险判断", "先定性、别踩坑"), ("证据清单", "教你先固定证据"), ("维权路径", "调解/投诉/诉讼分级"), ("法律文书生成", "一键生成文书草稿")]
    cw, ch = 2.72, 0.86
    x0 = 1.0
    yy = ty + 0.5
    for i, (t, sub) in enumerate(chain):
        x = x0 + i * (cw + 0.14)
        cc = [NAVY2, NAVY3, BLUE, ACCENT_DK][i]
        sp = box(s, x, yy, cw, ch, fill=WHITE, line=cc, lw=1.4,
                 shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.12)
        box(s, x, yy, 0.1, ch, fill=cc)
        tx(s, x + 0.25, yy + 0.13, cw - 0.4, 0.4,
           [{"runs": [{"t": "STEP %d  %s" % (i + 1, t), "s": 14, "b": True, "c": NAVY}]}])
        tx(s, x + 0.25, yy + 0.5, cw - 0.4, 0.32,
           [{"runs": [{"t": sub, "s": 10, "c": GRAY}]}])
        if i < 3:
            ar = box(s, x + cw + 0.012, yy + ch / 2 - 0.12, 0.115, 0.24, fill=RGBColor(0xAF,0xC3,0xDC), shape=MSO_SHAPE.RIGHT_ARROW)
    # 对比条
    cy = yy + ch + 0.45
    # 普通AI
    bad = box(s, 1.0, cy, 5.6, 1.05, fill=RED_T, line=RGBColor(0xE8,0xB4,0xB4), lw=1.0,
              shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
    tx(s, 1.3, cy + 0.16, 5.0, 0.8,
       [{"runs": [{"t": "❌ 普通 AI 闲聊问答：", "s": 13, "b": True, "c": RED}], "sa": 4},
        {"runs": [{"t": "只给一段“通用法律建议”，说完了，你还是不知道下一步做什么。", "s": 11.5, "c": INK}], "ls": 1.15}])
    # 法护启航
    good = box(s, 6.8, cy, 5.55, 1.05, fill=GRN_T, line=RGBColor(0x9F,0xD9,0xC2), lw=1.0,
               shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.1)
    tx(s, 7.1, cy + 0.16, 5.0, 0.8,
       [{"runs": [{"t": "✅ 法护启航 AI 维权助手：", "s": 13, "b": True, "c": RGBColor(0x1E,0x8A,0x60)}], "sa": 4},
        {"runs": [{"t": "判断风险 → 给证据清单 → 给维权路径 → 生成法律文书，把“建议”变成“行动”。", "s": 11.5, "c": INK}], "ls": 1.15}])
    # 底部强调
    tx(s, 1.0, cy + 1.28, 11.35, 0.4,
       [{"runs": [{"t": "核心差异：", "s": 13, "b": True, "c": GOLD},
                  {"t": "普通 AI 只回答“法律是什么”；法护启航回答“你现在该怎么做”。", "s": 14, "b": True, "c": NAVY}], "align": PP_ALIGN.CENTER}])
    footer(s, 10)
    note(s, "【答辩口述】以“房东扣2000元押金”为例：普通AI只会给你一段通用法条；法护启航则会走完整执行链路——先判断风险性质，再告诉你第一步固定哪些证据，然后给出调解、投诉、诉讼分级路径，最后直接生成《押金退还律师函》草稿。这正是我们区别于普通AI闲聊问答的关键：我们不生产“正确的废话”，我们输出“可执行的行动”。\n【配图建议】1) 对话式产品界面录屏（用户提问→四步引导→文书生成）2) 生成的法律文书PDF样张（脱敏）3) 微信/网页端交互截图。\n【修改提醒】示例提问与AI回复文案可替换为其他高频问题（如兼职欠薪、试用期辞退）；执行链路四步文案可按产品实际交互调整。")

# ============================================================ P11 项目创新点
def p11_innovation(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "项目创新点", kicker="PART 09 · 四个“不一样”", page=11)
    inn = [
        ("①", "本地化 · 场景化风险画像", "针对呈贡大学城大学生，结合本地租房、兼职与就业真实案例，完成本地化、场景化的法律风险画像，让风险提示“贴得近、说得准”。", NAVY2),
        ("②", "从“问答”到“行动导航”", "将普通 AI 法律问答升级为 AI 维权行动导航服务：不仅告诉“对不对”，更告诉“先做什么、找谁、怎么写”。", BLUE),
        ("③", "证据留存前置化", "把证据留存意识与“证据急救”工具引入大学生法律防护体系，在风险发生前就教会学生固定证据。", ACCENT_DK),
        ("④", "多方协同服务机制", "搭建“AI + 高校 + 社区 + 司法所 + 法律援助”多方协同服务机制，实现“AI 给方案、人来兜底”。", RGBColor(0x0E,0x8F,0x8F)),
    ]
    cw, chh = 5.95, 2.28
    gapx, gapy = 0.28, 0.32
    x0, y0 = 0.82, 1.55
    for i, (num, t, d, cc) in enumerate(inn):
        r, c = divmod(i, 2)
        x = x0 + c * (cw + gapx)
        y = y0 + r * (chh + gapy)
        card = box(s, x, y, cw, chh, fill=CARD, line=LINE, lw=1.0,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
        circ = box(s, x + 0.32, y + 0.3, 0.72, 0.72, fill=cc, shape=MSO_SHAPE.OVAL)
        stext(circ, [{"runs": [{"t": num, "s": 22, "b": True, "c": WHITE}]}])
        tx(s, x + 1.3, y + 0.34, cw - 1.7, 0.7,
           [{"runs": [{"t": t, "s": 17, "b": True, "c": NAVY}], "ls": 1.05}])
        tx(s, x + 0.35, y + 1.25, cw - 0.7, 0.95,
           [{"runs": [{"t": d, "s": 12, "c": GRAY}], "ls": 1.3}])
    footer(s, 11)
    note(s, "【答辩口述】我们的创新点可以概括为四个“不一样”：一是画像不一样——针对呈贡大学城学生做本地化场景化风险画像；二是服务不一样——把AI问答升级为AI维权行动导航；三是防护不一样——把证据留存意识前置到风险发生之前；四是机制不一样——搭建AI+高校+社区+司法所+法律援助的多方协同机制。\n【配图建议】1) 风险画像词云/雷达图 2) 产品“问答→行动”对比截图 3) 多方协同机制示意图（可用图标组合）。\n【修改提醒】四点标题与描述可压缩为更口语化的短句；如需强调某一点可加大字号或换色。")

# ============================================================ P12 实践成果
def p12_results(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "实践成果", kicker="PART 10 · 阶段性成果盘点", page=12)
    items = [
        ("🖥️", "网站交互原型"),
        ("🤖", "AI合同审查Demo"),
        ("💬", "AI法律问答引擎"),
        ("🧭", "风险测评模型"),
        ("📚", "大学生法律案例数据库"),
        ("🗺️", "法律服务地图"),
        ("🗄️", "调研数据库"),
        ("🤝", "法律咨询对外合作机制"),
    ]
    cw, chh = 2.86, 1.72
    gapx, gapy = 0.2, 0.3
    x0, y0 = 0.85, 1.6
    for i, (em, t) in enumerate(items):
        r, c = divmod(i, 4)
        x = x0 + c * (cw + gapx)
        y = y0 + r * (chh + gapy)
        card = box(s, x, y, cw, chh, fill=CARD, line=LINE, lw=1.0,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
        box(s, x, y, 0.09, chh, fill=NAVY2 if r == 0 else ACCENT_DK)
        tx(s, x + 0.25, y + 0.22, cw - 0.4, 0.6,
           [{"runs": [{"t": em, "s": 24, "c": NAVY}]}])
        tx(s, x + 0.25, y + 0.88, cw - 0.45, 0.75,
           [{"runs": [{"t": "☑ ", "s": 13, "b": True, "c": GREEN},
                      {"t": t, "s": 13.5, "b": True, "c": INK}], "ls": 1.1}])
    tx(s, 0.9, 6.45, 11.5, 0.4,
       [{"runs": [{"t": "以上成果均可在现场演示，并支持边答辩边打开原型/后台，让评委“看得见、点得动”。", "s": 12.5, "b": True, "c": ACCENT_DK}], "align": PP_ALIGN.CENTER}])
    footer(s, 12)
    note(s, "【答辩口述】目前我们已经产出了八项可展示的实践成果：网站交互原型、AI合同审查Demo、AI法律问答引擎、风险测评模型、大学生法律案例数据库、法律服务地图、调研数据库，以及法律咨询对外合作机制。每一项都可以现场打开演示，真正做到成果“看得见、点得动”。\n【配图建议】1) 每个成果对应的界面截图小图（可放入对应卡片）2) 团队开发/测试工作照 3) 数据库与后台页面截图。\n【修改提醒】八项成果均为已完成项；若某项尚未完成建议改为“进行中”标签，切勿在答辩中被追问时无法演示。")

# ============================================================ P13 实践效果对比
def p13_compare(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "实践效果对比", kicker="PART 11 · 效果验证（高分亮点）", page=13, gold_tag="★ 亮点")
    # 左: 前后两栏
    y0 = 1.5
    # 实践前
    ph = box(s, 0.85, y0, 5.15, 2.35, fill=RED_T, line=RGBColor(0xE8,0xB4,0xB4), lw=1.0,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
    tx(s, 1.15, y0 + 0.16, 4.4, 0.4,
       [{"runs": [{"t": "实践前 · 风险盲区（基线）", "s": 14.5, "b": True, "c": RED}]}])
    pre = [("不知道风险", "【XXX】%"), ("不知道证据留存", "【XXX】%"), ("不了解维权渠道", "【XXX】%")]
    py = y0 + 0.72
    for i, (lab, val) in enumerate(pre):
        yy = py + i * 0.5
        tx(s, 1.15, yy, 2.5, 0.4, [{"runs": [{"t": lab, "s": 13, "c": INK}]}], anchor=MSO_ANCHOR.MIDDLE)
        tx(s, 3.35, yy, 2.4, 0.4,
           [{"runs": [{"t": val, "s": 16, "b": True, "c": RED}], "align": PP_ALIGN.RIGHT}], anchor=MSO_ANCHOR.MIDDLE)
    # 实践后
    qh = box(s, 0.85, y0 + 2.6, 5.15, 2.35, fill=GRN_T, line=RGBColor(0x9F,0xD9,0xC2), lw=1.0,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
    tx(s, 1.15, y0 + 2.76, 4.6, 0.4,
       [{"runs": [{"t": "实践后 · 能力提升", "s": 14.5, "b": True, "c": RGBColor(0x1E,0x8A,0x60)}]}])
    post = [("风险识别能力提升", "【XXX】%"), ("证据留存意识提升", "【XXX】%"), ("维权路径认知提升", "【XXX】%")]
    py = y0 + 3.32
    for i, (lab, val) in enumerate(post):
        yy = py + i * 0.5
        tx(s, 1.15, yy, 2.5, 0.4, [{"runs": [{"t": lab, "s": 13, "c": INK}]}], anchor=MSO_ANCHOR.MIDDLE)
        tx(s, 3.35, yy, 2.4, 0.4,
           [{"runs": [{"t": val, "s": 16, "b": True, "c": RGBColor(0x1E,0x8A,0x60)}], "align": PP_ALIGN.RIGHT}], anchor=MSO_ANCHOR.MIDDLE)
    # 右: 对比柱状图（原生可编辑）
    rx, rw = 6.3, 6.2
    box(s, rx, y0, rw, 4.45, fill=CARD, line=LINE, lw=1.0, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.05)
    tx(s, rx + 0.3, y0 + 0.2, 5.6, 0.4,
       [{"runs": [{"t": "实践前后能力对比（示意图，双击图表改数据）", "s": 14, "b": True, "c": NAVY}]}])
    cd = CategoryChartData()
    cd.categories = ["风险识别能力", "证据留存意识", "维权路径认知"]
    cd.add_series("实践前（掌握度）", (30, 26, 22))
    cd.add_series("实践后（掌握度）", (85, 88, 82))
    gf = s.shapes.add_chart(XL_CHART_TYPE.COLUMN_CLUSTERED, In(rx + 0.35), In(y0 + 0.75), In(rw - 0.7), In(2.95), cd)
    ch = gf.chart
    ch.has_legend = True
    ch.legend.position = XL_LEGEND_POSITION.BOTTOM
    ch.legend.include_in_layout = False
    try:
        ch.font.size = Pt(10.5)
        ch.font.name = F
    except Exception:
        pass
    plot = ch.plots[0]
    plot.gap_width = 120
    plot.has_data_labels = True
    dl = plot.data_labels
    dl.show_value = True
    dl.number_format = '0"%"'
    dl.number_format_is_linked = False
    try:
        va = ch.value_axis
        va.minimum_scale = 0
        va.maximum_scale = 100
        va.has_major_gridlines = True
        va.tick_labels.number_format = '0"%"'
        va.tick_labels.number_format_is_linked = False
    except Exception:
        pass
    try:
        cols = [RGBColor(0xAF,0xC3,0xDC), ACCENT_DK]
        for i, ser in enumerate(ch.series):
            ser.format.fill.solid()
            ser.format.fill.fore_color.rgb = cols[i]
    except Exception:
        pass
    tx(s, rx + 0.3, y0 + 3.95, rw - 0.6, 0.4,
       [{"runs": [{"t": "※ 柱状图为原生图表：双击 → “编辑数据”填入实测值；“【XXX】%”文字请同步更新。", "s": 9.5, "c": LGRAY}], "ls": 1.15}])
    footer(s, 13)
    note(s, "【答辩口述】我们用同一套问卷在实践前后做了对比测试：实践前，不知道风险、不知道证据留存、不了解维权渠道的比例分别是【XXX】%、【XXX】%和【XXX】%；经过测评、宣讲与工具试用，风险识别能力、证据留存意识、维权路径认知分别提升了【XXX】%、【XXX】%和【XXX】%。右侧柱状图直观显示：掌握度从两成上下提升到八成以上。效果是看得见的。\n【配图建议】1) 前后测问卷对比截图 2) 试点高校宣讲/工作坊现场照片 3) 用研后台的答题正确率趋势图。\n【修改提醒】左侧六处【XXX】% 与右侧柱状图数值均为占位；柱状图是 PowerPoint 原生图表，双击后选“编辑数据”即可替换为实测数据并自动更新图形。")

# ============================================================ P14 推广模式
def p14_roadmap(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, BG)
    header(s, "推广模式：分阶段落地路线", kicker="PART 12 · 从呈贡到全国", page=14)
    phases = [
        ("第一阶段", "呈贡大学城", "试点打磨，跑通“AI + 多方协同”服务闭环", NAVY2),
        ("第二阶段", "昆明市内高校", "复制推广，覆盖在昆高校学生群体", BLUE),
        ("第三阶段", "云南省全部高校", "全省铺开，按本地法律资源完成配置", ACCENT_DK),
        ("第四阶段", "面向全国高校推广", "输出模式，适配各地法律服务资源", RGBColor(0x0E,0x8F,0x8F)),
    ]
    cw, chh = 2.86, 2.6
    gapx = 0.2
    x0, y0 = 0.85, 2.1
    # 顶部时间轴
    for i in range(4):
        cx = x0 + i * (cw + gapx) + cw / 2
        circ = box(s, cx - 0.2, y0 - 0.45, 0.4, 0.4, fill=[NAVY2, BLUE, ACCENT_DK, RGBColor(0x0E,0x8F,0x8F)][i], shape=MSO_SHAPE.OVAL)
        stext(circ, [{"runs": [{"t": str(i + 1), "s": 15, "b": True, "c": WHITE}]}])
        if i < 3:
            box(s, cx + 0.22, y0 - 0.27, gapx + cw - 0.4, 0.05, fill=RGBColor(0xAF,0xC3,0xDC))
    for i, (phase, place, desc, cc) in enumerate(phases):
        x = x0 + i * (cw + gapx)
        card = box(s, x, y0 + 0.15, cw, chh, fill=CARD, line=LINE, lw=1.0,
                   shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08)
        box(s, x, y0 + 0.15, cw, 0.42, fill=cc, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
        tx(s, x + 0.15, y0 + 0.24, cw - 0.3, 0.3,
           [{"runs": [{"t": phase, "s": 13, "b": True, "c": WHITE}], "align": PP_ALIGN.CENTER}])
        tx(s, x + 0.2, y0 + 0.75, cw - 0.4, 0.85,
           [{"runs": [{"t": place, "s": 16.5, "b": True, "c": NAVY}], "align": PP_ALIGN.CENTER, "ls": 1.1}])
        tx(s, x + 0.22, y0 + 1.72, cw - 0.44, 0.9,
           [{"runs": [{"t": desc, "s": 11, "c": GRAY}], "align": PP_ALIGN.CENTER, "ls": 1.25}])
    # 本地化说明
    bb = box(s, 0.85, 5.35, 11.65, 0.9, fill=NAVY, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.14)
    stext(bb, [{"runs": [{"t": "💡 平台能力：", "s": 14, "b": True, "c": GOLD},
                          {"t": "支持根据各地法律服务资源完成本地化配置 —— 换一座城，更新本地法规、机构与案例即可复用。", "s": 15.5, "b": True, "c": WHITE}], "align": PP_ALIGN.LEFT}], ml=0.4)
    tx(s, 0.9, 6.45, 11.5, 0.4,
       [{"runs": [{"t": "“呈贡模式”可复制、可扩展：先在一个大学城跑通，再向全省、全国高校输出。", "s": 12.5, "b": True, "c": ACCENT_DK}], "align": PP_ALIGN.CENTER}])
    footer(s, 14)
    note(s, "【答辩口述】推广按四阶段推进：第一阶段在呈贡大学城试点打磨、跑通闭环；第二阶段扩展到昆明市内高校；第三阶段覆盖云南省全部高校，并按各地法律资源做本地化配置；第四阶段面向全国高校输出模式。因为平台本身支持本地法规、机构与案例库的配置，所以复制到其他城市成本很低。\n【配图建议】1) 云南/呈贡→昆明→全省→全国的地图扩散动效截图 2) 已对接高校/机构清单表格 3) 平台后台“城市配置”界面截图。\n【修改提醒】各阶段时间与目标可补充里程碑（如“2026年内完成第二阶段”）；地图类图片若加入请勿遮挡文字。")

# ============================================================ P15 结束页
def p15_end(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg(s, NAVY)
    c1 = box(s, -1.8, -1.8, 5.0, 5.0, fill=NAVY2, shape=MSO_SHAPE.OVAL)
    alpha(c1, 50)
    c2 = box(s, 10.6, 4.9, 4.2, 4.2, fill=ACCENT, shape=MSO_SHAPE.OVAL)
    alpha(c2, 14)
    add_logo(s, 0.42, 0.4, 0.78)
    # 标语
    tx(s, 0.8, 2.5, 11.75, 1.2,
       [{"runs": [{"t": "“", "s": 44, "b": True, "c": GOLD},
                  {"t": "让AI懂法律，更让大学生懂得保护自己。", "s": 34, "b": True, "c": WHITE},
                  {"t": "”", "s": 44, "b": True, "c": GOLD}], "align": PP_ALIGN.CENTER, "ls": 1.1}])
    box(s, 5.9, 3.95, 1.5, 0.06, fill=ACCENT)
    tx(s, 0.8, 4.3, 11.75, 0.6,
       [{"runs": [{"t": "法护启航 · AI赋能大学生全周期法律风险防护实践", "s": 17, "b": True, "c": RGBColor(0xCF,0xE0,0xF5)}], "align": PP_ALIGN.CENTER}])
    tx(s, 0.8, 5.0, 11.75, 0.5,
       [{"runs": [{"t": "谢谢聆听 · 恳请各位评委老师批评指正", "s": 15, "c": RGBColor(0x9E,0xB4,0xD0)}], "align": PP_ALIGN.CENTER}])
    # 页脚团队
    sp = box(s, 3.92, 6.35, 5.5, 0.62, fill=NAVY2, line=RGBColor(0x3E,0x63,0x9E), lw=0.75,
             shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.5)
    alpha(sp, 70)
    stext(sp, [{"runs": [{"t": "团队名称：云南大学【XXX】大学生创新实践团队", "s": 12.5, "b": True, "c": WHITE}]}])
    note(s, "【答辩口述】最后用一句话总结我们的初心：让AI懂法律，更让大学生懂得保护自己。感谢各位评委老师的聆听，恳请批评指正！\n【配图建议】背景可放 1 张半透明压底的呈贡大学城/云大会泽院照片，或团队集体照剪影；也可在右下角放项目二维码便于评委扫码体验 Demo。\n【修改提醒】页脚团队名称中的【XXX】请替换为真实团队名；如需增加联系方式/二维码，请在右下角空白处插入独立图片。")

# ============================================================ 组装
def build():
    prs = Presentation()
    prs.slide_width = In(13.333)
    prs.slide_height = In(7.5)
    p1_cover(prs)
    p2_intro(prs)
    p3_dashboard(prs)
    p4_route(prs)
    p5_results(prs)
    p6_pain(prs)
    p7_solution(prs)
    p8_arch(prs)
    p9_contract(prs)
    p10_assistant(prs)
    p11_innovation(prs)
    p12_results(prs)
    p13_compare(prs)
    p14_roadmap(prs)
    p15_end(prs)
    prs.save(OUT)
    print("SAVED:", OUT, "slides:", len(prs.slides._sldIdLst))

if __name__ == "__main__":
    build()
