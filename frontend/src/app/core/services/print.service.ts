import { Injectable } from '@angular/core';

/**
 * Lightweight print helper: opens a clean window with the given HTML body
 * and triggers the browser print dialog. Keeps printing out of the app layout.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {

  print(title: string, body: string, orientation: 'portrait' | 'landscape' = 'portrait'): void {
    const w = window.open('', '_blank', 'width=1200,height=800');
    if (!w) return;
    const page = orientation === 'landscape'
      ? '@page { size: A4 landscape; margin: 8mm; }'
      : '@page { size: A4 portrait; margin: 10mm; }';
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        ${page}
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; padding: 16px; color: #111; }
        h2 { margin: 0 0 2px; font-size: 18px; }
        .sub { color: #555; font-size: 12px; margin-bottom: 10px; }
        table { border-collapse: collapse; width: 100%; font-size: 11px; }
        th, td { border: 1px solid #999; padding: 3px 5px; text-align: center; }
        th { background: #eee; }
        td.lib, th.lib { text-align: left; }
        .LIBRE { background: #d4edda; }
        .RESERVEE { background: #cce5ff; }
        .OCCUPEE { background: #f8d7da; }
        .BLOQUEE { background: #e2e3e5; }
        .hdr { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
        .brand { font-weight: bold; font-size: 16px; }
        .legend span { display: inline-block; margin-left: 8px; font-size: 11px; }
        .pav-title { margin: 14px 0 4px; font-size: 14px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 2px; }
        .pav-title .pav-g { float: right; font-size: 11px; font-weight: normal; color: #555; }
        .pav-femmes { font-size: 11px; color: #555; margin: 3px 0 8px; }
        table.matrix { margin-bottom: 8px; }
        table.matrix th, table.matrix td { border: 1px solid #999; padding: 2px 4px; text-align: center; }
        table.matrix th.etage { background: #f1f3f5; font-size: 11px; width: 46px; }
        table.matrix th.lab, table.matrix td.lab { width: 60px; text-align: left; color: #555; font-size: 10px; background: #fbfbfc; }
        table.matrix td.room { min-width: 78px; padding: 2px 4px; }
        table.matrix td.room .num { font-weight: bold; font-size: 12px; }
        table.matrix td.room .typ { font-size: 9px; color: #555; }
        table.matrix td.room .men { font-size: 9px; }
        table.matrix td.room .sit-tag { display: inline-block; margin-top: 2px; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 2px; }
        table.matrix .m-clean { background: #e8f6ec; }
        table.matrix .m-verif { background: #fff7e0; }
        table.matrix .m-dirty { background: #fdeaea; }
        table.matrix .m-block { background: #ececec; }
        table.matrix .sit-tag.s-recouche { background: #dbeafe; }
        table.matrix .sit-tag.s-depart { background: #f8d7da; }
        table.matrix .sit-tag.s-arrivee { background: #d1e7dd; }
        table.matrix td.s-etage { background: #d1e7dd; font-weight: bold; }
        table.matrix td.s-repos { background: #e2e3e5; }
        table.matrix td.s-perm { background: #fff3cd; font-weight: bold; }
        table.matrix td.pav-row { background: #343a40; color: #fff; font-weight: bold; text-align: left; }
        table.matrix td.sub-row { background: #e7f1ff; color: #084298; font-weight: bold; text-align: left; }
        table.matrix td.OCCUPEE { color: #fff; }
        .legend { margin-top: 12px; font-size: 11px; }
        .legend .lg { display: inline-block; padding: 2px 8px; border: 1px solid #ccc; margin-right: 6px; }
        .legend .lg.m-clean { background: #e8f6ec; }
        .legend .lg.m-verif { background: #fff7e0; }
        .legend .lg.m-dirty { background: #fdeaea; }
        .legend .lg.m-block { background: #ececec; }
        .legend .lg.s-recouche { background: #dbeafe; }
        .legend .lg.s-depart { background: #f8d7da; }
        .legend .lg.s-arrivee { background: #d1e7dd; }
      </style></head><body>${body}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  /** Open a generated PDF blob in a new tab (preview / print). */
  openBlob(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    // Revoke later so the tab has time to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    if (!w) {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      a.click();
    }
  }
}
