/* ============================================================
   WEQAA Contracts & BOQ Dashboard — vanilla JS, no dependencies.
   Self-contained SVG charts. RTL Arabic + English toggle.
   ============================================================ */
(function () {
  "use strict";

  // ---------------------------------------------------------------
  // 0. Data prep
  // ---------------------------------------------------------------
  var RAW = window.WEQAA_DATA || { boq: [], completed: [] };
  RAW.boq.forEach(function (r) { r._status = "boq"; });
  RAW.completed.forEach(function (r) { r._status = "completed"; });
  var ALL = RAW.boq.concat(RAW.completed);
  ALL.forEach(function (r) {
    r.totalValue = r.totalValue || 0;
    r.execValue = r.execValue || 0;
    r.remValue = r.remValue || 0;
    r._year = r.startDate ? +r.startDate.slice(0, 4) : null;
    r._exec = r.totalValue > 0 ? r.execValue / r.totalValue : 0;
  });
  var TODAY = "2026-07-07";

  // ---------------------------------------------------------------
  // 1. i18n
  // ---------------------------------------------------------------
  var I18N = {
    ar: {
      appTitle: "لوحة متابعة العقود وجداول الكميات",
      appSub: "المركز الوطني للوقاية من الآفات النباتية والأمراض الحيوانية",
      asof: "محدّثة حتى", cur: "ريال",
      stAll: "الكل", stBoq: "عقود جارية", stDone: "مشاريع مكتملة",
      fSector: "القطاع", fDomain: "المجال الرئيسي", fDept: "الإدارة المالكة",
      fCompany: "الشركة المنفذة", fYear: "سنة بداية العقد", reset: "إعادة تعيين",
      secTrends: "الاتجاه الزمني", secCompare: "المقارنات", secInsights: "أبرز الملاحظات", secTable: "تفاصيل البنود",
      c_burn: "القيمة المتعاقد عليها مقابل المنفذة (تراكمي حسب شهر البداية)",
      c_newc: "عدد العقود المبدوءة عبر الزمن",
      c_sector: "القيمة حسب القطاع (متعاقد / منفذ / متبقٍ)",
      c_dept: "نسبة التنفيذ حسب الإدارة المالكة",
      c_domain: "توزيع الإنفاق حسب المجال الرئيسي",
      c_sub: "أكبر المجالات الفرعية بالقيمة",
      c_contractor: "أعلى 10 شركات بقيمة المنفذ",
      c_remsector: "الميزانية المتبقية حسب القطاع",
      c_progress: "تقدم تنفيذ العقود (أعلى 12 عقداً بالقيمة)",
      c_scatter: "القيمة مقابل نسبة التنفيذ", c_scatter_h: "حجم الفقاعة = المتبقي",
      c_gantt: "الجدول الزمني للعقود (البداية ← النهاية)",
      searchPh: "بحث في البنود والمشاريع والشركات…", csv: "تصدير CSV",
      footer: "لوحة تفاعلية — مبنية من بيانات جداول الكميات والمشاريع المكتملة · مركز وقاء",
      kTotal: "إجمالي القيمة المتعاقد عليها", kExec: "القيمة المنفذة", kRem: "القيمة المتبقية",
      kRate: "نسبة التنفيذ المالي", kContracts: "عدد العقود", kItems: "بند", kCompanies: "عدد الشركات المنفذة",
      contracted: "متعاقد عليه", executed: "منفذ", remaining: "متبقٍ", cumContracted: "متعاقد تراكمي", cumExecuted: "منفذ تراكمي",
      contracts: "عقد", value: "القيمة", rate: "التنفيذ", noData: "لا توجد بيانات مطابقة للتصفية",
      tCol: ["#", "القطاع", "الإدارة", "المشروع", "الشركة", "البند", "الوحدة", "المتعاقد", "المنفذ", "المتبقي", "التنفيذ"],
      allSel: "الكل", nSel: "محدد", of: "من", rows: "بند", page: "صفحة",
      insHiExec: "أعلى قطاع تنفيذاً", insLoExec: "أدنى قطاع تنفيذاً", insBigRem: "أكبر ميزانية غير منفقة",
      insOverdue: "عقود متأخرة (تجاوزت النهاية ودون اكتمال)", insTopCo: "الأكثر تعاقداً", insGap: "الفجوة حتى الاكتمال (100%)",
      atRisk: "قيمة معرّضة", inContract: "ضمن العقد", contractsWord: "عقود"
    },
    en: {
      appTitle: "Contracts & Bill-of-Quantities Dashboard",
      appSub: "National Center for the Prevention & Control of Plant Pests & Animal Diseases",
      asof: "As of", cur: "SAR",
      stAll: "All", stBoq: "Active", stDone: "Completed",
      fSector: "Sector", fDomain: "Main Domain", fDept: "Owning Dept.",
      fCompany: "Contractor", fYear: "Contract start year", reset: "Reset",
      secTrends: "Trends over time", secCompare: "Comparisons", secInsights: "Key insights", secTable: "Line-item details",
      c_burn: "Contracted vs Executed value (cumulative by start month)",
      c_newc: "Contracts started over time",
      c_sector: "Value by sector (contracted / executed / remaining)",
      c_dept: "Execution rate by owning department",
      c_domain: "Spend distribution by main domain",
      c_sub: "Top sub-domains by value",
      c_contractor: "Top 10 contractors by executed value",
      c_remsector: "Remaining budget by sector",
      c_progress: "Contract execution progress (top 12 by value)",
      c_scatter: "Value vs execution rate", c_scatter_h: "bubble = remaining",
      c_gantt: "Contract timeline (start → end)",
      searchPh: "Search items, projects, contractors…", csv: "Export CSV",
      footer: "Interactive dashboard — built from BOQ & completed-project data · WEQAA Center",
      kTotal: "Total contracted value", kExec: "Executed value", kRem: "Remaining value",
      kRate: "Financial execution rate", kContracts: "Contracts", kItems: "items", kCompanies: "Contractors",
      contracted: "Contracted", executed: "Executed", remaining: "Remaining", cumContracted: "Cum. contracted", cumExecuted: "Cum. executed",
      contracts: "contracts", value: "Value", rate: "Exec.", noData: "No data matches the current filters",
      tCol: ["#", "Sector", "Dept.", "Project", "Contractor", "Item", "Unit", "Contracted", "Executed", "Remaining", "Exec."],
      allSel: "All", nSel: "selected", of: "of", rows: "items", page: "Page",
      insHiExec: "Highest-execution sector", insLoExec: "Lowest-execution sector", insBigRem: "Largest unspent budget",
      insOverdue: "Overdue contracts (past end, <100%)", insTopCo: "Most contracts", insGap: "Gap to completion (100%)",
      atRisk: "value at risk", inContract: "in contract", contractsWord: "contracts"
    }
  };
  var lang = "ar";
  function t(k) { return I18N[lang][k] !== undefined ? I18N[lang][k] : k; }

  // ---------------------------------------------------------------
  // 2. Formatting helpers
  // ---------------------------------------------------------------
  function fmtFull(n) { return Math.round(n).toLocaleString(lang === "ar" ? "ar-EG" : "en-US"); }
  function fmtCompact(n) {
    var a = Math.abs(n), s;
    if (a >= 1e9) s = (n / 1e9).toFixed(a >= 1e10 ? 0 : 1) + "B";
    else if (a >= 1e6) s = (n / 1e6).toFixed(a >= 1e7 ? 0 : 1) + "M";
    else if (a >= 1e3) s = (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "K";
    else s = Math.round(n).toString();
    return s;
  }
  function pct(x) { return (x * 100).toFixed(x >= 0.995 ? 0 : 1) + "%"; }
  function healthClass(x) { return x >= 0.75 ? "ok" : x >= 0.4 ? "warn" : "crit"; }
  function healthColor(x) { return x >= 0.75 ? "var(--ok)" : x >= 0.4 ? "var(--warn)" : "var(--crit)"; }
  var CATS = ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6", "--c7"];
  function cat(i) { return "var(" + CATS[i % CATS.length] + ")"; }

  // ---------------------------------------------------------------
  // 3. State + filtering
  // ---------------------------------------------------------------
  var years = ALL.map(function (r) { return r._year; }).filter(Boolean);
  var YMIN = Math.min.apply(null, years), YMAX = Math.max.apply(null, years);
  var state = {
    status: "all",
    sector: new Set(), mainDomain: new Set(), dept: new Set(), company: new Set(),
    y0: YMIN, y1: YMAX, search: "", page: 0, sortKey: "totalValue", sortDir: -1
  };

  function filtered() {
    return ALL.filter(function (r) {
      if (state.status !== "all" && r._status !== state.status) return false;
      if (state.sector.size && !state.sector.has(r.sector)) return false;
      if (state.mainDomain.size && !state.mainDomain.has(r.mainDomain)) return false;
      if (state.dept.size && !state.dept.has(r.dept)) return false;
      if (state.company.size && !state.company.has(r.company)) return false;
      if (r._year != null && (r._year < state.y0 || r._year > state.y1)) return false;
      return true;
    });
  }

  // aggregation helpers
  function groupSum(rows, keyFn) {
    var m = new Map();
    rows.forEach(function (r) {
      var k = keyFn(r); if (k == null || k === "") return;
      var o = m.get(k) || { key: k, total: 0, exec: 0, rem: 0, n: 0, contracts: new Set() };
      o.total += r.totalValue; o.exec += r.execValue; o.rem += r.remValue; o.n++;
      if (r.contractNo) o.contracts.add(r.contractNo);
      m.set(k, o);
    });
    return Array.from(m.values());
  }

  // ---------------------------------------------------------------
  // 4. Tiny SVG toolkit
  // ---------------------------------------------------------------
  var NS = "http://www.w3.org/2000/svg";
  function svg(w, h) {
    var e = document.createElementNS(NS, "svg");
    e.setAttribute("viewBox", "0 0 " + w + " " + h);
    e.setAttribute("preserveAspectRatio", "xMidYMid meet");
    e.style.width = "100%"; e.style.height = "auto";
    return e;
  }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(parent, x, y, s, cls, extra) {
    var e = el("text", Object.assign({ x: x, y: y, class: cls }, extra || {}), parent);
    e.textContent = s; return e;
  }
  function roundRectPath(x, y, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    return "M" + (x + r) + "," + y + " h" + (w - 2 * r) + " a" + r + "," + r + " 0 0 1 " + r + "," + r +
      " v" + (h - 2 * r) + " a" + r + "," + r + " 0 0 1 " + (-r) + "," + r + " h" + (-(w - 2 * r)) +
      " a" + r + "," + r + " 0 0 1 " + (-r) + "," + (-r) + " v" + (-(h - 2 * r)) +
      " a" + r + "," + r + " 0 0 1 " + r + "," + (-r) + " z";
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }
  function emptyState(node) { node.innerHTML = '<div class="empty">' + t("noData") + "</div>"; }

  // tooltip
  var TT = document.getElementById("tooltip");
  function ttShow(html, ev) {
    TT.innerHTML = html; TT.hidden = false;
    var pad = 14, r = TT.getBoundingClientRect();
    var x = ev.clientX + pad, y = ev.clientY + pad;
    if (x + r.width > window.innerWidth) x = ev.clientX - r.width - pad;
    if (y + r.height > window.innerHeight) y = ev.clientY - r.height - pad;
    TT.style.left = Math.max(6, x) + "px"; TT.style.top = Math.max(6, y) + "px";
  }
  function ttHide() { TT.hidden = true; }
  function hoverable(node, htmlFn) {
    node.style.cursor = "default";
    node.addEventListener("mousemove", function (ev) { ttShow(htmlFn(), ev); });
    node.addEventListener("mouseleave", ttHide);
  }
  function ttRow(label, val, color) {
    return '<div class="tt-r"><span class="k">' + (color ? '<span class="tt-dot" style="background:' + color + '"></span>' : "") +
      label + '</span><span class="v">' + val + "</span></div>";
  }

  // shared legend builder
  function legend(container, items) {
    var l = document.createElement("div"); l.className = "legend";
    items.forEach(function (it) {
      l.insertAdjacentHTML("beforeend",
        '<span class="legend-item"><span class="legend-swatch" style="background:' + it.color + '"></span>' + it.label + "</span>");
    });
    container.appendChild(l);
  }

  // ---------------------------------------------------------------
  // 5. Chart: horizontal bar (sorted) — used by dept, contractors, sub, remaining
  // ---------------------------------------------------------------
  function hbar(node, rows, opts) {
    clear(node);
    if (!rows.length) return emptyState(node);
    opts = opts || {};
    var W = 560, rowH = 30, padT = 8, padB = 6;
    var labelW = opts.labelW || 190, valW = 62;
    var H = padT + padB + rows.length * rowH;
    var plotW = W - labelW - valW;
    var max = Math.max.apply(null, rows.map(function (d) { return d.value; })) || 1;
    var s = svg(W, H);
    rows.forEach(function (d, i) {
      var y = padT + i * rowH, bh = 15, by = y + (rowH - bh) / 2;
      var bw = Math.max(2, (d.value / max) * plotW);
      var color = opts.color ? opts.color(d, i) : cat(i);
      // label (right side in RTL layout — anchored to plot start)
      var lbl = el("text", { x: W - 4, y: by + bh / 2 + 3.5, class: "axis-txt", "text-anchor": "end" }, s);
      lbl.textContent = ellipsis(d.key, opts.labelChars || 26);
      // bar starts from right edge of label area growing left (RTL) -> we draw from x=valW
      var g = el("g", { class: "bar-mark" }, s);
      el("path", { d: roundRectPath(valW, by, bw, bh, 4), fill: color }, g);
      // value at left end
      el("text", { x: valW + bw + 6, y: by + bh / 2 + 3.5, class: "val-lbl", "text-anchor": "start" }, s)
        .textContent = opts.fmt ? opts.fmt(d) : fmtCompact(d.value);
      hoverable(g, function () {
        return '<div class="tt-t">' + esc(d.key) + "</div>" +
          (opts.tt ? opts.tt(d) : ttRow(t("value"), fmtFull(d.value) + " " + t("cur"), color));
      });
    });
    node.appendChild(s);
    if (opts.legendItems) legend(node, opts.legendItems);
  }

  // ---------------------------------------------------------------
  // 6. Chart: grouped vertical bars by sector (contracted/exec/rem)
  // ---------------------------------------------------------------
  function groupedBars(node, rows, series) {
    clear(node);
    if (!rows.length) return emptyState(node);
    var W = 560, H = 300, padL = 46, padR = 12, padT = 12, padB = 62;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = 0;
    rows.forEach(function (d) { series.forEach(function (s) { max = Math.max(max, d[s.key]); }); });
    max = niceMax(max);
    var s = svg(W, H);
    // gridlines + y ticks
    yGrid(s, padL, padT, plotW, plotH, max, W - padR);
    var gW = plotW / rows.length, innerW = gW * 0.62, bw = innerW / series.length;
    rows.forEach(function (d, i) {
      var gx = padL + i * gW + (gW - innerW) / 2;
      series.forEach(function (se, j) {
        var v = d[se.key], bh = (v / max) * plotH, x = gx + j * bw, y = padT + plotH - bh;
        var g = el("g", { class: "bar-mark" }, s);
        el("path", { d: roundRectPath(x, y, bw - 2, Math.max(1, bh), 3), fill: se.color }, g);
        hoverable(g, function () {
          return '<div class="tt-t">' + esc(d.key) + "</div>" +
            series.map(function (ss) { return ttRow(ss.label, fmtFull(d[ss.key]) + " " + t("cur"), ss.color); }).join("");
        });
      });
      // x label (wrapped)
      wrapLabel(s, padL + i * gW + gW / 2, padT + plotH + 14, d.key, gW - 4);
    });
    node.appendChild(s);
    legend(node, series);
  }

  // ---------------------------------------------------------------
  // 7. Chart: cumulative area/line (burn-down) — contracted vs executed
  // ---------------------------------------------------------------
  function cumulativeLines(node, months, seriesDefs) {
    clear(node);
    if (!months.length) return emptyState(node);
    var W = 780, H = 300, padL = 48, padR = 14, padT = 12, padB = 46;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = 0;
    seriesDefs.forEach(function (sd) { sd.data.forEach(function (v) { max = Math.max(max, v); }); });
    max = niceMax(max);
    var n = months.length;
    var xAt = function (i) { return padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); };
    var yAt = function (v) { return padT + plotH - (v / max) * plotH; };
    var s = svg(W, H);
    yGrid(s, padL, padT, plotW, plotH, max, W - padR);
    // x ticks (sparse)
    var step = Math.ceil(n / 8);
    months.forEach(function (m, i) {
      if (i % step === 0 || i === n - 1) {
        txt(s, xAt(i), padT + plotH + 16, m, "tick-txt", { "text-anchor": "middle" });
      }
    });
    seriesDefs.forEach(function (sd) {
      var line = "", area = "";
      sd.data.forEach(function (v, i) {
        var X = xAt(i), Y = yAt(v);
        line += (i ? "L" : "M") + X + "," + Y + " ";
      });
      if (sd.fill) {
        area = line + "L" + xAt(n - 1) + "," + yAt(0) + " L" + xAt(0) + "," + yAt(0) + " Z";
        el("path", { d: area, fill: sd.color, "fill-opacity": 0.12, stroke: "none" }, s);
      }
      el("path", { d: line, fill: "none", stroke: sd.color, "stroke-width": 2.4, "stroke-linejoin": "round", "stroke-linecap": "round" }, s);
    });
    // hover crosshair
    var focus = el("line", { class: "grid-line", "stroke-dasharray": "3 3", opacity: 0 }, s);
    var dots = seriesDefs.map(function (sd) { return el("circle", { r: 4.5, fill: sd.color, stroke: "var(--surface)", "stroke-width": 2, opacity: 0 }, s); });
    var hit = el("rect", { x: padL, y: padT, width: plotW, height: plotH, fill: "transparent" }, s);
    hit.addEventListener("mousemove", function (ev) {
      var pt = localX(s, ev, W), i = Math.round(((pt - padL) / plotW) * (n - 1));
      i = Math.max(0, Math.min(n - 1, i)); if (isNaN(i)) return;
      var X = xAt(i);
      focus.setAttribute("x1", X); focus.setAttribute("x2", X);
      focus.setAttribute("y1", padT); focus.setAttribute("y2", padT + plotH); focus.setAttribute("opacity", 1);
      seriesDefs.forEach(function (sd, k) { dots[k].setAttribute("cx", X); dots[k].setAttribute("cy", yAt(sd.data[i])); dots[k].setAttribute("opacity", 1); });
      ttShow('<div class="tt-t">' + months[i] + "</div>" +
        seriesDefs.map(function (sd) { return ttRow(sd.label, fmtFull(sd.data[i]) + " " + t("cur"), sd.color); }).join(""), ev);
    });
    hit.addEventListener("mouseleave", function () { focus.setAttribute("opacity", 0); dots.forEach(function (d) { d.setAttribute("opacity", 0); }); ttHide(); });
    node.appendChild(s);
    legend(node, seriesDefs);
  }

  // ---------------------------------------------------------------
  // 8. Chart: simple column chart (contracts started per period)
  // ---------------------------------------------------------------
  function columns(node, rows, color, fmtV) {
    clear(node);
    if (!rows.length) return emptyState(node);
    var W = 380, H = 280, padL = 30, padR = 10, padT = 12, padB = 46;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = niceMax(Math.max.apply(null, rows.map(function (d) { return d.value; })) || 1);
    var s = svg(W, H);
    yGrid(s, padL, padT, plotW, plotH, max, W - padR, true);
    var gW = plotW / rows.length, bw = Math.min(38, gW * 0.6);
    rows.forEach(function (d, i) {
      var bh = (d.value / max) * plotH, x = padL + i * gW + (gW - bw) / 2, y = padT + plotH - bh;
      var g = el("g", { class: "bar-mark" }, s);
      el("path", { d: roundRectPath(x, y, bw, Math.max(1, bh), 3), fill: color }, g);
      if (d.value > 0) txt(s, x + bw / 2, y - 4, d.value, "val-lbl", { "text-anchor": "middle" });
      txt(s, padL + i * gW + gW / 2, padT + plotH + 16, d.key, "tick-txt", { "text-anchor": "middle" });
      hoverable(g, function () { return '<div class="tt-t">' + esc(d.key) + "</div>" + ttRow(fmtV || t("contracts"), d.value, color); });
    });
    node.appendChild(s);
  }

  // ---------------------------------------------------------------
  // 9. Chart: donut (spend by domain)
  // ---------------------------------------------------------------
  function donut(node, rows) {
    clear(node);
    if (!rows.length) return emptyState(node);
    var total = rows.reduce(function (a, d) { return a + d.value; }, 0) || 1;
    var W = 300, H = 250, cx = 100, cy = 125, R = 92, r = 56;
    var s = svg(W, H);
    var ang = -Math.PI / 2, gap = 0.018;
    rows.forEach(function (d, i) {
      var frac = d.value / total, a0 = ang + gap / 2, a1 = ang + frac * 2 * Math.PI - gap / 2;
      ang += frac * 2 * Math.PI;
      if (a1 <= a0) return;
      var color = cat(i);
      var g = el("g", { class: "bar-mark" }, s);
      el("path", { d: arcPath(cx, cy, R, r, a0, a1), fill: color }, g);
      hoverable(g, function () {
        return '<div class="tt-t">' + esc(d.key) + "</div>" +
          ttRow(t("value"), fmtFull(d.value) + " " + t("cur"), color) + ttRow("%", pct(frac));
      });
    });
    txt(s, cx, cy - 4, fmtCompact(total), "axis-txt", { "text-anchor": "middle", style: "font-size:19px;font-weight:800;fill:var(--ink)" });
    txt(s, cx, cy + 14, t("cur"), "tick-txt", { "text-anchor": "middle" });
    node.appendChild(s);
    var li = document.createElement("div"); li.className = "legend"; li.style.flexDirection = "column"; li.style.flexWrap = "nowrap";
    li.style.borderTop = "none"; li.style.marginInlineStart = "6px"; li.style.alignSelf = "center";
    rows.forEach(function (d, i) {
      li.insertAdjacentHTML("beforeend",
        '<span class="legend-item"><span class="legend-swatch" style="background:' + cat(i) + '"></span>' +
        esc(ellipsis(d.key, 20)) + ' <b style="margin-inline-start:4px;color:var(--ink)">' + pct(d.value / total) + "</b></span>");
    });
    node.appendChild(li);
  }

  // ---------------------------------------------------------------
  // 10. Chart: progress bullets (contract execution)
  // ---------------------------------------------------------------
  function progressBars(node, rows) {
    clear(node);
    if (!rows.length) return emptyState(node);
    var W = 780, rowH = 34, padT = 6, padB = 6, labelW = 230, valW = 150;
    var H = padT + padB + rows.length * rowH, plotW = W - labelW - valW;
    var s = svg(W, H);
    rows.forEach(function (d, i) {
      var y = padT + i * rowH, bh = 14, by = y + (rowH - bh) / 2;
      var r = d.total > 0 ? d.exec / d.total : 0;
      el("text", { x: W - 4, y: by + bh - 2, class: "axis-txt", "text-anchor": "end" }, s)
        .textContent = ellipsis(d.key, 34);
      el("rect", { x: valW, y: by, width: plotW, height: bh, rx: 4, fill: "var(--surface-3)" }, s);
      var fw = Math.max(2, r * plotW);
      var g = el("g", { class: "bar-mark" }, s);
      el("path", { d: roundRectPath(valW, by, fw, bh, 4), fill: healthColor(r) }, g);
      el("text", { x: valW - 8, y: by + bh - 2, class: "val-lbl", "text-anchor": "end" }, s).textContent = pct(r);
      hoverable(g, function () {
        return '<div class="tt-t">' + esc(d.key) + "</div>" +
          ttRow(t("contracted"), fmtFull(d.total) + " " + t("cur")) +
          ttRow(t("executed"), fmtFull(d.exec) + " " + t("cur"), healthColor(r)) +
          ttRow(t("rate"), pct(r));
      });
    });
    node.appendChild(s);
  }

  // ---------------------------------------------------------------
  // 11. Chart: stacked bars (remaining budget by sector) exec+rem
  // ---------------------------------------------------------------
  function stackedBars(node, rows) {
    clear(node);
    if (!rows.length) return emptyState(node);
    var W = 560, H = 290, padL = 46, padR = 12, padT = 12, padB = 60;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var max = niceMax(Math.max.apply(null, rows.map(function (d) { return d.total; })) || 1);
    var s = svg(W, H);
    yGrid(s, padL, padT, plotW, plotH, max, W - padR);
    var gW = plotW / rows.length, bw = Math.min(58, gW * 0.56);
    var segs = [{ key: "exec", color: "var(--c1)", label: t("executed") }, { key: "rem", color: "var(--c4)", label: t("remaining") }];
    rows.forEach(function (d, i) {
      var x = padL + i * gW + (gW - bw) / 2, yBase = padT + plotH;
      segs.forEach(function (sg) {
        var v = d[sg.key], h = (v / max) * plotH; if (h < 0.5) return;
        var y = yBase - h;
        var g = el("g", { class: "bar-mark" }, s);
        el("path", { d: roundRectPath(x, y, bw, h, 2), fill: sg.color }, g);
        yBase = y - 1.5;
        hoverable(g, function () {
          return '<div class="tt-t">' + esc(d.key) + "</div>" +
            ttRow(t("executed"), fmtFull(d.exec) + " " + t("cur"), "var(--c1)") +
            ttRow(t("remaining"), fmtFull(d.rem) + " " + t("cur"), "var(--c4)");
        });
      });
      wrapLabel(s, x + bw / 2, padT + plotH + 14, d.key, gW - 2);
    });
    node.appendChild(s);
    legend(node, segs);
  }

  // ---------------------------------------------------------------
  // 12. Chart: scatter (value vs exec %), bubble = remaining
  // ---------------------------------------------------------------
  function scatter(node, points) {
    clear(node);
    if (!points.length) return emptyState(node);
    var W = 560, H = 320, padL = 52, padR = 16, padT = 14, padB = 44;
    var plotW = W - padL - padR, plotH = H - padT - padB;
    var maxV = niceMax(Math.max.apply(null, points.map(function (p) { return p.total; })) || 1);
    var maxR = Math.max.apply(null, points.map(function (p) { return p.rem; })) || 1;
    var s = svg(W, H);
    // y grid = value
    yGrid(s, padL, padT, plotW, plotH, maxV, W - padR);
    // x axis = exec % (0..100)
    [0, 25, 50, 75, 100].forEach(function (p) {
      var x = padL + (p / 100) * plotW;
      el("line", { x1: x, x2: x, y1: padT, y2: padT + plotH, class: "grid-line", "stroke-dasharray": "2 4" }, s);
      txt(s, x, padT + plotH + 16, p + "%", "tick-txt", { "text-anchor": "middle" });
    });
    points.forEach(function (p) {
      var x = padL + p.exec * plotW, y = padT + plotH - (p.total / maxV) * plotH;
      var rr = 5 + Math.sqrt(p.rem / maxR) * 16;
      var g = el("g", { class: "bar-mark" }, s);
      el("circle", { cx: x, cy: y, r: rr, fill: healthColor(p.exec), "fill-opacity": 0.55, stroke: "var(--surface)", "stroke-width": 1.5 }, g);
      hoverable(g, function () {
        return '<div class="tt-t">' + esc(ellipsis(p.key, 40)) + "</div>" +
          ttRow(t("contracted"), fmtFull(p.total) + " " + t("cur")) +
          ttRow(t("remaining"), fmtFull(p.rem) + " " + t("cur"), "var(--c4)") +
          ttRow(t("rate"), pct(p.exec), healthColor(p.exec));
      });
    });
    node.appendChild(s);
  }

  // ---------------------------------------------------------------
  // 13. Chart: gantt timeline
  // ---------------------------------------------------------------
  function gantt(node, rows) {
    clear(node);
    if (!rows.length) return emptyState(node);
    var W = 820, rowH = 26, padT = 24, padB = 8, labelW = 250;
    var H = padT + padB + rows.length * rowH, plotW = W - labelW - 16;
    var t0 = Math.min.apply(null, rows.map(function (d) { return d.s; }));
    var t1 = Math.max.apply(null, rows.map(function (d) { return d.e; }));
    var span = (t1 - t0) || 1;
    var xAt = function (ts) { return 16 + ((ts - t0) / span) * plotW; };
    var s = svg(W, H);
    // year gridlines
    var y0 = new Date(t0).getUTCFullYear(), y1 = new Date(t1).getUTCFullYear();
    for (var yr = y0; yr <= y1 + 1; yr++) {
      var ts = Date.UTC(yr, 0, 1); if (ts < t0 || ts > t1) continue;
      var x = xAt(ts);
      el("line", { x1: x, x2: x, y1: padT - 6, y2: H - padB, class: "grid-line" }, s);
      txt(s, x, padT - 10, yr, "tick-txt", { "text-anchor": "middle" });
    }
    rows.forEach(function (d, i) {
      var y = padT + i * rowH, bh = 13, by = y + (rowH - bh) / 2;
      var x0 = xAt(d.s), x1p = xAt(d.e), bw = Math.max(3, x1p - x0);
      el("text", { x: W - 6, y: by + bh - 2, class: "axis-txt", "text-anchor": "end" }, s).textContent = ellipsis(d.key, 36);
      el("rect", { x: x0, y: by, width: bw, height: bh, rx: 4, fill: "var(--surface-3)" }, s);
      var g = el("g", { class: "bar-mark" }, s);
      el("path", { d: roundRectPath(x0, by, Math.max(3, bw * d.exec), bh, 4), fill: healthColor(d.exec) }, g);
      el("rect", { x: x0, y: by, width: bw, height: bh, rx: 4, fill: "none", stroke: healthColor(d.exec), "stroke-opacity": .5 }, s);
      hoverable(g, function () {
        return '<div class="tt-t">' + esc(d.key) + "</div>" +
          ttRow(lang === "ar" ? "البداية" : "Start", d.sd) + ttRow(lang === "ar" ? "النهاية" : "End", d.ed) +
          ttRow(t("rate"), pct(d.exec), healthColor(d.exec));
      });
    });
    node.appendChild(s);
  }

  // ---------------------------------------------------------------
  // Shared axis helpers
  // ---------------------------------------------------------------
  function niceMax(v) {
    if (v <= 0) return 1;
    var pow = Math.pow(10, Math.floor(Math.log10(v)));
    var f = v / pow;
    var nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
    return nice * pow;
  }
  function yGrid(s, padL, padT, plotW, plotH, max, xRight, intTicks) {
    var ticks = 4;
    for (var i = 0; i <= ticks; i++) {
      var v = (max / ticks) * i, y = padT + plotH - (v / max) * plotH;
      el("line", { x1: padL, x2: xRight, y1: y, y2: y, class: "grid-line" }, s);
      el("text", { x: padL - 6, y: y + 3.5, class: "tick-txt", "text-anchor": "end" }, s)
        .textContent = intTicks ? Math.round(v) : fmtCompact(v);
    }
  }
  function wrapLabel(s, cx, y, str, maxW) {
    var words = String(str).split(" "), line = "", lines = [], perChar = 5.4, maxChars = Math.max(6, Math.floor(maxW / perChar));
    words.forEach(function (w) {
      if ((line + " " + w).trim().length > maxChars) { if (line) lines.push(line); line = w; }
      else line = (line + " " + w).trim();
    });
    if (line) lines.push(line);
    lines = lines.slice(0, 2);
    lines.forEach(function (ln, i) {
      txt(s, cx, y + i * 11, ln, "tick-txt", { "text-anchor": "middle" });
    });
  }
  function localX(s, ev, W) {
    var r = s.getBoundingClientRect();
    var ratio = W / r.width;
    var xInEl = ev.clientX - r.left;
    // account for RTL: svg not mirrored, clientX increases left->right; viewBox x same
    return xInEl * ratio;
  }
  function arcPath(cx, cy, R, r, a0, a1) {
    var large = (a1 - a0) > Math.PI ? 1 : 0;
    var x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    var x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    var x2 = cx + r * Math.cos(a1), y2 = cy + r * Math.sin(a1);
    var x3 = cx + r * Math.cos(a0), y3 = cy + r * Math.sin(a0);
    return "M" + x0 + "," + y0 + " A" + R + "," + R + " 0 " + large + " 1 " + x1 + "," + y1 +
      " L" + x2 + "," + y2 + " A" + r + "," + r + " 0 " + large + " 0 " + x3 + "," + y3 + " Z";
  }
  function ellipsis(s, n) { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  // ---------------------------------------------------------------
  // 14. KPI render
  // ---------------------------------------------------------------
  function renderKPIs(rows) {
    var total = 0, exec = 0, rem = 0, contracts = new Set(), companies = new Set();
    rows.forEach(function (r) {
      total += r.totalValue; exec += r.execValue; rem += r.remValue;
      if (r.contractNo) contracts.add(r.contractNo);
      if (r.company) companies.add(r.company);
    });
    var rate = total > 0 ? exec / total : 0;
    var cards = [
      { label: t("kTotal"), value: fmtCompact(total), cur: t("cur"), accent: "var(--brand-green)", sub: fmtFull(total) + " " + t("cur") },
      { label: t("kExec"), value: fmtCompact(exec), cur: t("cur"), accent: "var(--c1)", badge: { cls: "badge-" + healthClass(rate), txt: pct(rate) } },
      { label: t("kRem"), value: fmtCompact(rem), cur: t("cur"), accent: "var(--brand-orange)", sub: pct(total > 0 ? rem / total : 0) + " " + (lang === "ar" ? "من الإجمالي" : "of total") },
      { label: t("kRate"), ring: rate },
      { label: t("kContracts"), value: fmtFull(contracts.size), accent: "var(--brand-navy)", sub: fmtFull(rows.length) + " " + t("kItems") },
      { label: t("kCompanies"), value: fmtFull(companies.size), accent: "var(--c5)" }
    ];
    var host = document.getElementById("kpiRow"); host.innerHTML = "";
    cards.forEach(function (c) {
      var d = document.createElement("div"); d.className = "kpi"; d.style.setProperty("--kpi-accent", c.accent || "var(--brand-green)");
      if (c.ring != null) {
        d.style.setProperty("--kpi-accent", healthColor(c.ring));
        d.innerHTML = '<div class="kpi-label">' + c.label + "</div>" +
          '<div class="ring" data-p="' + pct(c.ring) + '" style="--p:' + (c.ring * 100).toFixed(1) + '"></div>' +
          '<div class="kpi-value" style="margin-top:auto">' + pct(c.ring) + "</div>" +
          '<div class="kpi-sub">' + (lang === "ar" ? "الهدف 100%" : "target 100%") + "</div>";
      } else {
        d.innerHTML = '<div class="kpi-label">' + c.label + "</div>" +
          '<div class="kpi-value">' + c.value + (c.cur ? '<span class="cur">' + c.cur + "</span>" : "") + "</div>" +
          '<div class="kpi-sub">' + (c.badge ? '<span class="kpi-badge ' + c.badge.cls + '">' + c.badge.txt + "</span>" : "") + (c.sub || "") + "</div>";
      }
      host.appendChild(d);
    });
  }

  // ---------------------------------------------------------------
  // 15. Build all charts
  // ---------------------------------------------------------------
  function monthKey(d) { return d.startDate ? d.startDate.slice(0, 7) : null; }

  function renderCharts(rows) {
    // --- burn-down cumulative by month ---
    var byMonth = new Map();
    rows.forEach(function (r) { var k = monthKey(r); if (!k) return; var o = byMonth.get(k) || { c: 0, e: 0 }; o.c += r.totalValue; o.e += r.execValue; byMonth.set(k, o); });
    var months = Array.from(byMonth.keys()).sort();
    var cumC = [], cumE = [], accC = 0, accE = 0;
    months.forEach(function (m) { accC += byMonth.get(m).c; accE += byMonth.get(m).e; cumC.push(accC); cumE.push(accE); });
    cumulativeLines(document.getElementById("chartBurn"), months, [
      { label: t("cumContracted"), data: cumC, color: "var(--c3)", fill: true },
      { label: t("cumExecuted"), data: cumE, color: "var(--c1)", fill: true }
    ]);

    // --- new contracts by year (distinct contract count) ---
    var byYear = new Map();
    rows.forEach(function (r) { if (r._year == null) return; var o = byYear.get(r._year) || new Set(); if (r.contractNo) o.add(r.contractNo); byYear.set(r._year, o); });
    var yrs = []; for (var y = YMIN; y <= YMAX; y++) yrs.push({ key: y, value: (byYear.get(y) || new Set()).size });
    columns(document.getElementById("chartNewContracts"), yrs, "var(--brand-green)");

    // --- sector grouped ---
    var sectors = groupSum(rows, function (r) { return r.sector; }).sort(function (a, b) { return b.total - a.total; });
    groupedBars(document.getElementById("chartSector"), sectors.map(function (d) { return { key: d.key, contracted: d.total, executed: d.exec, remaining: d.rem }; }), [
      { key: "contracted", color: "var(--c3)", label: t("contracted") },
      { key: "executed", color: "var(--c1)", label: t("executed") },
      { key: "remaining", color: "var(--c4)", label: t("remaining") }
    ]);

    // --- exec rate by dept ---
    var depts = groupSum(rows, function (r) { return r.dept; })
      .map(function (d) { return { key: d.key, value: d.total > 0 ? d.exec / d.total : 0, total: d.total, exec: d.exec }; })
      .sort(function (a, b) { return b.value - a.value; }).slice(0, 12);
    hbar(document.getElementById("chartDept"), depts, {
      labelChars: 30, color: function (d) { return healthColor(d.value); },
      fmt: function (d) { return pct(d.value); },
      tt: function (d) { return ttRow(t("rate"), pct(d.value), healthColor(d.value)) + ttRow(t("executed"), fmtFull(d.exec) + " " + t("cur")) + ttRow(t("contracted"), fmtFull(d.total) + " " + t("cur")); }
    });

    // --- domain donut ---
    var domains = groupSum(rows, function (r) { return r.mainDomain; }).map(function (d) { return { key: d.key, value: d.exec || d.total }; }).sort(function (a, b) { return b.value - a.value; });
    donut(document.getElementById("chartDomain"), domains);

    // --- sub-domain top ---
    var subs = groupSum(rows, function (r) { return r.subDomain; }).map(function (d) { return { key: d.key, value: d.total }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 10);
    hbar(document.getElementById("chartSub"), subs, { labelChars: 24, color: function (d, i) { return cat(i); } });

    // --- top contractors by exec ---
    var cos = groupSum(rows, function (r) { return r.company; }).map(function (d) { return { key: d.key, value: d.exec, total: d.total }; }).sort(function (a, b) { return b.value - a.value; }).slice(0, 10);
    hbar(document.getElementById("chartContractors"), cos, {
      labelChars: 26, color: function () { return "var(--c1)"; },
      tt: function (d) { return ttRow(t("executed"), fmtFull(d.value) + " " + t("cur"), "var(--c1)") + ttRow(t("contracted"), fmtFull(d.total) + " " + t("cur")); }
    });

    // --- remaining by sector stacked ---
    stackedBars(document.getElementById("chartRemSector"), sectors.slice().sort(function (a, b) { return b.rem - a.rem; }).map(function (d) { return { key: d.key, exec: d.exec, rem: d.rem, total: d.total }; }));

    // --- contract progress top 12 ---
    var byContract = new Map();
    rows.forEach(function (r) {
      var k = r.contractNo || r.project; if (!k) return;
      var o = byContract.get(k) || { key: r.project || k, total: 0, exec: 0, s: null, e: null };
      o.total += r.totalValue; o.exec += r.execValue;
      if (r.startDate && (!o.s || r.startDate < o.s)) o.s = r.startDate;
      if (r.endDate && (!o.e || r.endDate > o.e)) o.e = r.endDate;
      byContract.set(k, o);
    });
    var contracts = Array.from(byContract.values());
    progressBars(document.getElementById("chartProgress"), contracts.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 12));

    // --- scatter ---
    scatter(document.getElementById("chartScatter"), contracts.map(function (c) {
      return { key: c.key, total: c.total, rem: c.total - c.exec, exec: c.total > 0 ? c.exec / c.total : 0 };
    }));

    // --- gantt ---
    var gr = contracts.filter(function (c) { return c.s && c.e; }).map(function (c) {
      return { key: c.key, sd: c.s, ed: c.e, s: Date.parse(c.s), e: Date.parse(c.e), exec: c.total > 0 ? c.exec / c.total : 0 };
    }).sort(function (a, b) { return a.s - b.s; }).slice(0, 18);
    gantt(document.getElementById("chartGantt"), gr);

    return { sectors: sectors, depts: depts, contracts: contracts, cos: cos };
  }

  // ---------------------------------------------------------------
  // 16. Insights
  // ---------------------------------------------------------------
  function renderInsights(rows, agg) {
    var host = document.getElementById("insights"); host.innerHTML = "";
    if (!rows.length) { host.innerHTML = '<div class="empty">' + t("noData") + "</div>"; return; }
    var secByRate = agg.sectors.map(function (d) { return { key: d.key, r: d.total > 0 ? d.exec / d.total : 0 }; })
      .filter(function (d) { return d.r > 0; }).sort(function (a, b) { return b.r - a.r; });
    var hi = secByRate[0], lo = secByRate[secByRate.length - 1];
    var bigRem = agg.contracts.slice().sort(function (a, b) { return (b.total - b.exec) - (a.total - a.exec); })[0];
    // overdue
    var overdue = agg.contracts.filter(function (c) { return c.e && c.e < TODAY && (c.total > 0 ? c.exec / c.total : 0) < 0.999; });
    var overdueVal = overdue.reduce(function (a, c) { return a + (c.total - c.exec); }, 0);
    // top company by #contracts
    var coCount = new Map();
    rows.forEach(function (r) { if (!r.company) return; var s = coCount.get(r.company) || new Set(); if (r.contractNo) s.add(r.contractNo); coCount.set(r.company, s); });
    var topCo = Array.from(coCount.entries()).map(function (e) { return { k: e[0], n: e[1].size }; }).sort(function (a, b) { return b.n - a.n; })[0];
    var total = 0, exec = 0; rows.forEach(function (r) { total += r.totalValue; exec += r.execValue; });
    var gap = total - exec, rate = total > 0 ? exec / total : 0;

    var cards = [];
    if (hi) cards.push({ ico: "🏆", accent: "var(--ok)", t: t("insHiExec"), v: "<b>" + esc(hi.key) + "</b> — " + pct(hi.r) });
    if (lo && lo !== hi) cards.push({ ico: "⚠️", accent: "var(--warn)", t: t("insLoExec"), v: "<b>" + esc(lo.key) + "</b> — " + pct(lo.r) });
    if (bigRem) cards.push({ ico: "💰", accent: "var(--brand-orange)", t: t("insBigRem"), v: fmtFull(bigRem.total - bigRem.exec) + " " + t("cur") + "<br><span style='font-size:12px;font-weight:600;color:var(--ink-2)'>" + esc(ellipsis(bigRem.key, 46)) + "</span>" });
    cards.push({ ico: "⏰", accent: overdue.length ? "var(--crit)" : "var(--ok)", t: t("insOverdue"), v: "<b>" + fmtFull(overdue.length) + "</b> " + t("contractsWord") + " · " + fmtFull(overdueVal) + " " + t("cur") + " " + t("atRisk") });
    if (topCo) cards.push({ ico: "🤝", accent: "var(--c5)", t: t("insTopCo"), v: "<b>" + esc(ellipsis(topCo.k, 34)) + "</b> — " + fmtFull(topCo.n) + " " + t("contractsWord") });
    cards.push({ ico: "🎯", accent: "var(--c3)", t: t("insGap"), v: fmtFull(gap) + " " + t("cur") + "<br><span style='font-size:12px;font-weight:600;color:var(--ink-2)'>" + pct(rate) + " " + (lang === "ar" ? "مكتمل" : "complete") + "</span>" });

    cards.forEach(function (c) {
      var d = document.createElement("div"); d.className = "insight"; d.style.setProperty("--ins-accent", c.accent);
      d.innerHTML = '<div class="ins-ico">' + c.ico + '</div><div class="ins-t">' + c.t + '</div><div class="ins-v">' + c.v + "</div>";
      host.appendChild(d);
    });
  }

  // ---------------------------------------------------------------
  // 17. Table
  // ---------------------------------------------------------------
  var PAGE = 40;
  function tableRows(rows) {
    var q = state.search.trim().toLowerCase();
    var r = rows;
    if (q) r = rows.filter(function (x) {
      return [x.project, x.company, x.item, x.sector, x.dept, x.subDomain].some(function (v) { return v && String(v).toLowerCase().indexOf(q) >= 0; });
    });
    var k = state.sortKey, dir = state.sortDir;
    r = r.slice().sort(function (a, b) {
      var va = a[k], vb = b[k];
      if (typeof va === "number" || typeof vb === "number") { va = va || 0; vb = vb || 0; return (va - vb) * dir; }
      return String(va || "").localeCompare(String(vb || ""), "ar") * dir;
    });
    return r;
  }
  function renderTable(rows) {
    var cols = [
      { k: "id", n: 0 }, { k: "sector", n: 1 }, { k: "dept", n: 2 }, { k: "project", n: 3 }, { k: "company", n: 4 },
      { k: "item", n: 5 }, { k: "unit", n: 6 }, { k: "totalValue", n: 7, num: 1 }, { k: "execValue", n: 8, num: 1 },
      { k: "remValue", n: 9, num: 1 }, { k: "_exec", n: 10, prog: 1 }
    ];
    var head = document.getElementById("tableHead");
    head.innerHTML = "<tr>" + cols.map(function (c) {
      var ar = state.sortKey === c.k ? (state.sortDir < 0 ? "▼" : "▲") : "";
      return '<th data-k="' + c.k + '">' + t("tCol")[c.n] + '<span class="sort-ar">' + ar + "</span></th>";
    }).join("") + "</tr>";
    Array.prototype.forEach.call(head.querySelectorAll("th"), function (th) {
      th.onclick = function () {
        var k = th.getAttribute("data-k");
        if (state.sortKey === k) state.sortDir *= -1; else { state.sortKey = k; state.sortDir = (k === "totalValue" || k === "execValue" || k === "remValue" || k === "_exec") ? -1 : 1; }
        state.page = 0; update();
      };
    });
    var all = tableRows(rows);
    document.getElementById("rowCount").textContent = fmtFull(all.length) + " " + t("rows");
    var pages = Math.max(1, Math.ceil(all.length / PAGE));
    if (state.page >= pages) state.page = pages - 1;
    var slice = all.slice(state.page * PAGE, state.page * PAGE + PAGE);
    var body = document.getElementById("tableBody");
    body.innerHTML = slice.map(function (r) {
      var ex = r._exec;
      return "<tr>" +
        "<td>" + (r.id || "") + "</td>" +
        "<td>" + esc(ellipsis(r.sector, 18)) + "</td>" +
        "<td>" + esc(ellipsis(r.dept, 22)) + "</td>" +
        "<td>" + esc(ellipsis(r.project, 34)) + "</td>" +
        "<td>" + esc(ellipsis(r.company, 26)) + "</td>" +
        "<td>" + esc(ellipsis(r.item, 30)) + "</td>" +
        "<td>" + esc(r.unit || "") + "</td>" +
        '<td class="num">' + fmtFull(r.totalValue) + "</td>" +
        '<td class="num">' + fmtFull(r.execValue) + "</td>" +
        '<td class="num">' + fmtFull(r.remValue) + "</td>" +
        '<td><span class="mini-prog"><span class="track"><span class="fill" style="width:' + (ex * 100).toFixed(0) + "%;background:" + healthColor(ex) + '"></span></span>' + pct(ex) + "</span></td>" +
        "</tr>";
    }).join("");
    document.getElementById("pgInfo").textContent = t("page") + " " + (state.page + 1) + " " + t("of") + " " + pages;
    document.getElementById("pgPrev").disabled = state.page === 0;
    document.getElementById("pgNext").disabled = state.page >= pages - 1;
    return all;
  }

  function exportCSV(rows) {
    var cols = ["id", "sector", "dept", "contractNo", "project", "company", "startDate", "endDate", "item", "unit", "totalQty", "mainDomain", "subDomain", "totalValue", "execValue", "remValue"];
    var head = cols.join(",");
    var lines = rows.map(function (r) {
      return cols.map(function (c) { var v = r[c]; v = v == null ? "" : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(",");
    });
    var csv = "﻿" + head + "\n" + lines.join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "weqaa_contracts.csv"; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }

  // ---------------------------------------------------------------
  // 18. Filters UI (multiselect + year range + segments)
  // ---------------------------------------------------------------
  function buildMultiselect(container, field) {
    var opts = groupSum(ALL, function (r) { return r[field]; }).sort(function (a, b) { return b.total - a.total; });
    container.innerHTML =
      '<button class="ms-btn" type="button"><span class="ms-lbl">' + t("allSel") + '</span><span class="chev">▼</span></button>' +
      '<div class="ms-pop"><input class="ms-search" placeholder="…" /><div class="ms-list"></div></div>';
    var btn = container.querySelector(".ms-btn"), pop = container.querySelector(".ms-pop"),
      list = container.querySelector(".ms-list"), search = container.querySelector(".ms-search");
    function paint() {
      var q = search.value.trim().toLowerCase();
      list.innerHTML = opts.filter(function (o) { return !q || o.key.toLowerCase().indexOf(q) >= 0; }).map(function (o) {
        var on = state[field].has(o.key);
        return '<label class="ms-opt"><input type="checkbox" ' + (on ? "checked" : "") + ' data-v="' + esc(o.key) + '"><span>' + esc(ellipsis(o.key, 34)) + '</span><span class="ms-n">' + o.n + "</span></label>";
      }).join("");
      Array.prototype.forEach.call(list.querySelectorAll("input"), function (cb) {
        cb.onchange = function () {
          var v = cb.getAttribute("data-v");
          if (cb.checked) state[field].add(v); else state[field].delete(v);
          syncLabel(); state.page = 0; update();
        };
      });
    }
    function syncLabel() {
      var lbl = container.querySelector(".ms-lbl"), cnt = state[field].size;
      if (!cnt) { lbl.textContent = t("allSel"); btn.querySelector(".cnt") && btn.querySelector(".cnt").remove(); }
      else {
        lbl.textContent = cnt === 1 ? Array.from(state[field])[0].slice(0, 16) + "…" : cnt + " " + t("nSel");
        if (!btn.querySelector(".cnt")) btn.insertAdjacentHTML("afterbegin", '<span class="cnt">' + cnt + "</span>");
        else btn.querySelector(".cnt").textContent = cnt;
      }
    }
    btn.onclick = function (e) {
      e.stopPropagation();
      document.querySelectorAll(".ms-pop.open").forEach(function (p) { if (p !== pop) p.classList.remove("open"); });
      pop.classList.toggle("open"); if (pop.classList.contains("open")) { paint(); search.focus(); }
    };
    pop.onclick = function (e) { e.stopPropagation(); };
    search.oninput = paint;
    container._sync = syncLabel; container._paint = paint;
    return { paint: paint, sync: syncLabel };
  }
  document.addEventListener("click", function () { document.querySelectorAll(".ms-pop.open").forEach(function (p) { p.classList.remove("open"); }); });

  function buildYearRange() {
    var host = document.getElementById("yearRange");
    host.innerHTML =
      '<span class="yr-val" id="yr0">' + YMIN + '</span>' +
      '<input type="range" id="rng0" min="' + YMIN + '" max="' + YMAX + '" value="' + YMIN + '" step="1">' +
      '<input type="range" id="rng1" min="' + YMIN + '" max="' + YMAX + '" value="' + YMAX + '" step="1">' +
      '<span class="yr-val" id="yr1">' + YMAX + '</span>';
    var r0 = host.querySelector("#rng0"), r1 = host.querySelector("#rng1");
    function sync() {
      var a = Math.min(+r0.value, +r1.value), b = Math.max(+r0.value, +r1.value);
      state.y0 = a; state.y1 = b;
      host.querySelector("#yr0").textContent = a; host.querySelector("#yr1").textContent = b;
      state.page = 0; update();
    }
    r0.oninput = sync; r1.oninput = sync;
  }

  // ---------------------------------------------------------------
  // 19. i18n apply
  // ---------------------------------------------------------------
  function applyI18n() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = t(n.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (n) { n.placeholder = t(n.getAttribute("data-i18n-ph")); });
    document.getElementById("langToggle").textContent = lang === "ar" ? "EN" : "عربي";
    document.getElementById("asOf").textContent = t("asof") + " " + TODAY;
    document.title = t("appTitle") + " — " + (lang === "ar" ? "مركز وقاء" : "WEQAA Center");
  }

  // ---------------------------------------------------------------
  // 20. Master update
  // ---------------------------------------------------------------
  function update() {
    var rows = filtered();
    renderKPIs(rows);
    var agg = renderCharts(rows);
    renderInsights(rows, agg);
    renderTable(rows);
  }

  // ---------------------------------------------------------------
  // 21. Init
  // ---------------------------------------------------------------
  function init() {
    document.getElementById("brandLogo").src = window.WEQAA_LOGO || "assets/weqaa-logo.png";
    applyI18n();

    var msSector = buildMultiselect(document.getElementById("fSector"), "sector");
    var msDomain = buildMultiselect(document.getElementById("fDomain"), "mainDomain");
    var msDept = buildMultiselect(document.getElementById("fDept"), "dept");
    var msCompany = buildMultiselect(document.getElementById("fCompany"), "company");
    buildYearRange();

    // status segments
    document.querySelectorAll("#statusSeg .seg-btn").forEach(function (b) {
      b.onclick = function () {
        document.querySelectorAll("#statusSeg .seg-btn").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active"); state.status = b.getAttribute("data-status"); state.page = 0; update();
      };
    });

    document.getElementById("resetBtn").onclick = function () {
      state.status = "all"; state.sector.clear(); state.mainDomain.clear(); state.dept.clear(); state.company.clear();
      state.y0 = YMIN; state.y1 = YMAX; state.search = ""; state.page = 0;
      document.querySelectorAll("#statusSeg .seg-btn").forEach(function (x, i) { x.classList.toggle("is-active", i === 0); });
      document.getElementById("tableSearch").value = "";
      buildYearRange();
      [document.getElementById("fSector"), document.getElementById("fDomain"), document.getElementById("fDept"), document.getElementById("fCompany")]
        .forEach(function (c) { if (c._sync) c._sync(); });
      update();
    };

    document.getElementById("tableSearch").oninput = function (e) { state.search = e.target.value; state.page = 0; renderTable(filtered()); };
    document.getElementById("pgPrev").onclick = function () { if (state.page > 0) { state.page--; renderTable(filtered()); } };
    document.getElementById("pgNext").onclick = function () { state.page++; renderTable(filtered()); };
    document.getElementById("csvBtn").onclick = function () { exportCSV(tableRows(filtered())); };

    document.getElementById("langToggle").onclick = function () { lang = lang === "ar" ? "en" : "ar"; applyI18n(); [msSector, msDomain, msDept, msCompany].forEach(function (m) { m.sync(); }); update(); };
    document.getElementById("themeToggle").onclick = function () {
      var cur = document.documentElement.getAttribute("data-theme");
      var next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      document.getElementById("themeToggle").querySelector(".theme-ico").textContent = next === "dark" ? "☀" : "☾";
      update();
    };
    window.addEventListener("resize", debounce(update, 200));

    update();
  }
  function debounce(fn, ms) { var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); }; }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
