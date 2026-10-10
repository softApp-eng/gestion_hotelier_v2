import { Injectable } from '@angular/core';

/**
 * Lightweight print helper: opens a clean window with the given HTML body
 * and triggers the browser print dialog. Keeps printing out of the app layout.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {

  print(title: string, body: string): void {
    const w = window.open('', '_blank', 'width=1200,height=800');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
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
      </style></head><body>${body}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }
}
