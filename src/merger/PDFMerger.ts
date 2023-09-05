import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFNull, PDFNumber, PDFObject, PDFRef } from 'pdf-lib';
import * as fs from 'fs';
import { WrokResult } from '../workers/Crawler';

export type MergeData = WrokResult[];

function createOutlineItem(
  doc: PDFDocument,
  title: string,
  parent: PDFObject,
  nextOrPrev: PDFRef,
  page: PDFRef,
  isLast = false,
) {
  const array = PDFArray.withContext(doc.context);
  array.push(page);
  array.push(PDFName.of('XYZ'));
  array.push(PDFNull);
  array.push(PDFNull);
  array.push(PDFNull);
  const map = new Map();
  map.set(PDFName.Title, PDFHexString.fromText(title));
  map.set(PDFName.Parent, parent);
  map.set(PDFName.of(isLast ? 'Prev' : 'Next'), nextOrPrev);
  map.set(PDFName.of('Dest'), array);

  return PDFDict.fromMapWithContext(map, doc.context);
}

export async function merge(output: string, data: MergeData) {
  for (const result of data) {
    for (const entry of result.entries) {
      const doc = await PDFDocument.create();
      const titleMap = new Map<number, string>();
      const refs: PDFRef[] = [];
      for (const task of entry.tasks) {
        const ext = await PDFDocument.load(task.data);
        const pages = await doc.copyPages(ext, ext.getPageIndices());
        for (const page of pages) {
          const { width } = page.getSize();
          page.drawText(`${doc.getPageCount() + 1}`, { size: 14, x: (width * 11) / 12, y: (width * 1) / 24 });
          doc.addPage(page);
        }
        titleMap.set(pages[0].ref.objectNumber, task.meta.title);
        refs.push(pages[0].ref);
      }
      const outlinesDictRef = doc.context.nextRef();
      const outlinesDistMap = new Map();
      outlinesDistMap.set(PDFName.Type, PDFName.of('Outlines'));
      let nextRef: PDFRef;
      let prevRef: PDFRef;
      refs.forEach((ref, index) => {
        const outlineRef = nextRef ?? doc.context.nextRef();
        nextRef = doc.context.nextRef();
        const isLast = index === refs.length - 1;

        if (index === 0) {
          outlinesDistMap.set(PDFName.of('First'), outlineRef);
        }
        if (isLast) {
          outlinesDistMap.set(PDFName.of('Last'), outlineRef);
          outlinesDistMap.set(PDFName.of('Count'), PDFNumber.of(refs.length));
        }

        const outlineItem = createOutlineItem(
          doc,
          titleMap.get(ref.objectNumber) ?? '',
          outlinesDictRef,
          isLast ? prevRef : nextRef,
          ref,
          isLast,
        );
        doc.context.assign(outlineRef, outlineItem);
        prevRef = outlineRef;
      });

      doc.catalog.set(PDFName.of('Outlines'), outlinesDictRef);
      const outlineDict = PDFDict.fromMapWithContext(outlinesDistMap, doc.context);
      doc.context.assign(outlinesDictRef, outlineDict);
      fs.writeFileSync(output, await doc.save());
    }
  }
}
