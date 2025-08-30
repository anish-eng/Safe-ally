import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportJournalOptionA_FriendlyLinks({
  entries = [],
  appName="Safe Ally"
  
}) {
  const USER_TZ =
    (typeof Intl !== "undefined" &&
      Intl.DateTimeFormat().resolvedOptions().timeZone) ||
    "UTC";

  const nowStamp = () =>
    new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const toDate = (x) =>
    x?.toDate ? x.toDate() : x instanceof Date ? x : new Date(x);

  const fmtDateLocal = (d) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: USER_TZ,
    }).format(d);

  const fmtTimeLocal = (d) =>
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: USER_TZ,
    }).format(d);
  const sanitizeForExcel = (s) =>
    typeof s === "string" && /^[=+\-@]/.test(s) ? "'" + s : s;
const buildAlias = (type, index, dateLocal) => {
    const base = type === "image" ? "Image" : type === "video" ? "Video" : "Audio";
    const idx  = (type === "image" || type === "video") && index ? ` ${index}` : "";
    return `${base}${idx} — ${dateLocal || ""}`.trim();
  };
  
  const normalize = () => {
    const entriesFlat = [];
    const mediaFlat   = []; // one row per file (image/video/audio)
  
    let maxImages = 0;
    let maxVideos = 0;
  
    for (const e of entries) {
      const d = e?.createdAt ? toDate(e.createdAt) : null;
    //   const date_iso   = d ? d.toISOString() : "";
      const date_local = d ? `${fmtDateLocal(d)} at ${fmtTimeLocal(d)}` : "";
      const audio_url  = e?.audio || "";
      const media      = Array.isArray(e?.media) ? e.media : [];
  
      // Build per-entry arrays of images/videos with aliases
      let imgIdx = 0, vidIdx = 0;
      const images = [];
      const videos = [];
  
      for (const m of media) {
        if (m?.type === "image" && m.url) {
          imgIdx += 1;
          images.push({ url: m.url, alias: buildAlias("image", imgIdx, date_local) });
          mediaFlat.push({ type: "image", url: m.url, alias: images[images.length - 1].alias });
        }
      }
      for (const m of media) {
        if (m?.type === "video" && m.url) {
          vidIdx += 1;
          videos.push({ url: m.url, alias: buildAlias("video", vidIdx, date_local) });
          mediaFlat.push({ type: "video", url: m.url, alias: videos[videos.length - 1].alias });
        }
      }
      if (audio_url) {
        const alias = buildAlias("audio", null, date_local);
        mediaFlat.push({ type: "audio", url: audio_url, alias });
      }
  
      maxImages = Math.max(maxImages, images.length);
      maxVideos = Math.max(maxVideos, videos.length);
  
      entriesFlat.push({
        // date_iso,
        date_local,
        timezone: USER_TZ,
        text: sanitizeForExcel(e?.text ?? ""),
        audio_url,
        audio_alias: audio_url ? buildAlias("audio", null, date_local) : "",
        images,    // [{ url, alias }]
        videos,    // [{ url, alias }]
        image_count: images.length,
        video_count: videos.length,
      });
      console.log("images",images)
      console.log('videos',videos)
      console.log("entriesflat",entriesFlat)
      console.log("mediaflat",mediaFlat)
    }
 

    // newest first
    entriesFlat.sort((a, b) => (a.date_iso < b.date_iso ? 1 : -1));
    return { entriesFlat, mediaFlat, maxImages, maxVideos };
  };
  

  /* =====================  EXCEL  ===================== */
  const exportExcel = () => {
    const { entriesFlat, mediaFlat, maxImages, maxVideos } = normalize();
  
    // ---- Build ENTRIES headers dynamically ----
    const headersEntries = [
    //   "date_iso",
      "date_local",
      "timezone",
      "text",
      "audio", // clickable alias if present
      // Image 1..N
      ...Array.from({ length: maxImages }, (_, i) => `image_${i + 1}`),
      // Video 1..M
      ...Array.from({ length: maxVideos }, (_, i) => `video_${i + 1}`),
      "image_count",
      "video_count",
    ];
  
    // ---- Build ENTRIES rows (put aliases in the cells) ----
    const rowsEntries = entriesFlat.map((r) => {
      const base = [
        // r.date_iso || "",
        r.date_local || "",
        r.timezone || "",
        r.text || "",
        r.audio_alias || "", // (hyperlink attached after)
      ];
  
      // images aliases for this entry
      const imgCells = Array.from({ length: maxImages }, (_, i) => r.images[i]?.alias || "");
      // videos aliases
      const vidCells = Array.from({ length: maxVideos }, (_, i) => r.videos[i]?.alias || "");
  
      return [
        ...base,
        ...imgCells,
        ...vidCells,
        Number(r.image_count || 0),
        Number(r.video_count || 0),
      ];
    });
    const wsEntries = utils.aoa_to_sheet([headersEntries, ...rowsEntries]);
    const colIndex = (name) => headersEntries.indexOf(name);
    const audioCol = colIndex("audio");
    const imgStart = audioCol + 1;
    const vidStart = imgStart + maxImages;
  
    // Audio links
    entriesFlat.forEach((r, i) => {
      if (!r.audio_url || !r.audio_alias) return;
      const ref = utils.encode_cell({ c: audioCol, r: i + 1 }); // +1 header
      const cell = wsEntries[ref];
      if (cell) {
        cell.l = { Target: r.audio_url };
        cell.t = "s";
        cell.v = r.audio_alias;
      }
    });
  
    // Image links
    entriesFlat.forEach((r, row) => {
      r.images.forEach((img, k) => {
        const c = imgStart + k;
        const ref = utils.encode_cell({ c, r: row + 1 });
        const cell = wsEntries[ref];
        if (cell) {
          cell.l = { Target: img.url };
          cell.t = "s";
          cell.v = img.alias;
        }
      });
    });
  
    // Video links
    entriesFlat.forEach((r, row) => {
      r.videos.forEach((vid, k) => {
        const c = vidStart + k;
        const ref = utils.encode_cell({ c, r: row + 1 });
        const cell = wsEntries[ref];
        if (cell) {
          cell.l = { Target: vid.url };
          cell.t = "s";
          cell.v = vid.alias;
        }
      });
    });
    wsEntries["!cols"] = [
    //   { wch: 22 }, // date_iso
      { wch: 28 }, // date_local
      { wch: 16 }, // timezone
      { wch: 60 }, // text
      { wch: 28 }, // audio alias
      ...Array.from({ length: maxImages }, () => ({ wch: 28 })), // images
      ...Array.from({ length: maxVideos }, () => ({ wch: 28 })), // videos
      { wch: 12 }, // image_count
      { wch: 12 }, // video_count
    ];
  
    // ---- MEDIA sheet (type + alias link; still useful as a flat index) ----
    const headersMedia = ["type", "resource (click to open)"];
    const rowsMedia = mediaFlat.map((m) => [m.type || "", m.alias || "Open resource"]);
    const wsMedia = utils.aoa_to_sheet([headersMedia, ...rowsMedia]);
    const linkColIndex = 1; // alias column
    mediaFlat.forEach((m, i) => {
      if (!m?.url) return;
      const ref = utils.encode_cell({ c: linkColIndex, r: i + 1 }); // +1 header
      const cell = wsMedia[ref];
      if (cell) {
        cell.l = { Target: m.url };
        cell.t = "s";
        cell.v = m.alias || "Open resource";
      }
    });
    wsMedia["!cols"] = [{ wch: 10 }, { wch: 40 }];
    const wb = utils.book_new();
    utils.book_append_sheet(wb, wsEntries, "Entries");
    utils.book_append_sheet(wb, wsMedia, "Media");
    writeFile(wb, `"${appName}-"export-${nowStamp()}.xlsx`);
  };
  /* ======================  PDF  ====================== */
  const exportPdf = () => {
    const { entriesFlat, maxImages, maxVideos } = normalize();
    const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  
    const USER_TZ =
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat().resolvedOptions().timeZone) || "UTC";
  
    doc.setFontSize(16);
    doc.text(`${appName} — Journal Export`, 30, 34);
    const headers = [
    //   "date_iso",
      "date_local",
      "timezone",
      "text",
      "audio",
      // image_1 .. image_N
      ...Array.from({ length: maxImages }, (_, i) => `image_${i + 1}`),
      // video_1 .. video_M
      ...Array.from({ length: maxVideos }, (_, i) => `video_${i + 1}`),
      "image_count",
      "video_count",
    ];
    const body = entriesFlat.map((r) => {
      const base = [
        r.date_local || "",
        r.timezone || "",
        r.text || "",
        r.audio_alias || "", 
      ];
      const imgs = Array.from({ length: maxImages }, (_, i) => r.images[i]?.alias || "");
      const vids = Array.from({ length: maxVideos }, (_, i) => r.videos[i]?.alias || "");
      return [
        ...base,
        ...imgs,
        ...vids,
        String(r.image_count || 0),
        String(r.video_count || 0),
      ];
    });
    const idxOf = (name) => headers.indexOf(name);
    const AUDIO_COL = idxOf("audio");
    const IMG_START = AUDIO_COL + 1;
    const VID_START = IMG_START + maxImages;
    const IMG_COUNT_COL = VID_START + maxVideos;
    const VID_COUNT_COL = IMG_COUNT_COL + 1;
    const CW = {
    //   date_iso: 70,
      date_local: 90,
      timezone: 90,
      text: 160,
      audio: 70,
      media: 70,     
      count: 60,
    };
    const columnStyles = {
      [idxOf("date_local")]: { cellWidth: CW.date_local },
      [idxOf("timezone")]:   { cellWidth: CW.timezone, halign: "center" },
      [idxOf("text")]:       { cellWidth: CW.text },
      [AUDIO_COL]:           { cellWidth: CW.audio,  halign: "center", textColor: [37,99,235] },
      [IMG_COUNT_COL]:       { cellWidth: CW.count,  halign: "center" },
      [VID_COUNT_COL]:       { cellWidth: CW.count,  halign: "center" },
    };
    for (let i = 0; i < maxImages; i++) {
      columnStyles[IMG_START + i] = { cellWidth: CW.media, textColor: [37,99,235] };
    }
    for (let i = 0; i < maxVideos; i++) {
      columnStyles[VID_START + i] = { cellWidth: CW.media, textColor: [37,99,235] };
    }
    autoTable(doc, {
      startY: 48,
      head: [headers],
      body,
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      columnStyles,
      margin: { left: 30, right: 30 },
      didDrawCell: (data) => {
        if (data.section !== "body") return;
        const row = data.row.index;
        const col = data.column.index;
        const cell = data.cell;
        if (!cell || typeof cell.x !== "number") return;
  
        const linkCell = (url) => {
          if (!url) return;
          const x = cell.x + 2, y = cell.y + 2;
          const w = cell.width - 4, h = cell.height - 4;
          doc.link(x, y, w, h, { url });
        };
        if (col === AUDIO_COL) {
          linkCell(entriesFlat[row]?.audio_url);
        } else if (col >= IMG_START && col < IMG_START + maxImages) {
          const k = col - IMG_START;
          linkCell(entriesFlat[row]?.images[k]?.url);
        } else if (col >= VID_START && col < VID_START + maxVideos) {
          const k = col - VID_START;
          linkCell(entriesFlat[row]?.videos[k]?.url);
        }
      },
      didDrawPage: () => {
        const p = doc.internal.pageSize;
        const h = p.getHeight();
        doc.setFontSize(8);
        doc.text(`Generated in ${USER_TZ}`, 30, h - 18);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, p.getWidth() - 80, h - 18);
      },
    });
    doc.save(`${appName}-export-${nowStamp()}.pdf`);
  };
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
  {/* Excel — #1e3a8a */}
  <button
    onClick={exportExcel}
    className="w-full sm:w-auto inline-flex items-center gap-2 rounded-2xl
               px-5 py-3 text-sm sm:text-base font-semibold text-white
               bg-[#1e3a8a] hover:bg-[#163b78] active:bg-[#102a5c]
               shadow-lg ring-1 ring-[#1e3a8a]/40
               focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/60
               disabled:opacity-50 disabled:cursor-not-allowed transition"
    title="Download Excel"
  >
    Export Excel
  </button>
  <button
    onClick={exportPdf}
    className="w-full sm:w-auto inline-flex items-center gap-2 rounded-2xl
               px-5 py-3 text-sm sm:text-base font-semibold text-white
               bg-[#8789C0] hover:bg-[#787ab2] active:bg-[#6b6da6]
               shadow-lg ring-1 ring-[#8789C0]/40
               focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8789C0]/60
               disabled:opacity-50 disabled:cursor-not-allowed transition"
    title="Download PDF"
  >
    Export PDF
  </button>
</div>
  );
}
