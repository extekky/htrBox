/**
 * Компонент Card — составная карточка для группировки контента.
 *
 * Состоит из независимых частей, которые можно комбинировать по необходимости:
 *   - Card          — корневой контейнер с рамкой и стеклянным фоном
 *   - CardHeader    — шапка карточки, обычно содержит заголовок и описание
 *   - CardTitle     — заголовок карточки
 *   - CardDescription — подзаголовок / краткое описание
 *   - CardContent   — основное содержимое
 *   - CardFooter    — нижняя часть, обычно содержит кнопки действий
 *   - CardAction    — группа кнопок или элементов управления
 */

import * as React from "react";
import { cn } from "@/lib/cn";
import { styles } from "@/styles";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type HeadProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParaProps = React.HTMLAttributes<HTMLParagraphElement>;

const s = styles.card;

function Card({ className, ...props }: DivProps) {
  return <div className={cn(s.root, className)} {...props} />;
}
Card.displayName = "Card";

function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn(s.header, className)} {...props} />;
}
CardHeader.displayName = "CardHeader";

function CardTitle({ className, ...props }: HeadProps) {
  return <h3 className={cn(s.title, className)} {...props} />;
}
CardTitle.displayName = "CardTitle";

function CardDescription({ className, ...props }: ParaProps) {
  return <p className={cn(s.description, className)} {...props} />;
}
CardDescription.displayName = "CardDescription";

function CardContent({ className, ...props }: DivProps) {
  return <div className={cn(s.content, className)} {...props} />;
}
CardContent.displayName = "CardContent";

function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn(s.footer, className)} {...props} />;
}
CardFooter.displayName = "CardFooter";

function CardAction({ className, ...props }: DivProps) {
  return <div className={cn(s.action, className)} {...props} />;
}
CardAction.displayName = "CardAction";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
};
