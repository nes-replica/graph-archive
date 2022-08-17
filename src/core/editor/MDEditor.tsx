import React, {FC} from 'react';
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import './MDEditor.css'

export const Markdown: FC<{content: string}> = ({content}) => {
  return <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
}

export const MDEditor: FC<{content: string, onChange: (value: string) => void}> = ({content, onChange}) => {
  return (
    <div className={'mdEditor'}>
      <div className={'mdEditView'}>
      <textarea
        defaultValue={content}
        onChange={(e) => onChange(e.target.value)}
      />
      </div>
      <div className={'mdReadView'}>
        <Markdown content={content} />
      </div>
    </div>
  )
}