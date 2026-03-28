// -------------------------------------------------------------
// Используется для отображения меток полей в модальных формах.
// -------------------------------------------------------------

interface FormLabelProps {
    children: React.ReactNode;
    htmlFor?: string;
}

const CLS = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

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
            <label htmlFor={htmlFor} className={CLS}>
                {children}
            </label>
        );
    }
    return <span className={CLS}>{children}</span>;
}
