import {
  createContext,
  useContext,
  type CSSProperties,
  type ReactNode,
} from "react";

const BASE_Z_INDEX = 40;
const LAYER_STEP = 20;
const CONTENT_OFFSET = 10;

// Храним глубину текущего модального стека.
// 0 — обычное окно, 1+ — окно, открытое поверх другого окна.
const ModalStackContext = createContext(0);

// Прокидывает дочерним модалкам следующую глубину стека даже через Radix Portal.
// React context сохраняется через portal, поэтому вложенный ConfirmDialog
// автоматически окажется выше родительского Modal.
export function ModalStackProvider({
  depth,
  children,
}: {
  depth: number;
  children: ReactNode;
}) {
  return (
    <ModalStackContext.Provider value={depth}>
      {children}
    </ModalStackContext.Provider>
  );
}

// Возвращает z-index для оверлея и панели текущего окна.
// Между слоями оставлен шаг 20, чтобы overlay дочерней модалки перекрывал
// content родительской: parent content 50, child overlay 60, child content 70.
export function useModalStackLayer() {
  const depth = useContext(ModalStackContext);
  const base = BASE_Z_INDEX + depth * LAYER_STEP;

  return {
    nextDepth: depth + 1,
    overlayStyle: { zIndex: base } satisfies CSSProperties,
    contentStyle: { zIndex: base + CONTENT_OFFSET } satisfies CSSProperties,
  };
}
