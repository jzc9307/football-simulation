// Popups may close in a different order than they opened. Only the last owner
// releases the page; never restore another popup's temporary "hidden" value.
const locks = new WeakMap();
export function lockPageScroll(doc) {
  let entry = locks.get(doc);
  if (!entry) {
    entry = { count: 0, overflow: doc.body.style.overflow };
    locks.set(doc, entry);
  }
  entry.count++;
  doc.body.style.overflow = "hidden";
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--entry.count === 0) {
      doc.body.style.overflow = entry.overflow;
      locks.delete(doc);
    }
  };
}
