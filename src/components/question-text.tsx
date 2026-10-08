// Render only inline code, without interpreting HTML from question content.
export function QuestionText({ text }: { text: string }) {
  return text.split(/(`[^`]+`)/g).map((part, index) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={index} className="question-code">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  )
}
