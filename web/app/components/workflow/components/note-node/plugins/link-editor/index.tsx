import { useNoteEditorStore } from "../../editor/store";
import { LinkEditorComponent } from "./component";

type LinkEditorPluginProps = {
  containerElement: HTMLDivElement | null;
}

export const LinkEditorPlugin = ({ containerElement }: LinkEditorPluginProps) => {
  const linkAnchorElement = useNoteEditorStore(s => s.linkAnchorElement);

  if (!linkAnchorElement)
    return null;

  return (
    <LinkEditorComponent containerElement={containerElement} />
  )
}

export default LinkEditorPlugin;