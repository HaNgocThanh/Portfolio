import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

function elementProps<T extends { node?: unknown }>(props: T) {
  const { node, ...rest } = props
  void node
  return rest
}

const components: Components = {
  p: props => <p className="mb-2 last:mb-0" {...elementProps(props)} />,
  strong: props => <strong className="font-bold text-text-primary" {...elementProps(props)} />,
  em: props => <em className="italic" {...elementProps(props)} />,
  ul: props => <ul className="list-disc ml-4 mb-2 space-y-1" {...elementProps(props)} />,
  ol: props => <ol className="list-decimal ml-4 mb-2 space-y-1" {...elementProps(props)} />,
  li: props => <li {...elementProps(props)} />,
  a: props => <a className="text-text-primary underline hover:opacity-80 font-bold" target="_blank" rel="noopener noreferrer" {...elementProps(props)} />,
  table: props => <div className="w-full overflow-x-auto my-3 pb-1 custom-scrollbar"><table className="w-full text-left border-collapse border border-text-secondary/20 whitespace-nowrap" {...elementProps(props)} /></div>,
  th: props => <th className="border border-text-secondary/20 px-3 py-2 bg-text-secondary/10 font-bold" {...elementProps(props)} />,
  td: props => <td className="border border-text-secondary/20 px-3 py-2" {...elementProps(props)} />,
  pre: props => <pre className="bg-text-primary text-background p-3 rounded-xl overflow-x-auto custom-scrollbar text-xs my-2 font-mono" {...elementProps(props)} />,
  code: props => {
    const { className, children, ...rest } = elementProps(props)
    const isInline = !/language-(\w+)/.test(className || "") && !String(children).includes("\n")
    return isInline
      ? <code className="bg-thirdary/30 px-1.5 py-0.5 rounded text-xs text-text-primary font-mono font-bold" {...rest}>{children}</code>
      : <code className={className} {...rest}>{children}</code>
  },
  blockquote: props => <blockquote className="border-l-4 border-thirdary pl-3 my-2 italic text-text-secondary" {...elementProps(props)} />,
}

export default function ChatMarkdown({ text }: { text: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{text}</ReactMarkdown>
}

