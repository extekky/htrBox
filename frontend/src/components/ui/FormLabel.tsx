// -------------------------------------------------------------
// Используется для отображения меток полей в модальных формах.
// -------------------------------------------------------------

import { styles } from "@/styles";

interface FormLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

const s = styles.formLabel;

/**
 * Компонент для отображения метки формы.
 * Может быть связан с элементом формы через `htmlFor` или отображаться как обычный текст.
 *
 * @param {FormLabelProps} props - Свойства компонента.
 * @param {React.ReactNode} props.children - Содержимое метки.
 * @param {string} [props.htmlFor] - ID элемента формы, с которым связана метка.
 */
export function FormLabel({ children, htmlFor }: FormLabelProps) {
  if (htmlFor) {
    return (
      <label htmlFor={htmlFor} className={s.root}>
        {children}
      </label>
    );
  }
  return <span className={s.root}>{children}</span>;
}
