import { State } from './state'
import * as drag from './drag'
import * as draw from './draw'
import { drop } from './drop'
import { isRightButton } from './util'
import * as cg from './types'

type MouchBind = (e: cg.MouchEvent) => void;
type StateMouchBind = (d: State, e: cg.MouchEvent) => void;

export function bindBoard(s: State): void {

  if (s.viewOnly) return;

  const boardEl = s.dom.elements.board,
  onStart = startDragOrDraw(s);

  // Cannot be passive, because we prevent touch scrolling and dragging of
  // selected elements.
  boardEl.addEventListener('touchstart', onStart as EventListener, { passive: false });
  boardEl.addEventListener('mousedown', onStart as EventListener, { passive: false });

  if (s.disableContextMenu || s.drawable.enabled) {
    boardEl.addEventListener('contextmenu', e => e.preventDefault());
  }
}

// returns the unbind function
export function bindDocument(s: State, redrawAll: cg.Redraw): cg.Unbind {

  const unbinds: cg.Unbind[] = [];

  if (!s.dom.relative && s.resizable) {
    const onResize = () => {
      s.dom.bounds.clear();
      requestAnimationFrame(redrawAll);
    };
    unbinds.push(unbindable(document.body, 'chessground.resize', onResize));
  }

  if (!s.viewOnly) {

    const onmove: MouchBind = dragOrDraw(s, drag.move, draw.move);
    const onend: MouchBind = dragOrDraw(s, drag.end, draw.end);

    for (const ev of ['touchmove', 'mousemove']) unbinds.push(unbindable(document, ev, onmove));
    for (const ev of ['touchend', 'mouseup']) unbinds.push(unbindable(document, ev, onend));

    const onScroll = () => s.dom.bounds.clear();
    unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
    unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
  }

  return () => unbinds.forEach(f => f());
}

function unbindable(el: EventTarget, eventName: string, callback: MouchBind, options?: any): cg.Unbind {
  el.addEventListener(eventName, callback as EventListener, options);
  return () => el.removeEventListener(eventName, callback as EventListener, options);
}

function startDragOrDraw(s: State): MouchBind {
  return e => {
    if (s.draggable.current) drag.cancel(s);
    else if (s.drawable.current) draw.cancel(s);
    else if (e.shiftKey || isRightButton(e)) { if (s.drawable.enabled) draw.start(s, e); }
    else if (!s.viewOnly) {
      if (s.dropmode.active) drop(s, e);
      else drag.start(s, e);
    }
  };
}

function dragOrDraw(s: State, withDrag: StateMouchBind, withDraw: StateMouchBind): MouchBind {
  return e => {
    if (e.shiftKey || isRightButton(e)) { if (s.drawable.enabled) withDraw(s, e); }
    else if (!s.viewOnly) withDrag(s, e);
  };
}
