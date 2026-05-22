import { useNoteEditorStore } from "../../editor/store";
import { LinkEditorComponent } from "./component";
import { useOpenLink } from "./hooks";

type LinkEditorPluginProps = {
  containerElement: HTMLDivElement | null;
}

export const LinkEditorPlugin = ({ containerElement }: LinkEditorPluginProps) => {
  const linkAnchorElement = useNoteEditorStore(s => s.linkAnchorElement);
  useOpenLink();

  if (!linkAnchorElement)
    return null;

  return (
    <LinkEditorComponent containerElement={containerElement} />
  )
}

export default LinkEditorPlugin;