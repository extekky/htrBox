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

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type HeadProps = React.HTMLAttributes<HTMLHeadingElement>;
type ParaProps = React.HTMLAttributes<HTMLParagraphElement>;

function Card({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card glass",
        className,
      )}
      {...props}
    />
  );
}
Card.displayName = "Card";

function CardHeader({ className, ...props }: DivProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  );
}
CardHeader.displayName = "CardHeader";

function CardTitle({ className, ...props }: HeadProps) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-foreground leading-none",
        className,
      )}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

function CardDescription({ className, ...props }: ParaProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
CardDescription.displayName = "CardDescription";

function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}
CardContent.displayName = "CardContent";

function CardFooter({ className, ...props }: DivProps) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}
CardFooter.displayName = "CardFooter";

function CardAction({ className, ...props }: DivProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props} />
  );
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
